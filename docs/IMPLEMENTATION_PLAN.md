# Nhật ký triển khai Điều Em Yêu

Cập nhật gần nhất: **2026-07-16 12:28 (Asia/Bangkok)**.

Đọc bảng v3 và mục **Điểm tiếp tục duy nhất** trước. Không cần kiểm tra lại mốc đã **THÀNH CÔNG** nếu phần liên quan chưa thay đổi.

## Phiên bản v3

| Mã mốc | Phạm vi | Trạng thái | Bằng chứng |
| --- | --- | --- | --- |
| `thiet_ke_phan_trang_v3_2026-07-16_10-40` | Một danh mục mỗi lần; tối đa hai hàng theo breakpoint | **THÀNH CÔNG** | Page size 4/6/8/10 tương ứng grid 2/3/4/5 cột; cấu hình dùng chung tại `catalogue-layout.ts` |
| `qua_nhieu_dip_v3_2026-07-16_10-40` | Gợi ý quà cho sinh nhật, kỷ niệm, ngày lễ và ngày thường | **THÀNH CÔNG** | 7 danh mục, 42 item; “Quà và những bất ngờ” có 12 gợi ý; không có danh mục sinh nhật riêng |
| `loi_nhan_card_v3_2026-07-16_10-40` | Dialog mô tả và lời nhắn riêng khi mở card | **THÀNH CÔNG** | 42/42 item có `message`; type và validator bắt buộc trường này; dialog có focus trap, Escape và scroll lock |
| `base_catalogue_v3_2026-07-16_10-40` | Base component chung, không lặp theo danh mục | **THÀNH CÔNG** | Mọi JSON đi qua cùng `PreferenceGrid`, `PreferenceCard`, `ProductPagination` và `ProductMessageDialog` |
| `deploy_vercel_v3_2026-07-16_11-26` | Build và khả năng truy cập production trên Vercel | **CHƯA THÀNH CÔNG** | Pipeline build thành công: compile, TypeScript và 4/4 static pages đạt. Tuy nhiên URL người dùng mở trả Vercel Edge `404 NOT_FOUND` tại `hkg1`; cần kiểm tra URL deployment/production alias |
| `kiem_thu_v3_2026-07-16_10-40` | Dữ liệu, ảnh, lint, build và browser QA | **CHƯA THÀNH CÔNG** | Dữ liệu hợp lệ, ID/ảnh duy nhất, 43/43 URL ảnh HTTP thành công và lint/build đã qua. Chưa xác minh trực quan production |

## Điểm tiếp tục duy nhất

Tiếp tục `deploy_vercel_v3_2026-07-16_11-26`:

1. Lấy nguyên URL đang trả `404 NOT_FOUND` và URL generated deployment từ nút **Visit** trong Vercel.
2. Nếu generated deployment hoạt động nhưng production domain lỗi, kiểm tra và gán lại production alias trong **Settings → Domains**.
3. Nếu cả generated deployment lỗi, kiểm tra deployment có trạng thái **Ready**, chưa bị xóa và đúng account/team scope.
4. Sau khi URL hoạt động, tiếp tục browser QA tại 320px, 390px, 768px, 1024px và 1440px.
5. Kiểm tra phân trang, dialog lời nhắn, thích/thích nhất, localStorage, summary, clipboard, mailto và reset.

## Lịch sử

Các mốc v1 và v2 về nền tảng, localStorage, summary, email, dữ liệu tách file, ảnh và giao diện editorial đã qua lint/build. Browser QA cũ chưa hoàn tất và được thay thế bằng các mốc v3 ở trên.
