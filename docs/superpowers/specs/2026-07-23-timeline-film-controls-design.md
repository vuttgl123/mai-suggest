# Điều hướng cuộn phim Hành trình — thiết kế

**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.

## Mục tiêu

Hoàn thiện điều hướng cuộn phim của trang Hành trình theo từng nền tảng: desktop
có hai nút trái/phải tinh tế để đi chính xác từng chương, còn mobile/tablet dùng
vuốt ngang native nhưng vẫn cuộn cả trang lên/xuống bình thường.

## Phạm vi trải nghiệm

- Chỉ áp dụng cho film strip trên trang Hành trình. Không đổi các trang hoặc
  vùng cuộn ngang khác.
- Desktop từ `1024px`: hiển thị nút trái và phải ở hai mép vùng film strip. Mỗi
  lần bấm đi đúng một frame/chương theo thứ tự dữ liệu.
- Mobile và tablet dưới `1024px`: không hiển thị nút; người xem vuốt ngang để
  xem chương kế tiếp/trước đó và cuộn dọc trang như mọi vùng nội dung khác.
- Với một chương duy nhất, không render điều khiển desktop vì không có nơi để
  điều hướng.

## Hành vi cuộn

- Bỏ `touch-action: pan-x` khỏi viewport. `overflow-x: auto`, scroll snap và
  `overscroll-behavior-x: contain` giữ nguyên để vuốt ngang native vẫn hoạt
  động, trong khi trình duyệt được phép xử lý gesture dọc cho toàn trang.
- Nút desktop tìm frame đang gần mép trái vùng nhìn nhất, chọn frame liền trước
  hoặc sau nó, rồi cuộn viewport đến đúng vị trí frame đó. Không cuộn cả trang,
  không thay đổi URL và không autoplay.
- Nút trái bị vô hiệu ở frame đầu; nút phải bị vô hiệu ở frame cuối. Trạng thái
  cập nhật theo sự kiện scroll và resize của viewport.
- Keyboard và screen reader dùng hai `<button>` thật với `aria-label` và
  `aria-controls` trỏ tới viewport. Native scroll và scroll-snap vẫn có sẵn cho
  trackpad/scrollbar.

## Cấu trúc và ranh giới client/server

- `RelationshipTimeline` giữ là Server Component, vẫn fetch/render dữ liệu như
  hiện tại. Nó cấp một `id` ổn định cho viewport, bọc viewport trong stage và
  chỉ render điều khiển khi `entries.length > 1`.
- Thêm `TimelineFilmControls` là Client Component nhỏ, chỉ nhận `viewportId`.
  Component tự đọc viewport trong browser, lắng nghe scroll/resize bằng listener
  passive + `ResizeObserver`, và chỉ lưu hai boolean trạng thái có thể đi trước/
  sau. Không nhận hay serialize dữ liệu entry, actor hoặc nội dung chapter.
- Frame được tìm bằng class `.timeline-film-frame` đã là contract của strip;
  không thêm query, Server Action, state URL hay thư viện carousel.

## Hình thức

- Stage là vùng `position: relative`; desktop đặt cặp nút tuyệt đối ở chính giữa
  hai mép của vùng frame. Nút không chiếm không gian đọc hoặc đẩy layout.
- Nút là hình tròn bề mặt giấy sáng, viền Bordeaux mảnh, bóng mềm, icon chevron
  Lucide, focus ring rõ và trạng thái disabled giảm tương phản/không nhận click.
- Điều khiển bị ẩn hoàn toàn dưới `1024px`. Không thêm hiệu ứng phô trương hay
  thay đổi hình thức film strip hiện có.

## Trạng thái biên

- Nếu không tìm thấy viewport hoặc frame do DOM thay đổi, component không thực
  hiện cuộn và không ném lỗi; nút ở trạng thái disabled.
- Khi resize làm thay đổi độ rộng frame/viewport, trạng thái đầu-cuối được tính
  lại từ vị trí cuộn hiện tại.
- `prefers-reduced-motion` dùng cuộn tức thời; các môi trường khác có thể dùng
  cuộn mượt ngắn cho thao tác bấm nút. Vuốt native không bị ép animation.

## Thay đổi mã dự kiến

- `src/features/timeline/presentation/timeline-film-controls.tsx`: Client
  Component mới chứa logic tìm frame, điều khiển trái/phải, trạng thái biên và
  accessibility.
- `src/features/timeline/presentation/relationship-timeline.tsx`: gắn `id` cho
  viewport, thêm stage wrapper và render controls có điều kiện.
- `src/app/globals.css`: bỏ `touch-action: pan-x`; thêm stage/controls và style
  desktop-only cho nút.

## Ngoài phạm vi

- Áp dụng nút này cho trang khác, carousel/drag library, autoplay, pagination,
  thay đổi dữ liệu, URL, quyền, admin, Supabase, View Transition hoặc thiết kế
  lại card nội dung.
- Test, lint, build, browser QA, commit hoặc tạo nhánh theo yêu cầu đã chốt.

## Xác minh dự kiến

Chỉ rà soát tĩnh: `touch-action: pan-x` không còn trên film viewport; controls
chỉ render khi có hơn một entry; button thật có nhãn và `aria-controls`; code
chỉ cuộn viewport theo một `.timeline-film-frame`; CSS ẩn controls dưới 1024px;
và diff giới hạn trong component, CSS và tài liệu liên quan. Không tuyên bố đã
QA gesture hay browser vì không chạy browser/test/build theo yêu cầu.
