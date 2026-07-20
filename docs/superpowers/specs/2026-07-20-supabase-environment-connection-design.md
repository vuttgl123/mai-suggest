# Thiết kế: môi trường Supabase và kiểm tra kết nối

## Mục tiêu

Chuẩn bị tích hợp Supabase tối thiểu cho Next.js và xác nhận dự án có thể gọi
database qua API Supabase. Công việc này không thay đổi UI, Google OAuth, RLS,
schema, migration hoặc luồng dữ liệu mock hiện có.

## Phạm vi thay đổi

1. Cài `@supabase/supabase-js` và `@supabase/ssr`.
2. Tạo `.env.local` từ nguồn credential đã được người dùng cho phép, chỉ với:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Tạo `.env.example` với cùng tên biến và giá trị trống; bảo đảm `.env.local`
   không được Git theo dõi.
4. Thêm script Node server-only `verify:supabase` dùng Supabase JS để gửi một
   truy vấn `select` read-only, giới hạn, tới `categories`.
5. Chạy script và báo trạng thái kết nối mà không in credential hay nội dung dữ
   liệu trả về.

## Kiến trúc và luồng dữ liệu

`npm run verify:supabase` nạp `.env.local` → kiểm tra hai biến bắt buộc → tạo
Supabase client không lưu session → gọi REST API qua `.from("categories")` với
truy vấn chỉ đọc → trả exit code 0 khi request hợp lệ, hoặc exit code khác 0 với
thông báo đã được lọc khi không kết nối/xác thực được.

Publishable key chỉ dùng để chứng thực request tới Supabase API. RLS vẫn áp dụng:
nếu anonymous không được đọc categories, kết quả có thể rỗng nhưng request thành
công; đó là bằng chứng kết nối, không phải bằng chứng rằng anonymous được cấp
quyền. Bài kiểm tra quyền owner/member/anonymous sẽ thuộc bước Auth/RLS riêng.

## Bảo mật

- Không chép `POSTGRES_*`, `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_JWT_SECRET` hoặc Google credential vào `.env.local` cho công việc
  này, vì không cần và có thể vượt RLS/đặt secret vào sai runtime.
- Không dùng service-role để test; không tắt hoặc sửa RLS.
- Không log URL đầy đủ, key, token hoặc records.
- `docs/secret` hiện chưa được ignore. Sau khi kiểm tra thành công, nó cần được
  xoá khỏi workspace hoặc đưa vào vùng lưu trữ bí mật được bảo vệ theo một yêu
  cầu riêng; không tự xoá trong phạm vi hiện tại.

## Kiểm thử và tiêu chí hoàn thành

- `npm run verify:supabase` thành công với `.env.local` hợp lệ và không in
  credential/data.
- Khi thiếu một biến, script fail rõ ràng trước lúc gửi request.
- `npm run lint` và `npm run build` thành công sau khi dependency/script thay đổi.
- Không có file secret mới trong Git status/diff.
