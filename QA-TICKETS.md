# 🎫 QA Tickets - VietAdmin System

**Ngày:** 2026-01-09  
**Tổng issues:** 18 tickets

---

## 🔴 CRITICAL (3 tickets)

### CRIT-001: Analytics - Tốn băng thông khủng khiếp

**Mức độ:** 🔴 Critical  
**Module:** `convex/analytics.ts`

**Mô tả:**  
Module Analytics fetch TẤT CẢ records từ orders, customers, products mà không filter. Đây là thảm họa chi phí.

**Vị trí lỗi:**
- Dòng 32: `const allOrders = await ctx.db.query("orders").collect();`
- Dòng 97: `const allCustomers = await ctx.db.query("customers").collect();`
- Dòng 215, 282, 328: Tương tự với orders
- Dòng 349, 360: customers và products

**Ước tính thiệt hại:**
```
10K orders × 2KB × 1000 requests/ngày = 20GB/ngày
Chi phí: $100-500+/tháng chỉ riêng analytics
```

**Cách sửa:**
1. Tạo bảng `analyticsStats` lưu số liệu tính sẵn
2. Thêm index theo ngày, filter ở database
3. Pagination cho queries chi tiết

---

### CRIT-002: PageViews - Quét toàn bộ bảng

**Mức độ:** 🔴 Critical  
**Module:** `convex/pageViews.ts`

**Mô tả:**  
5 chỗ fetch ALL pageViews không filter, gây nghẽn khi data lớn.

**Vị trí lỗi:**
- Dòng 54, 117, 229, 276, 330: `const allPageViews = await ctx.db.query("pageViews").collect();`

**Cách sửa:**
```typescript
// Sai
const allPageViews = await ctx.db.query("pageViews").collect();
const todayViews = allPageViews.filter(pv => pv.timestamp > startOfDay);

// Đúng
const todayViews = await ctx.db.query("pageViews")
  .withIndex("by_timestamp", q => q.gte("timestamp", startOfDay))
  .collect();
```

---

### CRIT-003: ActivityLogs - Không giới hạn

**Mức độ:** 🔴 Critical  
**Module:** `convex/activityLogs.ts`

**Mô tả:**  
Activity logs tăng vô hạn nhưng queries fetch ALL.

**Vị trí lỗi:**
- Dòng 134, 160: `const logs = await ctx.db.query("activityLogs").collect();`

**Cách sửa:**  
Thêm pagination và filter theo ngày.

---

## 🟠 HIGH (6 tickets)

### HIGH-001: Reviews - Không dùng Settings

**Mức độ:** 🟠 High  
**File:** `app/admin/reviews/page.tsx`

**Mô tả:**  
Hardcode `reviewsPerPage = 20` thay vì lấy từ module settings.

**Code hiện tại (dòng ~25):**
```typescript
const reviewsPerPage = 20; // Hardcode!
```

**Cách sửa:**
```typescript
const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: 'comments' });
const reviewsPerPage = useMemo(() => {
  const setting = settingsData?.find(s => s.settingKey === 'commentsPerPage');
  return (setting?.value as number) || 20;
}, [settingsData]);
```

---

### HIGH-002: Reviews - Thiếu Feature Toggle

**Mức độ:** 🟠 High  
**File:** `app/admin/reviews/page.tsx`

**Mô tả:**  
Reviews không check enabled features từ System Config. Tắt rating ở System nhưng Reviews vẫn hiển thị.

**Cách sửa:**  
Thêm query `listModuleFeatures` và check trước khi render các columns/fields.

---

### HIGH-003: Bulk Delete - Xóa tuần tự thay vì song song

**Mức độ:** 🟠 High  
**Files:** `cart/page.tsx`, `reviews/page.tsx`

**Mô tả:**  
Một số module dùng vòng lặp tuần tự thay vì Promise.all, rất chậm.

**Code sai (cart/page.tsx):**
```typescript
const handleBulkDelete = async () => {
  for (const id of selectedIds) {
    await deleteCart({ id }); // Tuần tự - chậm!
  }
};
```

**Cách sửa:**
```typescript
const handleBulkDelete = async () => {
  await Promise.all(selectedIds.map(id => deleteCart({ id })));
};
```

---

### HIGH-004: ProductCategories - Thiếu cảnh báo cascade delete

**Mức độ:** 🟠 High  
**File:** `convex/productCategories.ts`

**Mô tả:**  
Xóa category không cảnh báo về products liên quan sẽ bị ảnh hưởng.

**Cách sửa:**  
Thêm check số products và hiển thị warning trước khi xóa.

---

### HIGH-005: PostCategories - Tương tự cascade issue

**Mức độ:** 🟠 High  
**File:** `convex/postCategories.ts`

**Mô tả:**  
Giống HIGH-004, cần warning về posts liên quan.

---

### HIGH-006: DataManager - Có thể timeout

**Mức độ:** 🟠 High  
**File:** `convex/dataManager.ts`

**Mô tả:**  
DataManager export/clear data không giới hạn, timeout với dataset lớn.

**Vị trí lỗi:**
- Dòng 73, 98: `const records = await ctx.db.query(table).collect();`

**Cách sửa:**  
Thêm batch processing với limit.

---

## 🟡 MEDIUM (7 tickets)

### MED-001: Thiếu loading state ở một số handlers

**Mức độ:** 🟡 Medium  
**Files:** Nhiều modules

**Mô tả:**  
Một số async handlers không hiển thị loading khi xử lý.

**Cách sửa:**
```typescript
const [isProcessing, setIsProcessing] = useState(false);

const handleAction = async () => {
  setIsProcessing(true);
  try {
    await action();
  } finally {
    setIsProcessing(false);
  }
};
```

---

### MED-002: Error messages không nhất quán

**Mức độ:** 🟡 Medium  
**Files:** Nhiều modules

**Mô tả:**  
Một số module hiển thị "Có lỗi xảy ra" chung chung thay vì chi tiết.

**Cách sửa:**
```typescript
// Sai
catch { toast.error('Có lỗi xảy ra'); }

// Đúng
catch (error) {
  toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
}
```

---

### MED-003: Reviews - Không reset page khi sort

**Mức độ:** 🟡 Medium  
**File:** `app/admin/reviews/page.tsx`

**Mô tả:**  
Khi sort, page nên reset về 1 nhưng Reviews không làm điều này.

---

### MED-004: Storage Cleanup - Rủi ro file mồ côi

**Mức độ:** 🟡 Medium  
**File:** `convex/storage.ts`

**Mô tả:**  
Storage cleanup chỉ check một số folders nhất định. Images trong content (posts, products) có thể bị mồ côi.

---

### MED-005: Empty state không phân biệt rõ

**Mức độ:** 🟡 Medium  
**Files:** Nhiều modules

**Mô tả:**  
Một số module không phân biệt "không có data" vs "không tìm thấy kết quả".

---

### MED-006: LexicalEditor - Cleanup images chưa hoàn chỉnh

**Mức độ:** 🟡 Medium  
**File:** `app/admin/components/LexicalEditor.tsx`

**Mô tả:**  
Images paste vào editor dạng base64 nên auto upload, nhưng cleanup khi thay đổi content có thể để lại images mồ côi.

---

### MED-007: Seed functions - Quá nhiều collect

**Mức độ:** 🟡 Medium  
**File:** `convex/seed.ts`

**Mô tả:**  
Seed functions có 100+ `.collect()` calls. Tuy chỉ dùng cho admin seeding, nhưng có thể timeout với dataset lớn sẵn có.

---

## 🟢 LOW (2 tickets)

### LOW-001: Button styling không nhất quán

**Mức độ:** 🟢 Low  
**Loại:** UI

**Mô tả:**  
Một số module dùng màu button khác nhau cho cùng action (Reset button).

---

### LOW-002: Thiếu keyboard shortcuts

**Mức độ:** 🟢 Low  
**Loại:** UX

**Mô tả:**  
Thêm phím tắt cho các thao tác phổ biến (Ctrl+S lưu, Esc hủy).

---

## ✅ Modules Đã OK

| Module | Pagination | Feature Toggle | Settings | Error Handling |
|--------|------------|----------------|----------|----------------|
| Posts | ✅ | ✅ | ✅ | ✅ |
| Products | ✅ Server-side | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ |
| Wishlist | ✅ | ✅ | ✅ | ✅ |
| Cart | ✅ | ✅ | ✅ | ✅ |
| Media | ✅ | ✅ Folders | ✅ | ✅ |
| Promotions | ✅ | ✅ | ✅ | ✅ |

---

## 📊 Ưu tiên Fix

### Làm ngay (Sprint này)
1. CRIT-001, CRIT-002, CRIT-003 - Fix bandwidth issues
2. HIGH-001, HIGH-002 - Fix Reviews module
3. HIGH-003 - Đổi sang Promise.all

### Sprint sau
1. HIGH-004, HIGH-005, HIGH-006
2. Tất cả MED tickets

### Backlog
1. LOW-001, LOW-002

---

*Báo cáo tạo bởi AI QA Bot*
