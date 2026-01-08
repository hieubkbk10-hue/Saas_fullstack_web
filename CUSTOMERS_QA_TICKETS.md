# Customers Module QA Tickets

> Generated: 2026-01-08
> Branch: `feature/customers-module-qa`
> Worktree: `E:\NextJS\study\admin-ui-aistudio\customers-module-qa`

## Status Legend
- [ ] Pending
- [x] Fixed
- [~] In Progress

---

## 🟠 HIGH Priority

### CUST-001: N+1 Problem trong `remove` mutation
- **File**: `convex/customers.ts:140-170`
- **Status**: [ ] Pending
- **Type**: Database Performance
- **Description**: 
  Loop với `await ctx.db.delete()` cho orders, carts, wishlist, comments gây N+1 queries.
  Nếu customer có 100 orders + 50 carts + 30 wishlist + 20 comments = 200 sequential queries!
  
- **Fix**:
```typescript
// Replace sequential loops with Promise.all
await Promise.all([
  ...orders.map(order => ctx.db.delete(order._id)),
  ...carts.map(cart => ctx.db.delete(cart._id)),
  ...wishlistItems.map(item => ctx.db.delete(item._id)),
  ...comments.map(comment => ctx.db.delete(comment._id)),
]);
```
- **Impact**: Performance improvement ~200x for customers with many related records

---

### CUST-002: N+1 trong `clearCustomersData` mutation
- **File**: `convex/seed.ts` (clearCustomersData function)
- **Status**: [ ] Pending
- **Type**: Database Performance
- **Description**: 
  Sử dụng `for...of` loop thay vì `Promise.all()` khi xóa customers

- **Fix**:
```typescript
// From:
for (const c of customers) {
  await ctx.db.delete(c._id);
}

// To:
await Promise.all(customers.map(c => ctx.db.delete(c._id)));
```

---

### CUST-003: `getStats` fetch ALL data để tính statistics
- **File**: `convex/customers.ts:198-220`
- **Status**: [ ] Pending
- **Type**: Database Performance / Bandwidth
- **Description**:
  Query `getStats` fetch tới 1000 records và loop qua tất cả để tính stats.
  - activeCount: loop để count
  - inactiveCount: loop để count
  - totalSpent: loop để sum
  - totalOrders: loop để sum
  
  Với 10K customers x 500 bytes = 5MB bandwidth mỗi lần gọi!

- **Fix Option A**: Tạo counter table `customerStats` tương tự `productStats`
- **Fix Option B**: Dùng multiple indexed queries để count riêng
```typescript
// Option B - indexed queries (không cần counter table)
const [activeCustomers, inactiveCustomers] = await Promise.all([
  ctx.db.query("customers").withIndex("by_status", q => q.eq("status", "Active")).take(1001),
  ctx.db.query("customers").withIndex("by_status", q => q.eq("status", "Inactive")).take(1001),
]);
```

---

### CUST-004: `getCities` fetch ALL data để lấy unique cities
- **File**: `convex/customers.ts:225-235`
- **Status**: [ ] Pending
- **Type**: Database Performance
- **Description**: Fetch 500 records chỉ để extract unique cities

- **Fix**: Tạo table `customerCities` để track cities:
```typescript
// Schema addition
customerCities: defineTable({
  city: v.string(),
  count: v.number(),
}).index("by_city", ["city"])
```

---

### CUST-005: Missing phone validation
- **File**: `app/admin/customers/create/page.tsx:55` và `app/admin/customers/[id]/edit/page.tsx:75`
- **Status**: [ ] Pending
- **Type**: Bug / Validation
- **Description**: Chỉ validate phone required, không validate format số điện thoại Việt Nam

- **Fix**:
```typescript
const isValidPhone = (phone: string) => 
  /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phone.replace(/\s|-/g, ''));

if (!formData.phone.trim()) {
  toast.error('Vui lòng nhập số điện thoại');
  return;
}
if (!isValidPhone(formData.phone)) {
  toast.error('Số điện thoại không hợp lệ (VD: 0901234567)');
  return;
}
```

---

## 🟡 MEDIUM Priority

### CUST-006: Missing email uniqueness check khi update
- **File**: `convex/customers.ts:107-127`
- **Status**: [ ] Pending
- **Type**: Bug / Data Integrity
- **Description**: 
  Mutation `update` không kiểm tra email mới có trùng với customer khác không.
  User có thể update email thành email đã tồn tại của customer khác.

- **Fix**:
```typescript
handler: async (ctx, args) => {
  const { id, ...updates } = args;
  const customer = await ctx.db.get(id);
  if (!customer) throw new Error("Customer not found");
  
  // ADD THIS: Check email uniqueness
  if (updates.email && updates.email !== customer.email) {
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", updates.email!))
      .unique();
    if (existing) {
      throw new Error("Email đã được sử dụng bởi khách hàng khác");
    }
  }
  
  await ctx.db.patch(id, updates);
  return null;
},
```

---

### CUST-007: Bulk delete potential timeout
- **File**: `app/admin/customers/page.tsx:91-100`
- **Status**: [ ] Pending
- **Type**: Performance / UX
- **Description**: 
  Bulk delete sử dụng sequential loop, có thể timeout với nhiều items selected.

- **Fix Option A**: Show progress indicator
- **Fix Option B**: Create batch delete mutation
```typescript
// Option A - Add progress
const handleBulkDelete = async () => {
  if (!confirm(`Xóa ${selectedIds.length} khách hàng?`)) return;
  
  let deleted = 0;
  for (const id of selectedIds) {
    try {
      await deleteCustomer({ id, cascadeOrders: false });
      deleted++;
      toast.info(`Đang xóa... ${deleted}/${selectedIds.length}`);
    } catch (error) {
      toast.error(`Lỗi xóa customer ${id}`);
    }
  }
  setSelectedIds([]);
  toast.success(`Đã xóa ${deleted} khách hàng`);
};
```

---

### CUST-008: Missing error handling trong seed/clear
- **File**: `app/system/modules/customers/page.tsx:148-165`
- **Status**: [ ] Pending
- **Type**: UX / Error Handling
- **Description**: 
  `handleSeedAll`, `handleClearData`, `handleResetAll` không có try/catch

- **Fix**:
```typescript
const handleSeedAll = async () => {
  try {
    toast.loading('Đang tạo dữ liệu mẫu...');
    await seedCustomersModule();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  } catch (error) {
    toast.dismiss();
    toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
  }
};
```

---

### CUST-009: `use(params)` experimental pattern
- **File**: `app/admin/customers/[id]/edit/page.tsx:21`
- **Status**: [ ] Pending
- **Type**: Code Quality / Future Compatibility
- **Description**: 
  Sử dụng `use(params)` là experimental React API. Next.js 15 recommend pattern khác.

- **Current**:
```typescript
export default function CustomerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
```

- **Fix** (nếu server component):
```typescript
export default async function CustomerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
```

- **Note**: Vì đây là 'use client' component, có thể giữ `use()` hoặc chuyển sang pattern khác với dynamic routing.

---

## 🟢 LOW Priority (Enhancement)

### CUST-010: Missing pagination cho orders list
- **File**: `app/admin/customers/[id]/edit/page.tsx`
- **Status**: [ ] Pending
- **Type**: UX Enhancement
- **Description**: 
  Tab "Lịch sử mua hàng" hiển thị tất cả orders không có pagination.
  Customer với 500 orders sẽ render rất chậm.

- **Fix**: Thêm pagination component hoặc virtual scroll

---

## Summary Table

| Ticket | Priority | Type | Effort | Status |
|--------|----------|------|--------|--------|
| CUST-001 | 🟠 HIGH | Performance | 15m | ✅ Fixed |
| CUST-002 | 🟠 HIGH | Performance | 5m | ✅ Fixed |
| CUST-003 | 🟠 HIGH | Performance | 30m | ✅ Fixed |
| CUST-004 | 🟠 HIGH | Performance | 30m | ✅ Fixed |
| CUST-005 | 🟠 HIGH | Validation | 10m | ✅ Fixed |
| CUST-006 | 🟡 MEDIUM | Bug | 10m | ✅ Fixed |
| CUST-007 | 🟡 MEDIUM | Performance | 20m | ✅ Fixed |
| CUST-008 | 🟡 MEDIUM | UX | 15m | ✅ Fixed |
| CUST-009 | 🟡 MEDIUM | Code Quality | 10m | ✅ Fixed |
| CUST-010 | 🟢 LOW | Enhancement | 30m | ✅ Fixed |

**Total Estimated Time**: ~3 hours
**Actual Time**: All issues fixed in commit `ad8632f`

---

## How to Fix

1. Checkout worktree: `cd E:\NextJS\study\admin-ui-aistudio\customers-module-qa`
2. Fix issues one by one
3. Run tests: `npm run lint && npx tsc --noEmit`
4. Commit: `git commit -m "fix(customers): [CUST-XXX] description"`
5. When done: Request merge to master

## Cleanup After Merge

```bash
# In main repo
cd E:\NextJS\study\admin-ui-aistudio\system-vietadmin-nextjs
git worktree remove ../customers-module-qa
git branch -d feature/customers-module-qa
```
