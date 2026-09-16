# Lộ trình Tái cấu trúc Hộp thư Tương lai (Future Letters Cohesion)

## 1. Bối cảnh
Trang Hộp thư tương lai (`/thu-hen-ngay-mo`) hiện tại vẫn đang mang thiết kế cũ với nhiều shadow lố, các kiểu chữ italic, thẻ bọc ngoài có gradient, và header chưa đồng bộ với thẻ layout mới. 

## 2. Mục tiêu (Mốc C)
- Mở rộng chuẩn giao diện đã áp dụng ở Trang chủ (Mốc A) và Hành trình (Mốc B) sang cho Hộp thư.
- Sử dụng tính năng mới `ViewTransition` của React 19 để cải thiện cảm giác chuyển đổi (ví dụ khi một bức thư từ trạng thái đóng sang trạng thái đang mở/đọc).

## 3. Các bước triển khai

### Giai đoạn 1: Làm sạch CSS và Layout
- Sửa `future-letters-experience.tsx`: Áp dụng `journey-layout`, bỏ gradient, italic, các hiệu ứng bóng quá gắt.
- Cập nhật Kicker và Tiêu đề trang cho đồng bộ với `/hanh-trinh`.
- Làm gọn phần Dashboard nhỏ đếm số lượng thư (bỏ các vòng tròn deco vô nghĩa, chỉ dùng wash tinh tế).

### Giai đoạn 2: Component cấp thấp
- Sửa `scheduled-letter-list.tsx`: Bỏ hiệu ứng list không cần thiết, dọn dẹp các UI dư thừa.
- Sửa `future-letter-opening-card.tsx`:
  - Dùng thẻ viền mềm, bỏ glow và drop-shadow-sm.
  - Áp dụng `<ViewTransition>` khi người dùng bấm vào xem thư, tạo cảm giác mượt mà từ preview -> detail.
- Sửa `future-letter-composer.tsx` (nếu cần thiết): Loại bỏ bóng đổ/gradient khỏi modal viết thư.

### Giai đoạn 3: Kiểm thử và Nghiệm thu
- Kiểm tra lại Type của React 19 View Transition (nếu có lỗi thì bypass type hoặc import đúng `import { ViewTransition } from "react";`).
- Đảm bảo `rtk tsc` báo cáo 0 lỗi.
- Xác nhận các test không bị ảnh hưởng.
