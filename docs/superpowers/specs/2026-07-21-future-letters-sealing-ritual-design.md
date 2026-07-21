# Thư ngày hẹn mở theo nghi thức niêm phong

## Mục tiêu

Refactor `/thu-hen-ngay-mo` thành một nghi thức nhỏ gồm viết, niêm phong, chờ
đến ngày và mở lại. Trang kế thừa Bordeaux Diary: trầm, riêng tư và giàu nhịp
đọc, không biến các lá thư thành task list hoặc dashboard đếm ngược.

## Phạm vi

1. Không thay đổi route, server page, hai query hiện có, Supabase, schema,
   migration, RLS, auth, Server Action, validation hay định dạng thời gian Việt
   Nam.
2. Chỉ thay đổi presentation trong `FutureLettersExperience`,
   `ScheduledLetterList`, `FutureLetterOpeningCard` và bề mặt visual của
   `FutureLetterComposer` khi cần để cùng một ngôn ngữ thiết kế.
3. Giữ nguyên composer state (`isComposerOpen`, `editingLetter`), timer refresh
   của thư hẹn, mutation create/update/delete, flow dialog và opening phase
   (`sealed`, `opening`, `opened`).
4. Không thêm dependency, ảnh/font, query client hay animation JavaScript mới.

## Trải nghiệm và bố cục

### Bàn viết thư

Hero là lời mở đầu của nghi thức, có diary rule và CTA **“Hẹn một lá thư”**.
Hero hiển thị hai con số có dữ liệu thật: số thư đang hẹn của người đang xem và
số thư đã mở mà active member thấy được. Hai statistic chỉ là ngữ cảnh, không
tạo progress/game mechanics hay tải dữ liệu mới.

### Bàn niêm phong

Khi có `scheduledLetters`, section chuyển thành **“Những lá thư đang hẹn”**.
Entry đầu tiên theo thứ tự reader hiện có là lá thư gần/được ưu tiên hiển thị
và nhận một card featured: một dấu niêm phong, title, giờ mở, countdown và các
thao tác sửa/hủy vốn có. Không sort, lọc hoặc suy diễn “gần nhất” mới ở client;
thứ tự là của use case server.

Các entry còn lại là những thư đã niêm phong nhỏ gọn hơn, tiếp tục có ngày mở,
countdown và thao tác hiện có. Mọi mutation pending/feedback/confirmation vẫn
do `ScheduledLetterList` quản lý. Một lá thư không bị đẩy đi nơi khác hoặc mất
khả năng chỉnh sửa chỉ vì đổi presentation.

### Khoảnh khắc đã đến

Section thư đã mở đổi heading thành **“Khoảnh khắc đã đến”**, với rail nhỏ dẫn
vào archive. Khi không có thư đã mở, empty state hiện tại vẫn là lời mời viết
thư đầu tiên. Khi có, mỗi `FutureLetterOpeningCard` vẫn là phong bì có thể mở;
không đổi timer 720ms, auto focus sau mở hoặc reduced-motion shortcut.

Card đã mở được tinh chỉnh hierarchy: sender/date giống letterhead, title/body
như tờ giấy bên trong, image/music chỉ hiện khi dữ liệu đầy đủ. Link nhạc giữ
`target="_blank"`, `rel="noreferrer"`, target tối thiểu 44px và focus visible.

### Viết và niêm phong

`FutureLetterComposer` giữ native dialog, validation và các field hiện có. Chỉ
điều chỉnh heading/divider/fieldset surface để copy viết thư, thời điểm mở và
điều đi cùng lá thư được đọc như ba nhịp của một nghi thức. Không thêm field,
preview, autosave hoặc thay đổi action/callback.

## Kiến trúc component và luồng dữ liệu

Server page tiếp tục tải `openedLetters` và `scheduledLetters` song song và
truyền vào client boundary duy nhất là `FutureLettersExperience`.

```
FutureLettersExperience (client orchestration)
  ├─ future-letter hero (counts + open composer callback)
  ├─ ScheduledLetterList (client: timer + edit/delete state)
  │    ├─ featured scheduled entry (letters[0])
  │    └─ sealed entries (letters.slice(1))
  ├─ FutureLetterOpeningCard (client: sealed/opening/opened)
  └─ FutureLetterComposer (client: native dialog + mutations)
```

Không có component mới nhận Supabase client, secret hoặc raw server action. Props
giữ nguyên: `ScheduledLetterList({ letters, onEdit })`,
`FutureLetterOpeningCard({ letter })`, `FutureLetterComposer({ isOpen, letter,
onClose })`. `FutureLettersExperience` chỉ truyền count đã có từ arrays, không
phát sinh state đồng bộ hay network waterfall.

## Motion, accessibility và hiệu năng

- Giữ PageTransition và animation phong bì hiện có; không thêm route transition
  hay animation của list. `prefers-reduced-motion` tiếp tục mở thư thẳng vào
  content.
- Hero stat/card decorative labels dùng `aria-hidden` khi đã có text tương
  đương. Heading tuần tự: `h1` trang, `h2` cho scheduled/opened, `h3` cho từng
  thư; không thay heading dialog hiện có.
- Countdown timer chỉ tồn tại trong `ScheduledLetterList` như hiện tại. Không
  tạo interval/timer mới ở hero hoặc archive.
- Giữ `CatalogueItemImage` lazy/error fallback, body `whitespace-pre-line`,
  `break-words` và không truncate title/nội dung thư đã mở.

## Trạng thái lỗi và dữ liệu biên

- Lỗi page, redirect và load data giữ nguyên tại server page.
- Không có scheduled letter: section “Bàn niêm phong” không render, CTA hero và
  empty opened archive vẫn cho phép tạo thư.
- Không có opened letter: empty state hiện có giữ CTA mở composer; không hiển
  thị archive trống giả.
- Thư có/không có image, alt text hoặc music URL vẫn render các phần hiện có
  đúng điều kiện; thiếu một phần không ảnh hưởng title/content/opening flow.
- Lỗi create/update/delete, dialog close, pending và feedback tiếp tục do client
  component hiện có xử lý; refactor không nuốt thông báo hoặc reset draft mới.

## Kiểm chứng sau triển khai

Theo chỉ dẫn hiện tại của người dùng, không chạy automated test, lint, build
hoặc browser QA cho đợt refactor này. Khi người dùng yêu cầu kiểm chứng trở lại,
phạm vi cần gồm no scheduled/no opened, one scheduled, many scheduled, opened
letter, image/music, edit/delete/confirmation, open envelope, keyboard dialog
và `prefers-reduced-motion` tại 320, 390, 768, 1024, 1440px.

## Không thuộc phạm vi

- Reminder/notification, sharing, author recipient selection, scheduled sending
  khác, file upload, preset/template, autosave, new access rule, realtime hoặc
  public archive.
- Đổi server query, time-zone semantic, Supabase schema/RLS, Google OAuth,
  migration, mock data, dependency hoặc admin workflow.
