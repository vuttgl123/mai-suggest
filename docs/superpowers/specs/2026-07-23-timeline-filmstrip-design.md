# Hành trình cuộn phim ngang — thiết kế

**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.

## Mục tiêu

Biến phần các chương đã viết trong Hành trình từ timeline dọc xen kẽ thành một
cuộn phim ngang có thể vuốt. Mỗi chương là một frame; ngay dưới frame là mốc
riêng gồm chấm, ngày và tiêu đề chương để người đọc nhận ra nhịp thời gian mà
không phải dùng một thanh dọc tách rời.

## Phạm vi bố cục

- `TimelineFeaturedChapter` vẫn là cảnh mở đầu lớn, đặt phía trên như hiện tại.
  Nó không được đưa vào film strip để giữ một điểm bắt đầu cảm xúc rõ ràng.
- Chỉ `chapterEntries` (các chương sau cảnh mở đầu) dùng film strip.
- Header, trạng thái không có dữ liệu, dữ liệu timeline, ảnh, phản hồi, quyền,
  admin và Supabase không đổi.

## Cuộn phim

- Dùng cuộn ngang native trên một `<ol>` có `overflow-x: auto`, `scroll-snap`
  theo từng frame, `overscroll-behavior-x: contain` và `touch-action: pan-x`.
  Không thêm carousel JavaScript, drag library hay request dữ liệu client.
- Frame rộng khoảng 84–88% viewport trên mobile để vẫn thấy mép frame tiếp theo;
  từ màn hình rộng hơn, frame giữ bề rộng đọc thoải mái khoảng 24–27rem. Người
  dùng vuốt trên cảm ứng hoặc cuộn ngang tự nhiên bằng trackpad/scrollbar trên
  desktop.
- Film strip có bề mặt giấy Bordeaux hiện hữu, đường viền tinh tế và dải lỗ
  phim nhỏ ở đầu/cuối viewport bằng CSS trang trí. Không dùng nền đen, neon,
  poster phim hoặc hiệu ứng chuyển động mới.
- Cả strip có nhãn truy cập riêng và nhận focus bằng bàn phím. Native scrollbar
  được giữ để không che mất khả năng khám phá trên desktop.

## Frame và mốc thời gian

- Mỗi `<li>` là một cột flex, card nội dung (`TimelineChapterCard`) chiếm phần
  thân còn mốc ở đáy. Cùng một grid row làm các mốc thẳng hàng, kể cả khi phần
  chữ của từng card dài khác nhau.
- Mốc gồm đoạn rail ngang ngắn, chấm Bordeaux viền giấy, `entry.dateLabel` và
  `entry.title` (tối đa hai dòng). Tên chương xuất hiện tại chính dấu mốc theo
  yêu cầu, trong khi tiêu đề đầy đủ trong card vẫn giữ để đọc liên tục và có
  heading của nội dung.
- Số thứ tự nhẹ trong card, nội dung, ảnh, quote và phản hồi giữ nguyên. Frame
  dài dùng `content-visibility: auto` với intrinsic size để cuộn không phải vẽ
  tất cả nội dung ngoài màn hình ngay lập tức.

## Responsive và giảm chuyển động

- Mobile: frame hẹp hơn viewport, snap theo đầu frame và mốc nằm ngay bên dưới
  card; thao tác chính là vuốt.
- Tablet/desktop: frame không phình quá rộng, nhiều frame có thể hiện trong vùng
  nhìn; trackpad/scrollbar dùng được, không có auto-scroll.
- Không dùng `scroll-behavior: smooth` riêng cho strip; `prefers-reduced-motion`
  không bị thêm animation hay thay đổi hành vi bất ngờ.

## Thay đổi mã dự kiến

- `relationship-timeline.tsx`: thay `<ol className="timeline-rail">` bằng
  viewport film strip, frame class và `TimelineFilmMarker` cục bộ để render
  `dateLabel` + `title` dưới mỗi `TimelineChapterCard`.
- `globals.css`: thay các selector `timeline-rail`/`timeline-entry` dọc bằng
  selector film strip ngang, khung frame, mốc dưới card và media query liên quan.
- `timeline-chapter-card.tsx`: chỉ bổ sung class cho phép card chiếm thân frame
  khi cần; không đổi props hay nội dung.

## Ngoài phạm vi

- Carousel JavaScript, nút điều khiển trái/phải, autoplay, drag dependency,
  View Transition mới, pagination hay thay đổi URL.
- Đưa chương nổi bật vào strip, đổi thứ tự dữ liệu, thay đổi mốc admin hoặc
  thêm dữ liệu mới.
- Test, lint, build, browser QA, commit hoặc tạo nhánh theo yêu cầu đã chốt.

## Xác minh dự kiến

Chỉ rà soát tĩnh: cấu trúc `ol/li`, các class scroll-snap/focus/reduced-motion,
marker đủ `dateLabel` + `title`, dữ liệu và quyền giữ nguyên, và diff giới hạn
vào ba file đã nêu. Không tuyên bố đã QA tương tác vì user không yêu cầu chạy
browser/test/build.
