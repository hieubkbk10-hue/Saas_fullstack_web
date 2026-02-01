---
name: experience-preview-extractor
description: Trích “xương” (layout/structure/state chính) từ code UI thật để tạo preview giống giao diện tương ứng. Dùng khi cần đồng bộ UI preview với UI thật, hoặc khi user nói “preview phải giống giao diện thực”, “tạo preview từ code thật”, “trích xương giao diện”.
allowed-tools: Read, Grep, Glob, Execute, ApplyPatch
---

# Experience Preview Extractor

Giúp phân rã UI thật thành “xương” preview (layout, vùng filter/sort/category, list item, header/footer) để preview giống giao diện thật nhưng nhẹ và tĩnh.

## Quick start
Khi user báo preview lệch UI thật:
1) Xác định page thật và layout tương ứng.
2) Trích “xương” từ layout thật.
3) Áp vào component preview cho **từng breakpoint** (desktop/tablet/mobile).
4) Chạy validator của dự án.

## Quy trình chuẩn (bắt cá lấy xương)
1. **Tìm UI thật**
   - Dùng `Glob`/`Grep` để tìm layout/page thật (ví dụ `app/(site)/posts/page.tsx`, `components/site/posts/layouts/*`).
   - Đọc layout để hiểu cấu trúc DOM và thứ tự các khối.

2. **Trích xương (Skeleton Map)**
   - Ghi lại các khối chính theo thứ tự: `Header`, `Filter Bar`, `Sort`, `Category`, `List/Grid`, `Pagination`.
   - Ghi vị trí tương đối (flex, grid, sidebar), kích thước tương đối (max-w, min-w), và breakpoint quan trọng (mobile/tablet/desktop).
   - Ghi UI tương tác quan trọng nhưng chỉ cần dạng “tĩnh” trong preview (dropdown/select, chip, toggle).

3. **Trích xương responsive**
   - Đọc các class breakpoint (`sm:`, `md:`, `lg:`) và map thành 3 trạng thái preview: desktop/tablet/mobile.
   - Xác định các phần **ẩn/hiện theo breakpoint** (ví dụ category + sort chỉ `lg` mới hiện).
   - Ghi số cột grid theo breakpoint (ví dụ `sm:grid-cols-2`, `lg:grid-cols-3`).

4. **Chuẩn hoá preview**
   - Preview chỉ tái hiện **structure + spacing + alignment**; nội dung mock đơn giản.
   - Ưu tiên dùng cùng class utility (Tailwind) và cùng thứ tự khối với UI thật.
   - Những phần động: dùng `select/option`, `button` disabled, hoặc placeholder.

5. **So khớp**
   - So sánh 1-1 giữa “xương” và preview: vị trí sort, kiểu category (dropdown vs chip), độ rộng filter, v.v.
   - Nếu có device preview (desktop/tablet/mobile), đảm bảo rule phản chiếu breakpoint UI thật (ví dụ `lg` => chỉ desktop).

6. **Validate**
   - Chạy lint/validator theo project.
   - Nếu thất bại, sửa và chạy lại.

## Checklist trích xương
- [ ] Filter bar có bao gồm search?
- [ ] Category là dropdown hay chip list?
- [ ] Sort nằm bên phải hay bên trái?
- [ ] Grid columns giống UI thật?
- [ ] Mobile layout đổi thứ tự khối?
- [ ] Tablet layout có giống rule breakpoint thật?
- [ ] Spacing/padding lớn tương tự?

## Ví dụ áp dụng (posts list)
**UI thật**: `components/site/posts/PostsFilter.tsx` + `components/site/posts/layouts/FullWidthLayout.tsx`

**Xương trích**:
1) Hàng filter: Search (left), Category dropdown (middle), Spacer, Sort dropdown (right).
2) Grid card 2-3 cột theo breakpoint.
3) Pagination dưới cùng.

**Preview tương ứng**:
- Dùng `select` cho category và sort.
- `flex-1` spacer để sort sát phải.
- Card mock với `aspect-video`.

## Best practices
- Không kéo logic business vào preview.
- Không thêm dữ liệu thật; chỉ mock tối thiểu.
- Ưu tiên đồng bộ layout hơn là chi tiết UI nhỏ.

## Khi KHÔNG dùng skill
- Preview chỉ cần minh hoạ chung, không yêu cầu khớp UI thật.
- UI thật chưa có code/thiết kế rõ ràng.

## Kiểm thử
- Dùng scripts lint/typecheck của dự án trước khi hoàn tất.
