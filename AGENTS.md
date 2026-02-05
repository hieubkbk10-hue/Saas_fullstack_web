# Custome Rule
Sau khi chạy xong lệnh phải phát âm thanh C:\Users\VTOS\.factory\noti.mp3
Trả lời bằng Tiếng Việt
Tuân thủ nghiêm ngặc KISS, YAGNI, DRY
Tuân thủ Rails Convention Over Configuration
Khi user đưa URL localhost (ví dụ http://localhost:3000/...), hãy đọc route tương ứng trong Next.js để hiểu, không hỏi lại.
Mọi thay đổi code khi hoàn thành đều phải commit (nhưng không được push nha). Trước khi commit chỉ chạy bunx oxlint --type-aware --type-check --fix khi có thay đổi code/TS; không chạy khi chỉ sửa docs/cấu hình không liên quan.

# Prompt Best Practices (để tăng độ chính xác)
* Nêu rõ yêu cầu + phạm vi; không mở rộng tính năng ngoài yêu cầu.
* Tách bạch: yêu cầu, ngữ cảnh, đầu vào, định dạng đầu ra.
* Ép ngắn gọn + cấu trúc rõ (ưu tiên bullet ngắn).
* Nếu mơ hồ: ưu tiên dùng SUB AGENT WEBSEARCH để tìm best practice; chỉ hỏi 1 câu làm rõ khi thật cần thiết.
* Khi cần dữ liệu cụ thể: ưu tiên dùng tool/WebSearch thay vì đoán.

# 7 Nguyên tắc DB Bandwidth Optimization:
* Filter ở DB, không ở JS - Không .collect()/.findAll() không filter; không fetch ALL rồi filter JS; không fetch ALL để count
* Không N+1 - Không gọi DB trong loop; batch load bằng Promise.all(); dùng Map thay .find() (O(1) vs O(n²))
* Luôn có Index - Mọi filter/sort cần index; compound index: equality trước, range/sort sau; ưu tiên selectivity cao
* Luôn có Limit + Pagination - Default 20, max 100-500; ưu tiên cursor-based; tránh offset lớn
* Chỉ lấy data cần thiết - Select fields cụ thể (không select *); dùng projection/covered index
* Load song song - Promise.all() cho independent queries; batch load relations cùng lúc
* Monitor trước deploy - Setup budget alerts (50/90/100%); estimate: Records × Size × Requests/day; track slow queries > 1s