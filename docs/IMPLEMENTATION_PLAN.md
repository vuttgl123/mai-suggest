# Nhật ký triển khai Điều Em Yêu

Cập nhật gần nhất: **2026-07-16 11:20 (Asia/Bangkok)**.

Đọc bảng v3 và mục **Điểm tiếp tục duy nhất** trước. Không cần kiểm tra lại mốc đã **THÀNH CÔNG** nếu phần liên quan chưa thay đổi.

## Phiên bản v3

| Mã mốc | Phạm vi | Trạng thái | Bằng chứng |
| --- | --- | --- | --- |
| `thiet_ke_phan_trang_v3_2026-07-16_10-40` | Một danh mục mỗi lần; tối đa hai hàng theo breakpoint | **THÀNH CÔNG** | Page size 4/6/8/10 tương ứng grid 2/3/4/5 cột; cấu hình dùng chung tại `catalogue-layout.ts` |
| `qua_nhieu_dip_v3_2026-07-16_10-40` | Gợi ý quà cho sinh nhật, kỷ niệm, ngày lễ và ngày thường | **THÀNH CÔNG** | 7 danh mục, 42 item; “Quà và những bất ngờ” có 12 gợi ý; không có danh mục sinh nhật riêng |
| `loi_nhan_card_v3_2026-07-16_10-40` | Dialog mô tả và lời nhắn riêng khi mở card | **THÀNH CÔNG** | 42/42 item có `message`; type và validator bắt buộc trường này; dialog có focus trap, Escape và scroll lock |
| `base_catalogue_v3_2026-07-16_10-40` | Base component chung, không lặp theo danh mục | **THÀNH CÔNG** | Mọi JSON đi qua cùng `PreferenceGrid`, `PreferenceCard`, `ProductPagination` và `ProductMessageDialog` |
| `kiem_thu_v3_2026-07-16_10-40` | Dữ liệu, ảnh, lint, build và browser QA | **CHƯA THÀNH CÔNG** | Dữ liệu hợp lệ, ID/ảnh duy nhất, 43/43 URL ảnh HTTP thành công, lint/build đã qua. Chưa có trình duyệt tích hợp để xác minh trực quan |

## Điểm tiếp tục duy nhất

Tiếp tục `kiem_thu_v3_2026-07-16_10-40` khi có trình duyệt tích hợp:

1. Kiểm tra 320px và 390px có đúng 2 cột × tối đa 2 hàng, không tràn ngang.
2. Kiểm tra 768px, 1024px và 1440px lần lượt có 3, 4 và 5 cột.
3. Chuyển tab danh mục và xác nhận trang sản phẩm trở về trang 1.
4. Chuyển trang, mở card, đọc lời nhắn và kiểm tra focus quay lại card khi đóng.
5. Chọn thích/thích nhất trong card và dialog, xác nhận trạng thái đồng bộ.
6. Reload để kiểm tra localStorage, summary, clipboard, mailto và reset.
7. Giả lập `prefers-reduced-motion` và URL ảnh lỗi.

## Lịch sử

Các mốc v1 và v2 về nền tảng, localStorage, summary, email, dữ liệu tách file, ảnh và giao diện editorial đã qua lint/build. Browser QA cũ chưa hoàn tất và được thay thế bằng mốc kiểm thử v3 ở trên.
