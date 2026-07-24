# Ảnh nền và liên kết nhạc của thư hẹn — thiết kế

**Trạng thái:** Đã được người dùng duyệt, triển khai và rà soát tĩnh theo đặc tả này.

## Mục tiêu

Để ảnh đính kèm trở thành chất liệu của cả lá thư thay vì một khối nội dung ở
cuối, đồng thời đặt liên kết bài hát cạnh tiêu đề để hai chi tiết cảm xúc được
nhìn thấy ngay khi bắt đầu đọc thư.

## Hướng thiết kế đã chọn

Ảnh phủ nền toàn bộ tờ giấy thư. Một lớp giấy Bordeaux có độ mờ thích ứng và
gradient tối dần ở vùng có chữ nằm trên ảnh, tạo cảm giác ảnh nằm trong thớ
giấy nhưng bảo toàn độ tương phản của tiêu đề, nội dung và metadata.

Hai hướng còn lại đã được loại bỏ: ảnh chỉ ở dải đầu thư vẫn giống banner,
còn ảnh nền không có lớp giấy khiến nội dung khó đọc với ảnh sáng hoặc nhiều
chi tiết.

## Trải nghiệm đọc thư

- Khi thư có đủ `imageUrl` và `imageAltText`, ảnh được render như một lớp nền
  phủ kín `.future-letter-paper`, dùng `object-cover` để không méo hình. Ảnh
  không còn xuất hiện thành khung riêng sau nội dung thư.
- Lớp ảnh vẫn là phần tử ảnh có `alt` của tác giả, không biến thành CSS
  `background-image`, để ý nghĩa của ảnh không mất với công cụ hỗ trợ.
- Trên ảnh có một lớp gradient giấy Bordeaux và texture giấy hiện hữu. Vùng
  đầu thư, tiêu đề và phần cuối được che đậm hơn vừa đủ; không đặt màu chữ
  trực tiếp lên ảnh không che.
- Toàn bộ nội dung đọc nằm trên layer ảnh/overlay theo z-index rõ ràng. Không
  đổi trình tự DOM, nghi thức mở phong bì, focus sau khi mở hay reduced motion.
- Nếu thiếu một trong hai giá trị ảnh, lá thư giữ đúng giao diện giấy hiện có;
  không render lớp nền trống và không thay đổi chiều cao của vùng đọc.
- Ảnh giữ trạng thái tải/fallback hiện có của `CatalogueItemImage`; nếu không
  tải được thì chỉ phần nền quay về giấy Bordeaux, còn lá thư vẫn đọc đầy đủ.

## Liên kết bài hát

- Nếu có `musicUrl`, action “Bài hát” nằm trong cùng cụm với tiêu đề thư,
  ngay dưới kicker “Đã mở ra”. Trên màn rộng nó canh về phía phải của tiêu đề;
  trên màn hẹp nó tự xuống hàng mà không làm tiêu đề bị cắt.
- Action là liên kết ngoài an toàn như hiện có (`target="_blank"` và
  `rel="noreferrer"`), có biểu tượng nhạc và nhãn rõ ràng. Bản sao liên kết ở
  cuối nội dung bị gỡ để chỉ còn một điểm đến.
- Không có bài hát thì vùng tiêu đề chỉ hiển thị tiêu đề, không tạo khoảng
  trống hay placeholder.

## Ranh giới kỹ thuật

- Chỉ thay presentation của thư đã mở và CSS ceremony liên quan:
  `src/features/future-letters/presentation/future-letter-opening-card.tsx`
  và `src/app/globals.css`.
- Tái sử dụng `CatalogueItemImage` để giữ cùng cơ chế lazy loading, fade-in và
  fallback của phần danh mục. Có thể thêm modifier CSS cục bộ cho tờ thư,
  nhưng không đổi API dữ liệu của thư hoặc component ảnh dùng ở catalogue.
- Không thay Supabase, migration, schema, action, form soạn thư, URL ảnh/nhạc,
  animation mở phong bì hay trang quản trị thư.

## Tiêu chí hoàn thành

- Ảnh hợp lệ là nền của tờ thư, không còn card ảnh tách rời sau nội dung.
- Văn bản vẫn đọc rõ trên ảnh tối, sáng hoặc có nhiều chi tiết; title và body
  không bị tràn/che trên mobile lẫn desktop.
- Liên kết bài hát nằm cạnh title và wrap tự nhiên trên bề ngang nhỏ.
- Thư không có ảnh hoặc không có nhạc giữ bố cục ổn định, không có khoảng rỗng.
- Giữ được alt của ảnh, keyboard focus của liên kết, reduced motion và fallback
  khi ảnh lỗi.

## Ngoài phạm vi

- Không sinh ảnh mới, upload ảnh, crop editor, chọn vị trí ảnh, palette tự
  động, blur canvas hay thư viện animation mới.
- Không đổi dữ liệu, quyền truy cập, Supabase, migration, test, lint, build,
  browser QA, commit hoặc nhánh theo yêu cầu hiện tại của người dùng.

## Xác minh dự kiến

Chỉ rà soát tĩnh component/CSS/diff: xác nhận layer ảnh không làm mất alt,
music link chỉ còn một lần cạnh title, thư không ảnh/nhạc không render khối
trống và thay đổi không lan ra catalogue. Không tuyên bố đã chạy kiểm tra
runtime hoặc browser.
