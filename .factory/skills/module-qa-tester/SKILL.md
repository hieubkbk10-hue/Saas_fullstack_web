---
name: module-qa-tester
description: "QA và review code cho admin modules (system + admin) sử dụng checklist-based approach. Sử dụng khi: (1) QA module mới sau khi tạo, (2) Review code module, (3) Kiểm tra tích hợp /system và /admin, (4) Tìm bugs và issues, (5) Tạo ticket/issues để fix. Tham chiếu module Posts đã test OK."
version: 1.0.0
---

# Module QA Tester

Skill này giúp QA và review code các admin modules trong hệ thống VietAdmin một cách có hệ thống, không cần viết script test (tuân thủ KISS).

## Khi nào sử dụng

- Sau khi tạo module mới bằng module-creator
- Khi cần QA toàn diện một module
- Khi review code trước khi merge
- Khi tìm bugs và tạo danh sách issues

## Cấu trúc Module chuẩn (Reference: Posts module)

### 1. System Config Page (`/system/modules/{module}/page.tsx`)
```
app/system/modules/{module}/page.tsx
├── Config Tab: Quản lý settings, features, fields
├── Data Tab: Statistics, seed/clear/reset data, preview tables
├── ModuleHeader với Save button
├── ModuleStatus với toggle
└── Convention notes
```

### 2. Admin Pages (`/admin/{module}/`)
```
app/admin/{module}/
├── page.tsx          # List page với CRUD
├── create/page.tsx   # Create form
└── [id]/edit/page.tsx # Edit form
```

### 3. Convex Backend (`/convex/{module}.ts`)
```
convex/{module}.ts
├── list, listAll     # Read queries
├── getById, getBySlug  # Single item queries
├── count             # Statistics
├── create            # Create mutation
├── update            # Update mutation
└── remove            # Delete mutation với cascade
```

## QA Workflow

### Phase 1: Code Review (Static Analysis)

**Đọc và phân tích code KHÔNG chạy app:**

1. **Check file structure**
   - [ ] System config page tồn tại
   - [ ] Admin pages (list, create, edit) tồn tại
   - [ ] Convex backend file tồn tại
   - [ ] Types/validators đầy đủ

2. **Check imports & dependencies**
   - [ ] Không có unused imports
   - [ ] Dùng đúng API path (@/convex/_generated/api)
   - [ ] Không import circular

3. **Check naming conventions**
   - [ ] MODULE_KEY consistent
   - [ ] Tên biến/function có ý nghĩa
   - [ ] Tuân thủ camelCase (JS) / snake_case (DB fields)

4. **Check TypeScript**
   - [ ] Không có `any` type không cần thiết
   - [ ] Props được type đúng
   - [ ] Return types cho mutations/queries

5. **Check error handling**
   - [ ] Try/catch cho mutations
   - [ ] Toast notifications cho success/error
   - [ ] Loading states

### Phase 2: System Config Page QA

**Checklist cho `/system/modules/{module}/page.tsx`:**

1. **Layout & UI**
   - [ ] ModuleHeader hiển thị đúng icon, title, description
   - [ ] Tabs Config/Data hoạt động
   - [ ] ModuleStatus hiển thị đúng
   - [ ] ConventionNote hiển thị

2. **Config Tab**
   - [ ] Settings load đúng từ DB
   - [ ] Features toggle được
   - [ ] Fields toggle được (trừ isSystem)
   - [ ] Save button enable khi có changes
   - [ ] Save thành công update DB

3. **Data Tab**
   - [ ] Statistics hiển thị đúng count
   - [ ] Seed Data button tạo data mẫu
   - [ ] Clear All xóa hết data
   - [ ] Reset = Clear + Seed
   - [ ] Tables hiển thị preview data

4. **State Management**
   - [ ] Local state sync với server state
   - [ ] hasChanges detect đúng
   - [ ] Loading states hiển thị

### Phase 3: Admin List Page QA

**Checklist cho `/admin/{module}/page.tsx`:**

1. **Layout**
   - [ ] Title và breadcrumb đúng
   - [ ] Add button link đúng
   - [ ] Reset/Reseed button hoạt động

2. **Table**
   - [ ] Columns hiển thị đúng data
   - [ ] Sortable columns hoạt động
   - [ ] Search/filter hoạt động

3. **⚠️ PAGINATION (CRITICAL)**
   - [ ] Query `listModuleSettings` để lấy `{module}PerPage`
   - [ ] State `currentPage` và `totalPages`
   - [ ] `paginatedData` slice từ sortedData
   - [ ] Reset page khi filter/sort thay đổi
   - [ ] UI: Previous/Next buttons
   - [ ] UI: "Trang X / Y" và "Hiển thị A-B / Total"

4. **Selection & Bulk Actions**
   - [ ] Select all checkbox hoạt động
   - [ ] Individual select hoạt động
   - [ ] Bulk delete hoạt động
   - [ ] Selection count hiển thị đúng

5. **Row Actions**
   - [ ] Edit button link đúng
   - [ ] Delete button xóa item
   - [ ] View/External link (nếu có) hoạt động

6. **Empty State**
   - [ ] Hiển thị message khi không có data
   - [ ] Hiển thị message khi search không có kết quả

### Phase 4: Admin Create/Edit Pages QA

**Checklist cho create/edit pages:**

1. **Form Layout**
   - [ ] Tất cả fields hiển thị
   - [ ] Labels đúng
   - [ ] Required fields có marker
   - [ ] Help text (nếu có)

2. **Form Validation**
   - [ ] Required fields validate
   - [ ] Format validation (email, url, etc.)
   - [ ] Unique constraints (slug, etc.)
   - [ ] Error messages hiển thị rõ

3. **Form Submission**
   - [ ] Submit button có loading state
   - [ ] Success redirect đúng
   - [ ] Error hiển thị toast
   - [ ] Data persist đúng trong DB

4. **Edit Page Specific**
   - [ ] Load existing data đúng
   - [ ] Pre-fill form fields
   - [ ] Update không tạo duplicate
   - [ ] Cancel quay về list

### Phase 5: Convex Backend QA

**Checklist cho `/convex/{module}.ts`:**

1. **Queries**
   - [ ] listAll trả về đúng format
   - [ ] getById handle null case
   - [ ] Indexes được sử dụng đúng
   - [ ] Return type validators đúng

2. **Mutations**
   - [ ] create validate input
   - [ ] update check existing
   - [ ] remove handle cascade deletes
   - [ ] Unique constraints enforce

3. **Security**
   - [ ] Không có sensitive data leak
   - [ ] Auth checks (nếu cần)

### Phase 6: Integration QA

**Kiểm tra tích hợp giữa các phần:**

1. **⚠️ System ↔ Admin (CRITICAL)**
   - [ ] **Feature toggle ẢNH HƯỞNG admin UI:**
     - [ ] Tắt feature → ẩn filter/column tương ứng ở list page
     - [ ] Tắt feature → ẩn field tương ứng ở create/edit form
     - [ ] Query `listModuleFeatures` để check enabled features
     - [ ] VD: `enableFolders=false` → ẩn folder filter + folder field trong edit
   - [ ] Field toggle ảnh hưởng form
   - [ ] **Settings apply đúng:**
     - [ ] `{module}PerPage` → Pagination trong admin list page
     - [ ] `defaultStatus` → Default value khi create
     - [ ] Các settings khác ảnh hưởng behavior

2. **Frontend ↔ Backend**
   - [ ] Data flow đúng
   - [ ] Real-time updates (Convex reactivity)
   - [ ] Error handling end-to-end

3. **Cross-module**
   - [ ] Relations hoạt động (categoryId, authorId, etc.)
   - [ ] Cascade deletes hoạt động
   - [ ] Statistics accurate

## Output Format

### Issue Ticket Template

```markdown
## 🐛 [MODULE_NAME] Issue Title

**Severity:** Critical / High / Medium / Low
**Type:** Bug / Enhancement / Code Quality

### Description
[Mô tả ngắn gọn vấn đề]

### Steps to Reproduce
1. Step 1
2. Step 2
3. Expected: X
4. Actual: Y

### Location
- File: `path/to/file.tsx`
- Line: 123
- Component/Function: `ComponentName`

### Suggested Fix
[Code snippet hoặc hướng giải quyết]

### Related
- [ ] Related issue #X
- [ ] Blocks feature Y
```

### QA Report Template

```markdown
# QA Report: [Module Name]

## Summary
- Total Issues: X
- Critical: X | High: X | Medium: X | Low: X
- Pass Rate: X%

## Checklist Results

### System Config Page
- [x] Item passed
- [ ] ❌ Item failed - Issue #1

### Admin List Page
...

### Admin Create/Edit Pages
...

### Convex Backend
...

### Integration
...

## Issues Found

### Issue #1: [Title]
[Details...]

## Recommendations
1. [Recommendation]
```

## Quick Reference

### Common Issues to Check

1. **Missing Loading States**
   ```tsx
   // Bad
   if (!data) return null;
   
   // Good
   if (!data) return <Loader2 className="animate-spin" />;
   ```

2. **Missing Error Handling**
   ```tsx
   // Bad
   await mutation();
   
   // Good
   try {
     await mutation();
     toast.success('Done');
   } catch {
     toast.error('Error');
   }
   ```

3. **Type Safety Issues**
   ```tsx
   // Bad
   const id = params.id as any;
   
   // Good
   const id = params.id as Id<"posts">;
   ```

4. **Missing Cascade Delete**
   ```tsx
   // Bad - orphan comments
   await ctx.db.delete(postId);
   
   // Good
   const comments = await ctx.db.query("comments")
     .withIndex("by_postId")
     .collect();
   for (const c of comments) await ctx.db.delete(c._id);
   await ctx.db.delete(postId);
   ```

5. **Inconsistent State**
   ```tsx
   // Bad - state mismatch
   setLocalFeatures(newFeatures);
   // Forgot to update linked fields
   
   // Good
   setLocalFeatures(newFeatures);
   setLocalFields(prev => prev.map(f => 
     f.linkedFeature === key ? {...f, enabled: newFeatures[key]} : f
   ));
   ```

6. **⚠️ Missing Feature Toggle in Admin UI (CRITICAL)**
   ```tsx
   // Bad - không check feature toggle
   function MediaContent() {
     const foldersData = useQuery(api.media.getFolders);
     return (
       // Folder filter luôn hiển thị dù feature bị tắt
       <select>{foldersData?.map(f => <option>{f}</option>)}</select>
     );
   }
   
   // Good - check feature toggle từ System Config
   const MODULE_KEY = 'media';
   function MediaContent() {
     const foldersData = useQuery(api.media.getFolders);
     const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
     
     const enabledFeatures = useMemo(() => {
       const features: Record<string, boolean> = {};
       featuresData?.forEach(f => { features[f.featureKey] = f.enabled; });
       return features;
     }, [featuresData]);
     
     const showFolders = enabledFeatures.enableFolders ?? true;
     
     return (
       // Folder filter chỉ hiển thị khi feature bật
       {showFolders && foldersData && (
         <select>{foldersData.map(f => <option>{f}</option>)}</select>
       )}
     );
   }
   ```

7. **⚠️ Missing Pagination from Settings (CRITICAL)**
   ```tsx
   // Bad - không dùng settings
   const sortedPosts = useSortableData(filteredPosts, sortConfig);
   // Hiển thị tất cả sortedPosts trong table
   
   // Good - dùng settings từ System Config
   const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: 'posts' });
   const postsPerPage = useMemo(() => {
     const setting = settingsData?.find(s => s.settingKey === 'postsPerPage');
     return (setting?.value as number) || 10;
   }, [settingsData]);
   
   const [currentPage, setCurrentPage] = useState(1);
   const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
   const paginatedPosts = useMemo(() => {
     const start = (currentPage - 1) * postsPerPage;
     return sortedPosts.slice(start, start + postsPerPage);
   }, [sortedPosts, currentPage, postsPerPage]);
   
   // Hiển thị paginatedPosts trong table + pagination UI
   ```

8. **⚠️ Missing Image Compression on Upload (Media Module)**
   ```tsx
   // Bad - upload file gốc không compress
   const response = await fetch(uploadUrl, {
     method: 'POST',
     headers: { 'Content-Type': file.type },
     body: file, // File gốc, có thể rất lớn
   });
   
   // Good - compress image 85% trước khi upload
   const COMPRESSION_QUALITY = 0.85;
   
   async function compressImage(file: File, quality: number): Promise<Blob> {
     if (!file.type.startsWith('image/') || file.type === 'image/png') {
       return file; // Skip PNG to preserve transparency
     }
     return new Promise((resolve) => {
       const img = new Image();
       img.onload = () => {
         const canvas = document.createElement('canvas');
         canvas.width = img.width;
         canvas.height = img.height;
         canvas.getContext('2d')?.drawImage(img, 0, 0);
         canvas.toBlob(
           (blob) => resolve(blob && blob.size < file.size ? blob : file),
           'image/jpeg',
           quality
         );
       };
       img.src = URL.createObjectURL(file);
     });
   }
   
   const compressedBlob = await compressImage(file, COMPRESSION_QUALITY);
   const response = await fetch(uploadUrl, {
     method: 'POST',
     headers: { 'Content-Type': 'image/jpeg' },
     body: compressedBlob,
   });
   ```

9. **⚠️ Missing Storage Cleanup on Delete**
   ```tsx
   // Bad - chỉ xóa DB record, không xóa file storage
   export const remove = mutation({
     handler: async (ctx, args) => {
       await ctx.db.delete(args.id); // Storage file orphaned!
     },
   });
   
   // Good - xóa cả storage file
   export const remove = mutation({
     handler: async (ctx, args) => {
       const media = await ctx.db.get(args.id);
       if (!media) throw new Error("Media not found");
       try {
         await ctx.storage.delete(media.storageId);
       } catch {
         // Storage file might already be deleted
       }
       await ctx.db.delete(args.id);
     },
   });
   ```

## Modules đã QA OK (Reference)

- ✅ **Posts** - Module chuẩn với đầy đủ features + pagination
- ✅ **Comments** - Module với full CRUD + pagination
- ✅ **Media** - Module với compression 85%, feature toggle, storage cleanup

## Modules cần QA

Xem danh sách tại: `/system/modules/`
- Products
- Orders
- Customers
- Wishlist
- Notifications
- Promotions
- Cart
- Comments
- Users
- Roles
- Menus
- Media
- Analytics
- Settings
- Homepage

## Tips

1. **Bắt đầu từ Code Review** - Đọc code trước, tìm issues obvious
2. **So sánh với Posts module** - Dùng làm reference
3. **Focus vào Critical paths** - CRUD operations quan trọng nhất
4. **Tạo ticket rõ ràng** - Giúp fix nhanh hơn
5. **Check cả edge cases** - Empty state, error state, boundary conditions
