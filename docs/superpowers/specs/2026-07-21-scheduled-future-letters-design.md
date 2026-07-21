# Hộp thư hẹn ngày mở

## Mục tiêu

Thêm một không gian chung tại `/thu-hen-ngay-mo` để active member viết thư,
thơ hoặc lời hứa cho tương lai và đặt chính xác thời điểm mở theo múi giờ Việt
Nam (`Asia/Ho_Chi_Minh`). Trước thời điểm đó, thư được niêm phong ở database;
từ thời điểm đó, mọi active member có thể đọc và chủ động trải qua nghi thức mở
phong thư.

Tính năng cần tạo cảm giác có một cuộc hẹn đáng mong chờ, không phải một form
hẹn giờ hay một feed nội dung. Nó không thay thế Dòng thời gian: timeline kể
những điều đã xảy ra, còn hộp thư giữ những điều muốn gửi cho ngày mai.

## Phạm vi và quyền

| Hành động | Active member là tác giả, trước giờ mở | Active member khác, trước giờ mở | Mọi active member, từ giờ mở | Owner |
| --- | --- | --- | --- | --- |
| Thấy nội dung/thông tin thư | Có | Không thấy row | Có | Như active member, không có quyền xem sớm |
| Tạo thư | Có | Có | Có | Có |
| Sửa hoặc xóa thư | Chỉ thư của mình | Không | Không | Không có quyền đặc biệt |
| Mở bằng nghi thức UI | Chưa có vì thư còn niêm phong | Không có | Có | Như active member |

“Không thấy row” là yêu cầu bảo mật: người khác không nhận được tiêu đề, nội
dung, ngày mở hoặc ngay cả sự tồn tại của thư qua Data API. Chỉ tác giả thấy khu
vực “Những lá thư bạn đã hẹn” của mình trước giờ mở. Không có trang quản trị hay
moderation cho thư ở slice đầu tiên; thư không thể sửa hoặc xóa sau khi đã mở,
để giữ nguyên tính kỷ niệm.

## Trải nghiệm

### Trang `/thu-hen-ngay-mo`

Trang tiếp tục ngôn ngữ Bordeaux Diary nhưng tối hơn và giàu cảm xúc hơn
timeline:

1. **Mở đầu** — eyebrow nhỏ “Một cuộc hẹn với tương lai”, title ngắn và copy
   chỉ dẫn; CTA “Hẹn một lá thư” mở composer.
2. **Thư chờ riêng của tôi** — chỉ xuất hiện khi viewer là tác giả của ít nhất
   một thư chưa mở. Mỗi card có đồng hồ đếm ngược và ngày/giờ Việt Nam; tiêu đề
   và controls Sửa/Xóa chỉ ở khu vực riêng này.
3. **Những lá thư đã đến ngày** — thư đã mở của mọi active member, mới nhất
   trước. Một card chưa được mở trong phiên hiện tại có phong bì Bordeaux và CTA
   “Mở thư”; sau nghi thức, card chuyển thành trang thư đọc được.
4. **Empty state** — không bịa dữ liệu. Nếu chưa có thư đã mở, lời nhắn chỉ mời
   người dùng đặt cuộc hẹn đầu tiên.

Danh sách không hiển thị phong bì, đếm ngược hay metadata của thư chưa mở do
người khác viết. Điều này bảo vệ bất ngờ và phù hợp với policy database.

### Composer và quản lý trước giờ mở

Composer là client component nhỏ trong dialog/drawer có form:

- tiêu đề, tối đa 160 ký tự;
- nội dung thư/thơ, 1–8.000 ký tự, giữ xuống dòng;
- ngày và giờ mở theo `Asia/Ho_Chi_Minh`, bắt buộc nằm trong tương lai;
- URL ảnh tùy chọn và alt text bắt buộc khi có ảnh;
- URL bài hát tùy chọn, hiển thị sau này là liên kết rõ ràng, không tự phát nhạc
  hoặc nhúng player bên thứ ba.

Tác giả có thể sửa thời điểm và nội dung, hoặc hủy thư, miễn là thư chưa đến
giờ mở. Sau khi mở, cả UI lẫn RLS đều không cho cập nhật/xóa; form giải thích
đây là lựa chọn để giữ nguyên lá thư tại khoảnh khắc đã hẹn.

### Nghi thức mở thư

Phương án được chọn là **nghi thức mở phong thư**:

1. Viewer chọn “Mở thư” trên một thư đã đến giờ.
2. Phong bì đỏ Bordeaux nâng rất nhẹ; nắp phong bì xoay mở, một quầng sáng đồng
   mờ và các chấm sáng/hạt giấy nhỏ xuất hiện trong khoảng ngắn.
3. Tờ thư nền ngà trượt lên; tiêu đề, tên người gửi, thời điểm đã hẹn và nội
   dung hiện lần lượt bằng opacity/translate rất nhỏ.
4. Ảnh hoặc liên kết bài hát, nếu có, hiện sau nội dung; không autoplay âm thanh.

Đây là hiệu ứng UI, không phải trạng thái quyền hay sự kiện nghiệp vụ. Trong
phiên đang xem, card giữ trạng thái đã mở để không bắt người dùng lặp nghi thức.
Reload vẫn cho phép thực hiện nghi thức lại một cách chủ động, không lưu lịch sử
đọc hay theo dõi thành viên.

`prefers-reduced-motion` bỏ xoay phong bì, hạt và stagger: sau khi bấm, nội dung
nhận focus và hiện ngay. Hiệu ứng chỉ dùng transform/opacity, có thời lượng ngắn
và không khóa thao tác bàn phím.

## Dữ liệu và migration

Thêm table `public.future_letters`:

| Cột | Kiểu | Quy tắc |
| --- | --- | --- |
| `id` | `uuid` | Primary key, `gen_random_uuid()` |
| `author_id` | `uuid` | FK `profiles.id`, `on delete cascade`; không đổi sau khi tạo |
| `title` | `text` | Bắt buộc, 1–160 ký tự |
| `content` | `text` | Bắt buộc, 1–8.000 ký tự |
| `opens_at` | `timestamptz` | Bắt buộc; UI chuyển giờ Việt Nam sang timestamp có timezone |
| `image_url` | `text` | Tùy chọn |
| `image_alt_text` | `text` | Tùy chọn; bắt buộc ở application layer khi có ảnh |
| `music_url` | `text` | Tùy chọn; URL hợp lệ ở application layer |
| `created_at`, `updated_at` | `timestamptz` | `now()`; trigger cập nhật `updated_at` |

Migration có `CHECK (opens_at > created_at)` để không tạo thư đã đến giờ. Index
`future_letters_opened_at_idx` trên `opens_at DESC` phục vụ thư công khai theo
thời điểm mở, và `future_letters_author_schedule_idx` trên `(author_id,
opens_at)` phục vụ thư đang hẹn của tác giả. Public reader luôn truyền điều kiện
`opens_at <= serverNow` song song với RLS để planner dùng được index.

### RLS

Migration grant `select, insert, update, delete` cho `authenticated`, revoke
toàn bộ từ `anon`, bật RLS và dùng helper sẵn có
`(select private.is_active_member())`.

- **Select:** active member chỉ thấy row nếu `opens_at <= now()` hoặc
  `author_id = (select auth.uid())`.
- **Insert:** active member chỉ insert với `author_id = auth.uid()` và
  `opens_at > now()`.
- **Update:** chỉ tác giả, chỉ khi row hiện tại chưa mở; `WITH CHECK` giữ lại
  `author_id = auth.uid()` và yêu cầu thời điểm mới vẫn ở tương lai.
- **Delete:** chỉ tác giả và chỉ khi row chưa mở.

Policy không dùng Google metadata/JWT user metadata để phân quyền. `now()` là
thời gian database có thẩm quyền; bộ đếm ở browser chỉ để hiển thị, không cấp
quyền. Chủ động thêm điều kiện `opens_at <= serverNow` vào query cũng giúp query
tận dụng index thay vì chỉ dựa vào predicate RLS theo row.

## DDD và luồng dữ liệu

Thêm bounded context `src/modules/future-letters`, theo cấu trúc `timeline`:

- `domain`: `FutureLetter`, `ScheduledFutureLetter`, input, giới hạn validation
  và một formatter cố định `Asia/Ho_Chi_Minh` cho presentation.
- `application`: public reader, own-scheduled reader, repository và use cases
  tạo/cập nhật/xóa thư đã hẹn. Use case xác nhận active actor; policy vẫn là
  hàng rào cuối cùng.
- `infrastructure`: Supabase mappers/reader/repository typed bằng
  `Database["public"]["Tables"]["future_letters"]`; không trả secret hoặc
  dữ liệu row trước giờ mở cho viewer không phải tác giả.
- `presentation`: Server Actions dùng `runServerAction` và revalidate route.
  Server Component tải thư đã mở cùng thư riêng của actor theo đúng criteria;
  client component chỉ xử lý form, countdown và nghi thức UI.

`create-server-backend.ts` compose context mới. App header thêm link “Thư hẹn
ngày mở” cho active member. Không tạo backend service riêng, realtime subscription
hay client Supabase query.

## Xử lý lỗi, bảo mật và accessibility

- Server Action trả validation error không chứa nội dung thư trong log/message.
- Một truy cập theo ID không được dùng để vượt RLS; reader trả `NOT_FOUND` cho
  thư chưa mở mà viewer không phải tác giả, không rò metadata.
- Dialog dùng label thật, `aria-live` cho save/error, pending state và return
  focus về CTA. Nút “Mở thư” là `<button>` có focus rõ, không dùng click-only.
- Countdown không phải live region cập nhật từng giây; hiển thị theo phút khi còn
  xa và thông báo một lần khi đến giờ để không làm screen reader nhiễu.
- Ảnh có alt text, link bài hát mở với cảnh báo trực quan/accessible rằng sẽ đến
  trang ngoài.

## Không thuộc phạm vi

- Người nhận riêng, danh sách người nhận, gửi email/push, scheduled job hoặc
  notification.
- Comment/reply, reaction, analytics “ai đã mở”, receipt hoặc lưu trạng thái đã
  xem ở server.
- Upload file/voice note/Supabase Storage, embed Spotify/YouTube, autoplay hoặc
  nền nhạc.
- Owner xem sớm, chỉnh, xóa hoặc xuất thư của người khác.
- Mock thư hoặc thay đổi timeline/catalogue/Google OAuth.

## Kiểm chứng sau khi triển khai

Không thêm unit test theo yêu cầu hiện tại. Sau khi user tự áp dụng migration,
kiểm tra bằng hai active member và một tài khoản không active:

1. Tác giả tạo/sửa/xóa thư còn ở tương lai; member khác không query hoặc đoán
   được row/metadata trước giờ mở.
2. Đúng hoặc sau `opens_at`, hai active member cùng đọc được thư; thư không còn
   sửa/xóa được, kể cả tác giả/Owner.
3. Inactive/anonymous không đọc hoặc tạo được thư.
4. `npx.cmd tsc --noEmit`, `npm.cmd run build`, và browser QA ở 320, 390, 768,
   1024, 1440 px; kiểm tra focus dialog, keyboard mở thư, lỗi form, ảnh, link
   ngoài và `prefers-reduced-motion`.
