# Form hẹn thư dạng studio — thiết kế

**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.

## Mục tiêu

Biến form “Hẹn một lá thư” thành một không gian viết thư cân đối và chuyên
nghiệp: cửa sổ luôn nằm giữa viewport, desktop có bố cục studio hai vùng rõ
ràng, mobile vẫn là một luồng nhập một cột dễ cuộn và dễ hoàn tất.

## Chẩn đoán và nguyên tắc định vị

- Dialog hiện chỉ có width, không có quy tắc căn giữa tường minh, nên phụ thuộc
  vào user-agent style của browser và có thể lệch trái.
- Dialog phải có `fixed inset-0 m-auto` cùng width/max-height rõ ràng khi mở;
  backdrop và top layer native của `<dialog>` giữ nguyên.
- Dialog không tự cuộn toàn bộ: dùng khung grid gồm header, body cuộn độc lập
  và footer. Điều này giữ tiêu đề, nút đóng cùng hành động Hủy/Lưu ổn định khi
  nội dung lá thư dài.

## Bố cục studio

- Header có kicker, tiêu đề theo create/edit mode, đường trang trí mảnh và nút
  đóng. Nội dung được canh trái có chủ ý trong một cửa sổ đã căn giữa, không còn
  cảm giác trôi về bên trái viewport.
- Body desktop từ `1024px` dùng hai cột: cột viết thư rộng hơn chứa tiêu đề và
  textarea; cột hẹn mở chứa ngày/giờ cùng phần ảnh, mô tả ảnh và bài hát.
- Body dưới `1024px` dùng một cột theo thứ tự viết thư → thời điểm mở → điều đi
  cùng thư. Không có sidebar cố định hoặc cuộn ngang.
- Khối nhắc quyền riêng tư trở thành note giấy nhẹ ngay đầu body. Các section
  có border, nền giấy có sắc độ khác nhau vừa đủ để định hướng mà không tạo
  nhiều card rời rạc.
- Footer nằm trong khung riêng, border-top tinh tế; desktop căn nút về bên phải,
  mobile xếp hợp lý mà không làm CTA “Niêm phong lá thư” bị lép vế.

## Hành vi và dữ liệu

- Giữ nguyên `FutureLetterComposer` là Client Component, API props, draft,
  validation, `createFutureLetterAction`, `updateFutureLetterAction`, refresh,
  tạo/sửa mode và copy phản hồi hiện có.
- Đóng dialog bằng nút X, Hủy hoặc native close vẫn gọi `onClose`; lúc pending
  các control vẫn bị disabled như hiện tại.
- Không thêm state, query, Server Action, thư viện dialog hay logic ảnh/nhạc
  mới. Đây là refactor cấu trúc JSX và style, không thay đổi nghiệp vụ.

## Khả năng truy cập và responsive

- Giữ `<dialog>`, `showModal`, `aria-labelledby`, `<form>`, `<fieldset>`,
  `<legend>`, label/input hiện có và focus native.
- Body cuộn độc lập với `min-h-0` để bàn phím ảo/màn hình thấp không đẩy footer
  ra khỏi vùng thao tác; dialog không vượt viewport ở mobile.
- Căn giữa bằng CSS tường minh cho mọi kích thước, không dùng transform hoặc
  JavaScript đo viewport. Không thêm animation mới.

## Thay đổi mã dự kiến

- `src/features/future-letters/presentation/future-letter-composer.tsx`: chia
  form thành header, body grid và footer; nhóm các field theo hai vùng studio;
  thêm class semantic cục bộ để CSS xử lý bố cục.
- `src/app/globals.css`: định vị/căn giữa dialog, style khung composer, vùng
  scroll, section giấy và responsive desktop/mobile.
- Không đổi domain model, actions, route, Supabase, permissions hay component
  đọc thư.

## Ngoài phạm vi

- Thay đổi luồng tạo/sửa/lưu thư, nội dung validation, dữ liệu, RLS, Supabase,
  ảnh upload, preview media, dialog library, animation hay thiết kế trang thư
  đã mở.
- Test, lint, build, browser QA, commit hoặc tạo nhánh theo yêu cầu đã chốt.

## Xác minh dự kiến

Chỉ rà soát tĩnh: dialog có căn giữa tường minh, markup có header/body/footer,
body có grid hai cột từ 1024px và một cột dưới breakpoint, các field/action/
props giữ nguyên, body độc lập cuộn và diff giới hạn vào composer, CSS, tài liệu
liên quan. Không tuyên bố đã QA hình ảnh hoặc browser vì không chạy
browser/test/build theo yêu cầu.
