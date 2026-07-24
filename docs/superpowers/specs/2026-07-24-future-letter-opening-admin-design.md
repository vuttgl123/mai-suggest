# Nghi thức mở thư và quản trị thư hẹn — thiết kế

**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.

## Mục tiêu

Làm khoảnh khắc mở thư trở thành một nghi thức Bordeaux có điểm nhấn thị giác
rõ ràng thay vì chỉ là phong bì mở ngắn; đồng thời tách việc quản trị thư vào
một màn hình Owner-only để Owner có thể rà soát và gỡ cả các thư đã đến giờ mở
mà không đưa thao tác quản trị vào trải nghiệm đọc chung.

## Phạm vi trải nghiệm người xem

- Trang `/thu-hen-ngay-mo` vẫn là nơi mọi active member đọc thư đã mở. Không
  có nút quản trị, xóa hay sửa trên các thẻ thư ở trang này.
- Mỗi thẻ mở thư giữ native button, trạng thái focus và reduced motion hiện có,
  nhưng nghi thức được chia thành bốn pha: `sealed`, `unsealing`, `revealing`
  và `opened`.
- Ở pha niêm phong, phong bì có chiều sâu qua mặt giấy, triện sáp, các nếp gấp,
  bóng đổ và một lời mời mở thư rõ ràng.
- Khi mở, triện sáp tan thành các mảnh trang trí tiết chế, nắp thư gập ngược
  lên, nền ánh đồng nở ra và lá thư trồi khỏi phong bì trước khi giãn thành
  vùng đọc. Hiệu ứng dùng CSS animation/compositing trên các lớp hiện có, không
  dùng canvas, WebGL hoặc asset raster mới.
- Ở pha đã mở, thư là một tờ giấy đọc ổn định: tiêu đề, tác giả, nội dung, ảnh
  và nhạc giữ nguyên contract dữ liệu hiện có. Không chạy lại nghi thức khi
  người dùng thao tác với nội dung đã mở trong cùng vòng đời component.
- Với `prefers-reduced-motion`, button chuyển trực tiếp sang pha `opened`; mọi
  thông tin vẫn xuất hiện đầy đủ và không phụ thuộc animation để hiểu nội dung.

## Màn quản trị thư hẹn

- Thêm route `/admin/thu-hen-ngay-mo`, được bảo vệ bằng owner page access và
  có lối vào “Thư hẹn” từ khu vực quản trị hiện có.
- Màn này chỉ dành cho Owner, không tái dùng như một phần giao diện người xem.
  Nó có phần tổng quan nhỏ và hai nhóm rõ ràng: “Đang hẹn” và “Đã mở”.
- Mỗi hàng thể hiện tiêu đề, tác giả, thời điểm mở và trạng thái; danh sách đã
  mở ưu tiên thao tác “Gỡ thư”. Danh sách đang hẹn chỉ để rà soát trong phạm vi
  lần này, không thêm sửa lịch của người khác.
- Gỡ thư có xác nhận tại chỗ với tên thư, trạng thái pending và feedback thành
  công/thất bại. Hành động xóa không xuất hiện với member và không làm thay đổi
  nút Hủy lịch của tác giả trước giờ mở ở trang thư chung.
- Sau khi gỡ thành công, trang được refresh/revalidate theo pattern Server
  Action hiện có để cả danh sách quản trị lẫn trang thư chung không giữ dữ liệu
  cũ.

## Quyền, nghiệp vụ và Supabase

- Quy tắc mới thay thế phần “không ai được xóa sau giờ mở” trong định hướng sản
  phẩm: active member vẫn chỉ sửa/xóa thư của chính mình trước giờ mở; Owner có
  thể đọc và gỡ mọi thư, kể cả sau giờ mở, vì mục đích điều tiết nội dung.
- Thêm use case/reader quản trị yêu cầu `requireCatalogueOwner` để lấy toàn bộ
  thư. Không đưa truy vấn Supabase server-only vào Client Component.
- Thêm Server Action xóa dành riêng cho Owner; application layer kiểm tra Owner
  trước khi repository xóa theo `id`, không tin vào việc ẩn nút ở client.
- Tạo migration SQL mới trong `docs/migrations/` để chỉnh RLS, không chạy SQL
  thay người dùng:
  - policy SELECT cho phép Owner xem thư chưa mở của mọi tác giả;
  - policy DELETE cho phép Owner xóa mọi thư;
  - author vẫn chỉ xóa chính thư của mình khi `opens_at > now()`;
  - UPDATE/INSERT và quyền member còn lại giữ nguyên.
- Không sử dụng service-role key, không tắt RLS, không thêm role mới và không
  cho member quyền gỡ thư đã mở.

## Ranh giới mã dự kiến

- `src/features/future-letters/presentation/future-letter-opening-card.tsx`
  và CSS liên quan: mở rộng nghi thức phong bì và trạng thái animation.
- `src/app/admin/thu-hen-ngay-mo/page.tsx` cùng presentation/module quản trị
  mới: route Owner-only, danh sách đầy đủ, xác nhận gỡ và feedback.
- `src/modules/future-letters`: thêm reader/use case quản trị, action Owner
  và repository contract tối thiểu để xóa theo quyền Owner.
- `src/lib/backend/create-server-backend.ts`: đăng ký use case mới.
- `docs/migrations/2026-07-24-owner-manage-future-letters.sql`: thay policy
  SELECT/DELETE của `future_letters` theo đúng quyền trên.
- `docs/product-direction.md`: thay quy tắc cũ để tài liệu sản phẩm khớp quyền
  Owner mới.

## Ngoài phạm vi

- Không cho Owner hay member sửa nội dung thư đã mở.
- Không thêm xóa hàng loạt, tìm kiếm, phân trang, audit log, khôi phục thư,
  upload ảnh, canvas/WebGL, thư viện animation mới, thông báo hay email.
- Không sửa Google OAuth, profile, role model, theme, catalogue, timeline hoặc
  dữ liệu thư ngoài thao tác xóa Owner đã duyệt.
- Không chạy migration, test, lint, build, browser QA, tạo commit hoặc nhánh;
  các bước đó bị loại khỏi đợt này theo yêu cầu của người dùng.

## Xác minh dự kiến

Rà soát tĩnh đối chiếu reader/action/application/RLS: route quản trị chỉ nhận
Owner, member không có đường gọi xóa Owner, policy SELECT/DELETE tách đúng
Owner và author, các input/quyền cũ không bị nới. Không tuyên bố đã kiểm chứng
database hay giao diện trên browser nếu người dùng vẫn không yêu cầu chạy các
kiểm tra đó.
