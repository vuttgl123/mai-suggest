# Luồng đọc tập trung cho thư hẹn — thiết kế

**Trạng thái:** Đã được người dùng duyệt, triển khai và rà soát tĩnh theo đặc tả này.

## Mục tiêu

Giữ trải nghiệm đọc thư dài nhẹ nhàng và có điểm dừng rõ ràng khi có nhiều thư
đã đến ngày hẹn. Người dùng luôn biết lá thư nào đang đọc, có thể thu gọn nó
ngay sau khi đọc và quay lại bất kỳ thư đã đọc nào mà không lặp lại nghi thức
mở phong bì.

## Hướng thiết kế đã chọn

Khu “Những lá thư đã mở” là một archive có **một lá thư đang đọc**. Lá thư
đang đọc trải toàn bộ bề ngang archive; các lá còn lại là phong bì chưa đọc
hoặc preview “Đã mở”. Mở lá mới tự thu gọn lá đang đọc trước đó.

Hai hướng đã loại bỏ: để tất cả thư bung độc lập sẽ tạo trang quá dài và khó
tìm lại vị trí; dialog hoặc khung cuộn riêng làm việc đọc thư dài khó chịu,
đặc biệt trên điện thoại.

## Trạng thái và tương tác

- `FutureLettersExperience` giữ duy nhất `activeLetterId: string | null` cho
  archive. Đây chỉ là state UI trong bộ nhớ, không ghi vào localStorage hay
  Supabase.
- Thư chưa đọc giữ phong bì và nút “Mở thư”. Lần mở đầu vẫn chạy đầy đủ nghi
  thức `sealed → unsealing → revealing → opened` hiện có.
- Khi người dùng mở phong bì, card báo lên parent để đặt nó thành active; mọi
  card khác đang mở chuyển sang preview “Đã mở”.
- Card đã hoàn tất nghi thức ghi nhớ trạng thái đọc trong vòng đời trang. Sau
  khi thu gọn, nó hiện preview gồm tiêu đề, tác giả, ngày hẹn và nút “Đọc lại”.
  “Đọc lại” đưa card về trạng thái đọc ngay, không tái diễn phong bì hay triện
  sáp.
- Nút “Thu gọn thư” xuất hiện trong phần đầu lá thư đang đọc. Một action cùng
  nghĩa ở cuối nội dung giúp người dùng đọc thư rất dài có thể thu gọn mà không
  cần cuộn về đầu.
- Thu gọn card active đặt `activeLetterId` về `null`, trả archive về lưới
  preview/phong bì. Không xóa dữ liệu, không thay đổi lịch hẹn và không làm
  mất trạng thái thư đã đọc trong cùng lần truy cập trang.

## Trình bày và khả năng đọc

- Chỉ card active có `grid-column: 1 / -1` ở archive; vì vậy nội dung dài có
  chiều rộng đọc ổn định, cuộn bằng trang web tự nhiên và không tạo nested
  scroll trên mobile.
- Preview “Đã mở” có chiều cao gọn, nhận diện bằng kiểu chữ/kicker khác phong
  bì nhưng không giả vờ niêm phong lại lá thư đã đọc. Tiêu đề có wrap và action
  tối thiểu cao 44px để thao tác cảm ứng thuận tiện.
- Nút thu gọn và đọc lại là `button` thật, có focus-visible và copy diễn tả
  hành động. Khi đổi active card, focus được đặt vào vùng đọc của lá mới; khi
  thu gọn, focus quay về nút “Đọc lại” của preview vừa đóng.
- Nếu người dùng bật reduced motion, lần mở đầu giữ quy tắc hiện có là đi
  thẳng tới nội dung; việc đổi giữa preview và reader cũng không phụ thuộc
  animation để hiểu trạng thái.
- Ảnh nền, alt text, link nhạc, paper scrim và fallback ảnh của lá thư đang đọc
  giữ nguyên thiết kế đã được duyệt trước đó.

## Ranh giới kỹ thuật

- `src/features/future-letters/presentation/future-letters-experience.tsx`:
  owns `activeLetterId`, truyền callback/card state và đánh dấu card active
  trong archive.
- `src/features/future-letters/presentation/future-letter-opening-card.tsx`:
  mở rộng state machine cục bộ với preview đã đọc, phát sự kiện mở/đóng và
  render action thích hợp; không nhận dữ liệu qua server mới.
- `src/app/globals.css`: thêm class namespace `future-letter-*` chỉ cho layout
  archive active, preview và action; không thay đổi grid/tokens ở catalogue hay
  timeline.
- Không thêm dependency, route, API, action, database, migration, schema hay
  thay đổi quyền truy cập.

## Tiêu chí hoàn thành

- Tại một thời điểm chỉ có một nội dung thư đầy đủ trong archive; mở thư mới tự
  thu gọn thư cũ.
- Thư dài đọc bằng page scroll bình thường, không cần scrollbox lồng nhau và
  có action thu gọn ở đầu lẫn cuối.
- Card đã đọc luôn có preview và “Đọc lại” trực tiếp; nghi thức chỉ chạy ở lần
  mở đầu của card trong vòng đời trang.
- Nút/preview không làm mất keyboard focus, alt ảnh, link nhạc, responsive
  wrapping, focus sau nghi thức hay reduced motion.
- Không có thư active thì tất cả card ở dạng phong bì hoặc preview, không có
  khoảng trống hay title/content bị che.

## Ngoài phạm vi

- Không lưu tiến độ đọc sau refresh, không thêm đánh dấu đã đọc lâu dài, search,
  filter, next/previous navigation, pagination, dialog, virtual list hay lazy
  fetch.
- Không thay dữ liệu/thời gian thư, form soạn, quy tắc owner/member, ảnh nền,
  nhạc, Supabase hoặc phần quản trị thư.
- Không chạy test, lint, build, browser QA, không commit và không tạo nhánh theo
  yêu cầu hiện tại của người dùng.

## Xác minh dự kiến

Rà soát tĩnh props/state transitions: phong bì lần đầu mở đúng một nghi thức,
active card chuyển full-width, card bị thay thế/thu gọn thành preview, callbacks
đưa focus về target hợp lệ và CSS không tạo nested scrolling. Không tuyên bố đã
chạy kiểm tra runtime hay browser.
