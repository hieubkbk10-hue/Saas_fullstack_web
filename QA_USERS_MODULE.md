# 🔍 QA Review Report - Users Module

**Date:** 2026-01-08  
**Branch:** qa/users-module  
**Reviewer:** Droid AI  
**Status:** ✅ ALL ISSUES FIXED

## 📊 Summary
- **Files reviewed:** 6 (4 frontend pages + 2 convex files)
- **Issues found:** 10
- **Issues fixed:** 10 ✅
- **Severity breakdown:** 🔴 Critical: 2 | 🟠 High: 4 | 🟡 Medium: 3 | 🟢 Low: 1

---

## 🔴 Critical Issues

### USR-001: count() query fetches ALL records để đếm
- **File:** `convex/users.ts:44-49`
- **Type:** Database Performance
- **Description:** Query `count()` fetch toàn bộ users rồi đếm `.length`, gây tốn bandwidth nghiêm trọng
- **Code:**
```typescript
export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect(); // ❌ THẢM HỌA!
    return users.length;
  },
});
```
- **Impact:** Với 10K users × 1KB × 1000 requests/day = 10GB bandwidth/day
- **Fix:** 
  1. Tạo counter table `userStats` với key "total"
  2. Update counter khi create/delete user
  3. Query counter thay vì fetch all

---

### USR-002: roles.count() cũng có vấn đề tương tự  
- **File:** `convex/roles.ts:149-155`
- **Type:** Database Performance
- **Description:** Tương tự USR-001, fetch ALL roles để đếm
- **Code:**
```typescript
export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const roles = await ctx.db.query("roles").collect(); // ❌
    return roles.length;
  },
});
```
- **Fix:** Tương tự, dùng counter table `roleStats`

---

## 🟠 High Priority Issues

### USR-003: listAll() không có limit - memory overflow risk
- **File:** `convex/users.ts:34-40` và `convex/roles.ts:27-33`
- **Type:** Database Performance / Security
- **Description:** Query `listAll()` không có limit, nếu có 10K+ users sẽ fetch hết gây crash
- **Code:**
```typescript
export const listAll = query({
  args: {},
  returns: v.array(userDoc),
  handler: async (ctx) => {
    return await ctx.db.query("users").collect(); // ❌ No limit
  },
});
```
- **Fix:** 
  1. Thêm `.take(500)` làm safety limit
  2. Hoặc deprecate listAll(), force dùng pagination

---

### USR-004: N+1 trong roles.getStats() và getUserCountByRole()
- **File:** `convex/roles.ts:157-193`
- **Type:** Database Performance  
- **Description:** Fetch ALL roles + ALL users, sau đó loop để count - O(n*m) complexity
- **Code:**
```typescript
export const getUserCountByRole = query({
  handler: async (ctx) => {
    const roles = await ctx.db.query("roles").collect();
    const users = await ctx.db.query("users").collect(); // Fetch ALL users
    const result = roles.map(role => {
      const userCount = users.filter(u => u.roleId === role._id).length; // O(n*m)
    });
  },
});
```
- **Fix:**
```typescript
// ✅ Use Map for O(1) lookup
const userCountMap = new Map<string, number>();
users.forEach(u => {
  const count = userCountMap.get(u.roleId) || 0;
  userCountMap.set(u.roleId, count + 1);
});
const result = roles.map(role => ({
  roleId: role._id,
  roleName: role.name,
  userCount: userCountMap.get(role._id) || 0,
}));
```

---

### USR-005: Bulk delete gọi API tuần tự
- **File:** `app/admin/users/page.tsx:88-96`
- **Type:** Performance
- **Description:** Xóa nhiều users bằng loop tuần tự, không dùng batch
- **Code:**
```typescript
const handleBulkDelete = async () => {
  for (const id of selectedIds) {
    await deleteUser({ id }); // ❌ Sequential - N API calls
  }
};
```
- **Fix:**
```typescript
// ✅ Parallel deletion
await Promise.all(selectedIds.map(id => deleteUser({ id })));
```

---

### USR-006: handleSave() lưu tuần tự từng item
- **File:** `app/system/modules/users/page.tsx:98-120`
- **Type:** Performance  
- **Description:** Lưu features, fields, settings tuần tự - slow UX
- **Fix:** Batch mutations với `Promise.all()` hoặc tạo single batch mutation

---

## 🟡 Medium Priority Issues

### USR-007: Thiếu validation email format ở frontend
- **File:** `app/admin/users/create/page.tsx:44-50`
- **Type:** Bug / UX
- **Description:** Chỉ dùng `type="email"` HTML validation, không validate pattern phức tạp như + symbols
- **Fix:** Thêm regex validation:
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  toast.error('Email không hợp lệ');
  return;
}
```

---

### USR-008: clearUsersData() xóa tuần tự
- **File:** `convex/seed.ts` (clearUsersData mutation)
- **Type:** Performance
- **Description:** Xóa users và roles bằng loop tuần tự
- **Code:**
```typescript
export const clearUsersData = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id); // ❌ Sequential
    }
  },
});
```
- **Fix:**
```typescript
// ✅ Parallel deletion
const users = await ctx.db.query("users").collect();
await Promise.all(users.map(u => ctx.db.delete(u._id)));
```

---

### USR-009: Không có loading state khi handleReseed()
- **File:** `app/admin/users/page.tsx:98-107`
- **Type:** UX
- **Description:** Reset data không show loading feedback, user không biết progress
- **Fix:** Thêm `toast.loading()` và `toast.dismiss()` như các handlers khác

---

## 🟢 Suggestions (Low)

### USR-010: Console.log trong seed.ts
- **File:** `convex/seed.ts` (multiple locations)
- **Type:** Code Quality
- **Description:** Có console.log debug trong production code
- **Fix:** Xóa hoặc wrap trong `process.env.NODE_ENV !== 'production'`

---

## 🗄️ Database Performance Summary

| Metric | Value |
|--------|-------|
| Queries reviewed | 12 |
| N+1 patterns found | 2 |
| Missing indexes | 0 ✅ |
| Anti-patterns | 4 |
| Estimated daily bandwidth (10K users) | ~10GB (if count called frequently) |

---

## 🧪 Test Coverage

- Unit tests: ❌ Not found
- Integration tests: ❌ Not found
- E2E tests: ❌ Not found
- **Recommendation:** Add tests for critical paths (create user, delete user, role assignment)

---

## ✅ Positive Observations

1. ✅ Schema có đầy đủ indexes (`by_email`, `by_role_status`, `by_status`)
2. ✅ Mutation `create()` check duplicate email trước khi insert
3. ✅ `roles.remove()` kiểm tra users đang dùng role trước khi xóa
4. ✅ Frontend có pagination với `usersPerPage` từ settings
5. ✅ `ModuleGuard` component cho authorization
6. ✅ Proper error handling với toast notifications
7. ✅ Dùng TypeScript với type safety
8. ✅ Convex validators cho input validation

---

## 📋 Fix Status

### 1. CRITICAL - ✅ DONE
- [x] USR-001: Tạo userStats counter table
- [x] USR-002: Tạo roleStats counter table

### 2. HIGH - ✅ DONE
- [x] USR-003: Thêm limit cho listAll() 
- [x] USR-004: Optimize getUserCountByRole() với Map
- [x] USR-005: Dùng Promise.all() cho bulk delete (bulkRemove mutation)
- [x] USR-006: Batch save cho system config

### 3. MEDIUM - ✅ DONE
- [x] USR-007: Email validation regex
- [x] USR-008: Parallel deletion trong clearUsersData()
- [x] USR-009: Loading state cho handleReseed()

### 4. LOW - ✅ DONE
- [x] USR-010: Cleanup console.log

---

## 📝 Implementation Notes

### Counter Table Implementation (USR-001, USR-002)

**Schema addition:**
```typescript
// In schema.ts
userStats: defineTable({
  key: v.string(), // "total", "Active", "Inactive", "Banned"
  count: v.number(),
}).index("by_key", ["key"]),

roleStats: defineTable({
  key: v.string(), // "total", "system", "custom"  
  count: v.number(),
}).index("by_key", ["key"]),
```

**Update triggers:**
- On user create: increment userStats["total"] and userStats[status]
- On user delete: decrement userStats["total"] and userStats[status]
- On user status change: adjust status counters
- Same pattern for roles

---

## 📂 Files Reviewed

1. `app/system/modules/users/page.tsx` - System config page
2. `app/admin/users/page.tsx` - Users list page
3. `app/admin/users/create/page.tsx` - Create user page  
4. `app/admin/users/[id]/edit/page.tsx` - Edit user page
5. `convex/users.ts` - Users queries & mutations
6. `convex/roles.ts` - Roles queries & mutations
7. `convex/seed.ts` - Seed data (seedUsersModule, clearUsersData)
8. `convex/schema.ts` - Database schema

---

**End of QA Report**
