# Hành trình cuộn phim đồng cấp — thiết kế

**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.

## Mục tiêu

Trình bày mọi chương trong Hành trình với cùng một cấp bậc thị giác: cùng nằm
trong cuộn phim ngang, cùng cấu trúc frame và cùng mốc thời gian. Không còn
chương nào được coi là cảnh mở đầu hay nổi bật hơn các chương khác.

## Phạm vi bố cục

- Giữ phần giới thiệu đầu trang để đặt cảm xúc cho Hành trình.
- Bỏ hoàn toàn khối `TimelineFeaturedChapter`, nhãn “Một chương đang mở” và
  tiêu đề “Điều mình đang cùng viết”.
- Toàn bộ `entries`, gồm cả phần tử đầu tiên, được render theo thứ tự dữ liệu
  trong một film strip duy nhất. `TimelineChapterCard` nhận `sequence` bắt đầu
  từ 1.
- Khi chưa có dữ liệu, giữ nguyên trạng thái rỗng hiện tại.
- Header, dữ liệu timeline, ảnh, phản hồi, quyền, admin và Supabase không đổi.

## Cuộn phim và mốc thời gian

- Giữ cơ chế cuộn native hiện hữu: viewport ngang, `scroll-snap` theo frame,
  `overscroll-behavior-x: contain`, `touch-action: pan-x` và native scrollbar.
  Không thêm carousel JavaScript, auto-scroll, drag library hoặc request dữ
  liệu client.
- Mỗi entry là một frame có cùng class và cùng thành phần mốc dưới card: đường
  rail ngắn, chấm Bordeaux, ngày và tên chương. Dù nội dung dài khác nhau, các
  mốc vẫn thẳng hàng nhờ hàng grid chung.
- Hiệu ứng lỗ phim, bề mặt giấy, kích thước responsive và tối ưu
  `content-visibility` của các frame giữ nguyên.

## Khả năng truy cập và trạng thái biên

- Vùng film strip tiếp tục có nhãn truy cập và nhận focus; danh sách vẫn dùng
  cấu trúc ngữ nghĩa `<ol>` / `<li>`.
- Một entry vẫn được hiển thị như một frame duy nhất; không tạo khối đặc biệt.
- Không đổi xử lý ảnh, nội dung dài, phản hồi hoặc quyền chỉnh sửa trong từng
  `TimelineChapterCard`.

## Thay đổi mã dự kiến

- `relationship-timeline.tsx`: dùng toàn bộ `entries` cho film strip duy nhất,
  bỏ import/render `TimelineFeaturedChapter`, wrapper điều kiện `featuredEntry`
  và section của chương nổi bật; giữ `TimelineFilmMarker` cho từng frame.
- `globals.css`: chỉ điều chỉnh selector khi cần để film strip đứng độc lập;
  không thiết kế một biến thể frame đầu tiên.
- Không thay đổi API props, domain model, route, query Supabase hay component
  card.

## Ngoài phạm vi

- Chọn thủ công chương nổi bật, thay đổi thứ tự entry hoặc thêm trường dữ liệu
  để đánh dấu ưu tiên.
- Carousel JavaScript, nút trái/phải, autoplay, pagination, View Transition mới
  hoặc thay đổi URL.
- Test, lint, build, browser QA, commit hoặc tạo nhánh theo yêu cầu đã chốt.

## Xác minh dự kiến

Chỉ rà soát tĩnh: mọi `entries` được map trong một `<ol>` duy nhất, số thứ tự
bắt đầu từ 1, không còn import/render `TimelineFeaturedChapter` hay text của
khối nổi bật, marker đủ ngày và tiêu đề, dữ liệu/quyền giữ nguyên và diff chỉ
chạm phạm vi cần thiết. Không tuyên bố đã QA tương tác vì không chạy
browser/test/build theo yêu cầu.
