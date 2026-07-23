# Server Page Access Refactor Design

## Mục tiêu

Loại bỏ phần lặp lại khi các trang server tạo backend, xác minh actor hiện tại
và redirect người dùng chưa được cấp quyền. Refactor này giữ nguyên giao diện,
URL, thứ tự tải dữ liệu nghiệp vụ và mọi chính sách Supabase/RLS.

## Vấn đề hiện tại

Bảy trang được bảo vệ lặp cùng một chuỗi:

1. tạo server backend;
2. gọi `getCurrentActor`;
3. chuyển kết quả qua `resolveActivePageAccess`;
4. redirect nếu actor không được phép.

Ba trang quản trị lặp thêm kiểm tra `canManageCatalogue` và redirect tới
`/access-denied`.

Khi thay đổi chính sách redirect hoặc cấp quyền, các chuỗi trùng lặp này dễ lệch
nhau và làm route khó đọc hơn.

## Thiết kế

Thêm một helper server-only tại `src/lib/backend/require-page-access.ts`.

- `requireActivePageAccess()` tạo backend, xác thực actor và trả về `{ actor,
  backend }` khi actor active. Với các trạng thái còn lại, helper giữ nguyên các
  đích redirect hiện hành: `/login`, `/access-denied`, hoặc
  `/login?error=session_check_failed`.
- `requireCatalogueOwnerPageAccess()` dùng helper trên, sau đó xác minh
  `actor.canManageCatalogue`; actor không phải Owner vẫn redirect tới
  `/access-denied`.
- Cả hai helper là server-only. Chúng không cache actor hoặc dữ liệu, không đưa
  backend sang Client Component và không thay thế RLS.

## Áp dụng route

`requireActivePageAccess()` thay chuỗi guard lặp tại:

- `/`
- `/catalogue/[slug]`
- `/hanh-trinh`
- `/thu-hen-ngay-mo`

`requireCatalogueOwnerPageAccess()` thay chuỗi guard lặp tại:

- `/admin`
- `/admin/hanh-trinh`
- `/admin/khong-khi`

Những trang có `params` hoặc `searchParams` vẫn khởi tạo promise access song
song với promise params trước khi chạy các query phụ thuộc actor. Các query,
mapping kết quả, lỗi domain, component props và cấu trúc JSX của mỗi page không
đổi.

## Ngoài phạm vi

- Không tách `admin-item-editor` hoặc thay đổi form quản trị.
- Không thay đổi component client, style, animation, transition hoặc ảnh.
- Không thay đổi Supabase schema, migration, RLS, Auth, Server Action, cache hay
  route handler.
- Không tạo branch hoặc commit.

## Xác minh

Đối chiếu source và diff để bảo đảm bảy routes dùng đúng helper, các đích
redirect giữ nguyên, và chỉ có một client/server boundary mới là server-only.
Theo yêu cầu hiện hành, không chạy test, lint, typecheck, build hay browser QA.
