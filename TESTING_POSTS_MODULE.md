# Testing Checklist - Module Posts

> **URL Test:** http://localhost:3000/system/modules/posts
> **Admin URL:** http://localhost:3000/admin/posts

---

## 1. Tab Cấu hình (Config)

### 1.1 Module Status
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 1.1.1 | Kiểm tra hiển thị trạng thái module | Hiển thị "Core: No", "Enabled: Yes" | | |
| 1.1.2 | Badge "Module tùy chọn" hiển thị đúng | Màu cyan, text đúng | | |

### 1.2 Settings Card
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 1.2.1 | Thay đổi "Số bài / trang" (10 → 20) | Input nhận giá trị, nút Save hiện | | |
| 1.2.2 | Thay đổi "Trạng thái mặc định" (draft → published) | Dropdown hoạt động | | |
| 1.2.3 | Save settings → Refresh trang | Giá trị được lưu, không mất | | |
| 1.2.4 | Nhập số âm vào "Số bài / trang" | Không cho phép hoặc validate | | |
| 1.2.5 | Nhập số quá lớn (9999) | Xử lý hợp lý | | |

### 1.3 Features Card (Tính năng)
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 1.3.1 | Toggle ON "Tags" | Switch chuyển xanh, field "tags" enable | | |
| 1.3.2 | Toggle OFF "Tags" | Field "tags" tự động disable theo | | |
| 1.3.3 | Toggle ON "Nổi bật" | Field "featured" enable theo | | |
| 1.3.4 | Toggle OFF "Nổi bật" | Field "featured" disable theo | | |
| 1.3.5 | Toggle ON "Hẹn giờ" | Field "publish_date" enable theo | | |
| 1.3.6 | Toggle OFF "Hẹn giờ" | Field "publish_date" disable theo | | |
| 1.3.7 | Save features → Refresh | Trạng thái toggle được lưu | | |

### 1.4 Fields Card - Trường bài viết
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 1.4.1 | Kiểm tra fields hệ thống (title, content, order, active) | Không thể disable, có badge "Hệ thống" | | |
| 1.4.2 | Toggle OFF "Mô tả ngắn" (excerpt) | Switch tắt, badge "Tùy chọn" | | |
| 1.4.3 | Toggle OFF "Ảnh đại diện" (thumbnail) | Switch tắt | | |
| 1.4.4 | Toggle field có linkedFeature (tags) | Cũng toggle feature tương ứng | | |
| 1.4.5 | Save fields → Refresh | Trạng thái được lưu | | |

### 1.5 Fields Card - Trường danh mục (postCategories)
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 1.5.1 | Kiểm tra fields hệ thống (name, order, active) | Không thể disable | | |
| 1.5.2 | Toggle OFF "Mô tả" (description) | Switch tắt | | |
| 1.5.3 | Toggle OFF "Ảnh đại diện" (thumbnail) | Switch tắt | | |
| 1.5.4 | Save category fields → Refresh | Trạng thái được lưu | | |

### 1.6 Change Detection & Save
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 1.6.1 | Không thay đổi gì | Nút "Lưu thay đổi" disabled/ẩn | | |
| 1.6.2 | Thay đổi 1 field → Check nút Save | Nút "Lưu thay đổi" hiện/enabled | | |
| 1.6.3 | Hoàn tác thay đổi | Nút Save ẩn lại | | |
| 1.6.4 | Save thành công | Toast "Đã lưu cấu hình thành công!" | | |
| 1.6.5 | Save thất bại (giả lập network error) | Toast lỗi hiển thị | | |

---

## 2. Tab Dữ liệu (Data)

### 2.1 Statistics Cards
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 2.1.1 | Hiển thị số lượng bài viết | Số đúng với DB | | |
| 2.1.2 | Hiển thị số lượng danh mục | Số đúng với DB | | |
| 2.1.3 | Hiển thị số lượng bình luận | Số đúng với DB | | |
| 2.1.4 | Real-time update khi thêm/xóa | Số cập nhật ngay | | |

### 2.2 Seed Data
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 2.2.1 | Click "Seed Data" (DB trống) | Tạo categories, posts, comments mẫu | | |
| 2.2.2 | Kiểm tra categories sau seed | 5 danh mục: Tin tức, Hướng dẫn, Khuyến mãi, Sự kiện, Công nghệ | | |
| 2.2.3 | Kiểm tra posts sau seed | 6 bài viết mẫu | | |
| 2.2.4 | Kiểm tra comments sau seed | Comments được tạo | | |
| 2.2.5 | Toast thông báo thành công | "Đã tạo dữ liệu mẫu thành công!" | | |
| 2.2.6 | Click "Seed Data" (DB đã có data) | Không tạo duplicate | | |

### 2.3 Clear All
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 2.3.1 | Click "Clear All" → Cancel confirm | Không xóa gì | | |
| 2.3.2 | Click "Clear All" → OK confirm | Xóa toàn bộ posts, categories, comments | | |
| 2.3.3 | Kiểm tra statistics sau Clear | Tất cả = 0 | | |
| 2.3.4 | Toast thông báo | "Đã xóa toàn bộ dữ liệu!" | | |

### 2.4 Reset
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 2.4.1 | Click "Reset" → Cancel | Không làm gì | | |
| 2.4.2 | Click "Reset" → OK | Clear + Seed lại từ đầu | | |
| 2.4.3 | Kiểm tra data sau Reset | Data mẫu mới, views = 0 cho bài mới | | |
| 2.4.4 | Toast thông báo | "Đã reset dữ liệu thành công!" | | |

### 2.5 Bảng Bài viết
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 2.5.1 | Hiển thị tối đa 10 bài | Table có max 10 rows | | |
| 2.5.2 | Cột "Tiêu đề" hiển thị đúng | Text đúng từ DB | | |
| 2.5.3 | Cột "Danh mục" hiển thị tên | Badge với tên danh mục, không phải ID | | |
| 2.5.4 | Cột "Trạng thái" - Published | Badge "Xuất bản" màu default | | |
| 2.5.5 | Cột "Trạng thái" - Draft | Badge "Nháp" màu secondary | | |
| 2.5.6 | Cột "Trạng thái" - Archived | Badge "Lưu trữ" màu outline | | |
| 2.5.7 | Cột "Lượt xem" format số | Có dấu phẩy ngàn (1,250) | | |
| 2.5.8 | Footer "Hiển thị 10 / X bài viết" | Nếu > 10 bài | | |
| 2.5.9 | Empty state khi không có bài | Message "Chưa có bài viết nào..." | | |

### 2.6 Bảng Danh mục
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 2.6.1 | Cột "Tên danh mục" | Text đúng | | |
| 2.6.2 | Cột "Slug" | Font mono, màu nhạt | | |
| 2.6.3 | Cột "Trạng thái" - active=true | Badge "Hoạt động" | | |
| 2.6.4 | Cột "Trạng thái" - active=false | Badge "Ẩn" | | |
| 2.6.5 | Cột "Số bài viết" | Đếm đúng số post trong category | | |
| 2.6.6 | Empty state | "Chưa có danh mục nào" | | |

### 2.7 Bảng Bình luận
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 2.7.1 | Cột "Người bình luận" | authorName đúng | | |
| 2.7.2 | Cột "Nội dung" | Truncate nếu dài | | |
| 2.7.3 | Cột "Trạng thái" - Approved | Badge "Đã duyệt" màu default | | |
| 2.7.4 | Cột "Trạng thái" - Pending | Badge "Chờ duyệt" màu secondary | | |
| 2.7.5 | Cột "Trạng thái" - Spam | Badge "Spam" màu destructive | | |
| 2.7.6 | Hiển thị tối đa 10 comment | Footer hiện nếu > 10 | | |
| 2.7.7 | Empty state | "Chưa có bình luận nào" | | |

---

## 3. Admin Panel - Danh sách bài viết (/admin/posts)

### 3.1 Page Load
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 3.1.1 | Trang load thành công | Không lỗi, spinner biến mất | | |
| 3.1.2 | ModuleGuard check | Nếu module posts disabled → redirect/block | | |
| 3.1.3 | Header "Quản lý bài viết" | Title hiển thị | | |

### 3.2 Toolbar
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 3.2.1 | Nút "Reset" hoạt động | Clear + Seed lại data | | |
| 3.2.2 | Nút "Thêm mới" navigate | Đến /admin/posts/create | | |

### 3.3 Search & Filter
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 3.3.1 | Search by title | Filter realtime khi gõ | | |
| 3.3.2 | Search không tìm thấy | "Không tìm thấy kết quả phù hợp" | | |
| 3.3.3 | Filter "Đã xuất bản" | Chỉ hiện status=Published | | |
| 3.3.4 | Filter "Bản nháp" | Chỉ hiện status=Draft | | |
| 3.3.5 | Filter "Lưu trữ" | Chỉ hiện status=Archived | | |
| 3.3.6 | Filter "Tất cả trạng thái" | Hiện tất cả | | |
| 3.3.7 | Combine Search + Filter | Cả 2 điều kiện áp dụng | | |

### 3.4 Table Sorting
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 3.4.1 | Sort by Tiêu đề ASC | A → Z | | |
| 3.4.2 | Sort by Tiêu đề DESC | Z → A | | |
| 3.4.3 | Sort by Danh mục | Sắp xếp theo tên category | | |
| 3.4.4 | Sort by Lượt xem ASC | Thấp → Cao | | |
| 3.4.5 | Sort by Lượt xem DESC | Cao → Thấp | | |
| 3.4.6 | Sort by Trạng thái | Sắp xếp theo status | | |

### 3.5 Table Display
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 3.5.1 | Thumbnail hiển thị | Hình ảnh 48x32px | | |
| 3.5.2 | Thumbnail không có | Placeholder "No img" | | |
| 3.5.3 | Tiêu đề dài truncate | Max-width với ellipsis | | |
| 3.5.4 | Lượt xem format số | 1,250 không phải 1250 | | |
| 3.5.5 | Status badges đúng màu | success/secondary/warning | | |
| 3.5.6 | Footer count đúng | "Hiển thị X / Y bài viết" | | |

### 3.6 Bulk Selection
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 3.6.1 | Click checkbox header | Select all visible rows | | |
| 3.6.2 | Click checkbox header (all selected) | Deselect all | | |
| 3.6.3 | Click checkbox row | Toggle select row đó | | |
| 3.6.4 | Selected rows highlight | Background màu blue nhạt | | |
| 3.6.5 | Indeterminate state | Khi select 1 số (không phải tất cả) | | |
| 3.6.6 | BulkActionBar hiện khi có selection | "Đã chọn X mục" + nút xóa | | |
| 3.6.7 | Clear selection | Bỏ chọn tất cả | | |

### 3.7 Bulk Delete
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 3.7.1 | Click Xóa → Cancel confirm | Không xóa | | |
| 3.7.2 | Click Xóa → OK confirm | Xóa tất cả selected posts | | |
| 3.7.3 | Toast thành công | "Đã xóa X bài viết" | | |
| 3.7.4 | Selection reset sau xóa | selectedIds = [] | | |
| 3.7.5 | Table update realtime | Bài bị xóa biến mất | | |

### 3.8 Row Actions
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 3.8.1 | Click icon "Xem bài viết" | Mở tab mới /post/{slug} | | |
| 3.8.2 | Click icon "Edit" | Navigate /admin/posts/{id}/edit | | |
| 3.8.3 | Click icon "Delete" → Cancel | Không xóa | | |
| 3.8.4 | Click icon "Delete" → OK | Xóa bài, toast, table update | | |
| 3.8.5 | Delete post có comments | Comments liên quan cũng bị xóa | | |

---

## 4. Admin Panel - Tạo bài viết (/admin/posts/create)

### 4.1 Form Load
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 4.1.1 | Page load thành công | Form hiển thị, không lỗi | | |
| 4.1.2 | Categories dropdown có data | Danh sách từ DB | | |
| 4.1.3 | Status default = "Draft" | Dropdown chọn sẵn "Bản nháp" | | |

### 4.2 Title & Slug
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 4.2.1 | Nhập tiêu đề → Slug auto generate | "Bài viết mới" → "bai-viet-moi" | | |
| 4.2.2 | Tiêu đề có dấu Việt | "Tin tức" → "tin-tuc" | | |
| 4.2.3 | Tiêu đề có ký tự đặc biệt | Loại bỏ, chỉ giữ a-z, 0-9, - | | |
| 4.2.4 | Sửa slug manual | Slug không auto update nữa khi sửa | | |
| 4.2.5 | Title required validation | Không submit được nếu trống | | |

### 4.3 Content Editor (Lexical)
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 4.3.1 | Editor load | Lexical editor hiển thị | | |
| 4.3.2 | Nhập text | Text được capture vào state | | |
| 4.3.3 | Bold/Italic formatting | Toolbar hoạt động | | |
| 4.3.4 | Insert image | (Nếu có) Hình được chèn | | |

### 4.4 Excerpt Field (Conditional)
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 4.4.1 | Field excerpt enabled trong system | Input "Mô tả ngắn" hiện | | |
| 4.4.2 | Field excerpt disabled trong system | Input "Mô tả ngắn" ẩn | | |

### 4.5 Category Selection
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 4.5.1 | Dropdown hiển thị đủ categories | Tất cả từ DB | | |
| 4.5.2 | Category required | Không submit nếu chưa chọn | | |
| 4.5.3 | Nút "+" tạo category nhanh | Modal hiện lên | | |

### 4.6 Quick Create Category Modal
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 4.6.1 | Modal open khi click "+" | Modal hiện | | |
| 4.6.2 | Nhập tên → Slug auto | "Mới" → "moi" | | |
| 4.6.3 | Submit tạo category | Category mới trong dropdown | | |
| 4.6.4 | Auto select category mới | Dropdown chọn category vừa tạo | | |
| 4.6.5 | Duplicate slug error | Toast lỗi | | |
| 4.6.6 | Cancel modal | Đóng không tạo gì | | |

### 4.7 Status Selection
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 4.7.1 | Default = Draft | "Bản nháp" selected | | |
| 4.7.2 | Chọn "Đã xuất bản" | status = Published | | |
| 4.7.3 | Chọn "Lưu trữ" | status = Archived | | |

### 4.8 Thumbnail Upload
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 4.8.1 | Click upload area | File picker mở (nếu implemented) | | |
| 4.8.2 | Drag & drop image | (Nếu implemented) | | |

### 4.9 Form Submission
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 4.9.1 | Submit valid form | Toast "Tạo bài viết mới thành công" | | |
| 4.9.2 | Redirect sau submit | Navigate /admin/posts | | |
| 4.9.3 | Submit duplicate slug | Toast error "Slug already exists" | | |
| 4.9.4 | Submit loading state | Button disabled, spinner | | |
| 4.9.5 | Click "Hủy bỏ" | Navigate back /admin/posts | | |
| 4.9.6 | Click "Lưu nháp" | status = Draft trước submit | | |

---

## 5. Admin Panel - Sửa bài viết (/admin/posts/[id]/edit)

### 5.1 Page Load
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 5.1.1 | Load với ID hợp lệ | Form populated với data | | |
| 5.1.2 | Load với ID không tồn tại | "Không tìm thấy bài viết" | | |
| 5.1.3 | Loading state | Spinner hiện | | |

### 5.2 Form Population
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 5.2.1 | Title populated | Giá trị đúng từ DB | | |
| 5.2.2 | Slug populated | Giá trị đúng | | |
| 5.2.3 | Content populated | Lexical editor có content | | |
| 5.2.4 | Excerpt populated | Nếu có, hiển thị đúng | | |
| 5.2.5 | Category selected | Dropdown chọn đúng | | |
| 5.2.6 | Status selected | Dropdown chọn đúng | | |
| 5.2.7 | Thumbnail hiển thị | Nếu có, hiện preview | | |

### 5.3 Edit & Update
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 5.3.1 | Sửa title | State update | | |
| 5.3.2 | Sửa slug (không trùng) | OK | | |
| 5.3.3 | Sửa slug (trùng với bài khác) | Error "Slug already exists" | | |
| 5.3.4 | Sửa content | Lexical capture changes | | |
| 5.3.5 | Đổi category | Dropdown update | | |
| 5.3.6 | Đổi status Draft → Published | publishedAt được set | | |
| 5.3.7 | Submit update | Toast "Cập nhật bài viết thành công" | | |
| 5.3.8 | Redirect sau update | Navigate /admin/posts | | |

### 5.4 Thumbnail Management
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 5.4.1 | Hiện preview thumbnail | Hình hiển thị | | |
| 5.4.2 | Nút xóa thumbnail | (Nếu implemented) | | |
| 5.4.3 | Upload thumbnail mới | (Nếu implemented) | | |

---

## 6. Tích hợp System ↔ Admin

### 6.1 Field Sync
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 6.1.1 | Disable "excerpt" trong System | Field không hiện trong Admin Create/Edit | | |
| 6.1.2 | Enable "excerpt" lại | Field hiện lại trong Admin | | |
| 6.1.3 | Disable "thumbnail" trong System | Upload area ẩn (nếu implemented) | | |

### 6.2 Feature Sync
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 6.2.1 | Disable "Tags" feature | Field tags ẩn trong Admin (nếu có) | | |
| 6.2.2 | Disable "Nổi bật" feature | Field featured ẩn (nếu có) | | |
| 6.2.3 | Disable "Hẹn giờ" feature | Field publish_date ẩn (nếu có) | | |

### 6.3 Settings Sync
| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 6.3.1 | Thay đổi "defaultStatus" → "published" | Bài mới default "Đã xuất bản" | | |
| 6.3.2 | Thay đổi "postsPerPage" | (Nếu pagination implemented) | | |

---

## 7. Edge Cases & Error Handling

| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 7.1 | Network offline khi Save | Toast error, retry possible | | |
| 7.2 | Concurrent edit (2 tabs) | Last write wins hoặc conflict detection | | |
| 7.3 | Delete category đang có posts | Error "Cannot delete category with posts" | | |
| 7.4 | Delete category có children | Error "Cannot delete category with children" | | |
| 7.5 | XSS trong title/content | HTML escaped, không execute | | |
| 7.6 | Very long title (>500 chars) | Truncate hoặc validate | | |
| 7.7 | Empty content submit | Cho phép hoặc validate? | | |

---

## 8. Performance & UX

| # | Test Case | Expected | Pass/Fail | Ghi chú |
|---|-----------|----------|-----------|---------|
| 8.1 | Page load time < 2s | Loading nhanh | | |
| 8.2 | Realtime update khi data change | Convex subscription hoạt động | | |
| 8.3 | Toast không bị overlap | Hiển thị tuần tự | | |
| 8.4 | Dark mode support | UI không bị vỡ | | |
| 8.5 | Responsive mobile | Layout không bị vỡ | | |
| 8.6 | Keyboard navigation | Tab order đúng | | |

---

## Kết quả tổng hợp

| Phần | Tổng TC | Pass | Fail | Skip |
|------|---------|------|------|------|
| 1. Tab Cấu hình | 27 | | | |
| 2. Tab Dữ liệu | 35 | | | |
| 3. Admin - Danh sách | 37 | | | |
| 4. Admin - Tạo mới | 28 | | | |
| 5. Admin - Sửa | 18 | | | |
| 6. Tích hợp System↔Admin | 9 | | | |
| 7. Edge Cases | 7 | | | |
| 8. Performance & UX | 6 | | | |
| **TỔNG** | **167** | | | |

---

## Ghi chú QA

- **Tester:**
- **Ngày test:**
- **Môi trường:** localhost:3000
- **Browser:**
- **Convex Dashboard:** https://dashboard.convex.dev

### Bugs phát hiện:
1. 
2. 
3. 

### Suggestions:
1. 
2. 
3. 
