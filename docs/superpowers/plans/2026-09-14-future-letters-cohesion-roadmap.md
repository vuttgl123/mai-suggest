# Kế hoạch refactor và phát triển màn Thư hẹn `/thu-hen-ngay-mo`

Ngày: 14/09/2026.

**Trạng thái:** Chỉ lập kế hoạch theo yêu cầu người dùng. Chưa sửa code ứng dụng,
chưa thực hiện thay đổi database. Những hành vi mới dưới đây là đề xuất để duyệt,
không phải chỉ thị triển khai.

**Mục tiêu:** Thư hẹn dùng cùng ngôn ngữ Bordeaux Diary với trang chủ và Hành
trình; người dùng hiểu thư nào đang chờ, thư nào được phép mở, viết/sửa thư an
tâm và đọc thư dài trong một không gian ổn định.

Kế hoạch liên quan:

- [Trang chủ `/`](./2026-09-14-home-cohesion-roadmap.md).
- [Hành trình `/hanh-trinh`](./2026-09-14-journey-cohesion-roadmap.md).

Hai tài liệu trên là cơ sở thống nhất thiết kế. Không mặc định mọi giai đoạn
trong đó đã được triển khai hoặc nghiệm thu.

## 1. Cơ sở khảo sát

Đã đọc route, experience, danh sách đang hẹn, composer, opening card, CSS,
time helper, use case, reader/repository, Server Actions và migration trong repo.
Đối chiếu các đặc tả đã có: scheduled-future-letters, sealing-ritual,
opening-admin, image-backdrop, composer-studio và reader-focus.

Khảo sát dựa trên working tree hiện tại. Lượt này không chạy dev server, test,
lint, build hoặc browser QA; không truy cập Supabase thật. Những rủi ro suy ra
từ mã cần được tái hiện và xác minh khi triển khai. Migration trong repo không
chứng minh policy đã deploy giống nội dung file.

Các quyết định cần tiếp tục giữ: một lá thư đang đọc tại một thời điểm; nội
dung đọc bằng cuộn trang; form soạn dùng native dialog; ảnh nằm dưới lớp giấy
để chữ dễ đọc; bài hát là liên kết do người dùng chủ động mở; ngày giờ theo
`Asia/Ho_Chi_Minh`; quyền đọc/sửa/xóa được bảo vệ phía server/database.

## 2. Chẩn đoán hiện trạng

| Điểm cần xử lý | Bằng chứng trong mã | Hướng xử lý trong kế hoạch |
| --- | --- | --- |
| Nhiều khối mở đầu cạnh tranh | `future-letters-experience.tsx` có hero lớn, card “Bàn viết hôm nay”, section đang hẹn, rồi archive với heading lớn | Thu gọn masthead/count; đưa lựa chọn hộp thư và nội dung lên sớm |
| Khổ trang chưa cùng nền tảng chung | Khi rà soát cuối, `tokens.css` đã có scope 75rem cho home/journey; màn thư vẫn dùng `.diary-shell` | Tái sử dụng contract đang được hoàn thiện, bổ sung scope thư khi cần |
| Chữ và bề mặt rời rạc | Heading dùng italic/drop-shadow và tracking riêng; `future-letters.css` có nhiều màu giấy/Bordeaux hardcode | Dùng type scale, surface và motion token chung |
| Chữ “đã mở” đang mang hai nghĩa | Section archive dùng “Những lá thư đã mở” nhưng card ban đầu vẫn ở phase sealed | Đổi tên nhóm thành “Đã đến ngày”; trạng thái đọc chỉ áp dụng trong phiên |
| Khó nhận diện thư trước khi bấm mở | Nhánh sealed trong `future-letter-opening-card.tsx:161` hiển thị tác giả và CTA, chưa có title/ngày như preview | Với thư đã đủ điều kiện, hiển thị title, tác giả, ngày hẹn ngay trên phong bì |
| Chỉnh sửa có nguy cơ mở form trống | `future-letter-composer.tsx:44` khởi tạo bằng `createDraft(null)` dù đã có prop letter và helper nhận letter | Tái hiện create/edit; nạp đúng dữ liệu thư được chọn, không ghi đè draft khi refresh |
| Đóng composer có thể mất nội dung | Parent đổi key theo open/closed và letter ID; composer gọi close trực tiếp, chưa có dirty guard/onCancel | Giữ draft trong phiên và xử lý X/Hủy/Escape nhất quán |
| Chuyển thư giữa nghi thức có thể kẹt pha | Opening card hủy timer khi inactive (`:44`), nhưng renderPhase chỉ đổi opened thành preview (`:85`) | State machine phải có lối thoát cho unsealing/revealing khi bị ngắt |
| Nội dung đang revealing có link có thể nhận focus | Paper dùng aria-hidden trước opened nhưng vẫn render link bài hát | Không để phần đang ẩn còn tab được; dùng inert hoặc trì hoãn phần tương tác |
| Lịch xa dùng timeout không giới hạn | `scheduled-letter-list.tsx:56` truyền thẳng thời gian còn lại vào setTimeout | Thay bằng nhịp kiểm tra có giới hạn, chống refresh lặp |
| Refresh tới hạn chỉ gắn vào thư của mình | Timer nằm trong ScheduledLetterList, component chỉ mount khi có scheduledLetters | Member không có thư đang hẹn vẫn cần cập nhật khi thư người khác tới hạn |
| Hai nhóm đọc dùng hai thời điểm độc lập | Hai use case tự gọi `new Date()`; page thực thi song song | Dùng cùng snapshot thời gian cho hai tập dữ liệu, kiểm tra ranh giới opensAt |
| Copy riêng tư bỏ sót ngoại lệ Owner | Composer nói “chỉ mình bạn”; đặc tả/migration 24/07 cho Owner đọc và gỡ mọi thư | Nói đúng quyền hiện có, không hứa riêng tư vượt quá policy |
| Đang tải toàn bộ content cho cả hai danh sách | Reader dùng FUTURE_LETTER_COLUMNS có content; không có range/count | Mốc B tách summary, chi tiết và phân trang |
| Thiếu loading/error theo route | `/thu-hen-ngay-mo` chỉ có page, kế thừa câu chữ “bộ sưu tập” ở root | Tạo trạng thái đúng ngữ cảnh Thư hẹn |

Các phần đã tốt cần tái sử dụng: access guard; read song song ở page; batch
profile; time helper kiểm tra ngày thật và round-trip GMT+7; label/fieldset trong
composer; xác nhận hủy thư; hành động thu gọn đầu/cuối; reduced-motion mở trực tiếp.

## 3. Hướng đề xuất và thứ tự ưu tiên

| Hướng | Lợi ích | Đánh đổi |
| --- | --- | --- |
| **Giữ nghi thức, tổ chức lại hộp thư và củng cố hành vi — đề xuất** | Giữ cảm xúc riêng, đồng bộ các màn, giảm nhầm trạng thái và lỗi khi thao tác | Cần làm cả presentation, state và read path |
| Chỉ đổi màu/font trên bố cục hiện tại | Ít đổi cấu trúc, có kết quả thị giác sớm | Không giải quyết form sửa, chuyển pha, lịch xa và tìm lại thư |
| Đưa toàn bộ sang một app mail với sidebar/dialog đọc | Dễ chứa nhiều thư | Lệch cảm giác nhật ký, tạo thêm lớp điều hướng và vùng cuộn |

Chia thành **mốc A — giao diện và luồng hiện có ổn định**; **mốc B — hộp thư dễ
tìm lại, có liên kết trực tiếp và tải dữ liệu gọn hơn**. Các vấn đề create/edit,
timer, nghi thức và quyền phải được xác minh trước khi nghiệm thu mốc A, không
hoãn toàn bộ sang phần phát triển mới.

Kế hoạch giữ studio composer và reader inline đã duyệt ngày 24/07. Mốc B đề xuất
mở rộng ngoài phạm vi cũ bằng query state, tìm theo tiêu đề, phân trang và read
detail theo ID. Các miễn test/QA trong đặc tả cũ không áp dụng cho lần triển khai
mới; tuân thủ yêu cầu xác minh hiện hành của AGENTS.md.

## 4. Ngôn ngữ giao diện chung

| Thành phần | Quy tắc đề xuất |
| --- | --- |
| Palette | Semantic tokens giấy ngà, Bordeaux, chữ mực, đồng ấm của home; không hardcode một palette thư riêng |
| Typography | Playfair Display cho heading và chi tiết cảm xúc ngắn; Be Vietnam Pro cho nội dung thư, form và metadata |
| Khổ trang | Cùng container 1200px khi nền tảng được duyệt; lề 16/24/32px; đoạn thư khoảng 60–65 ký tự mỗi dòng |
| Thứ bậc | Một h1 gọn, heading vùng h2, title thư h3; body 16px, UI chính tối thiểu 14px, metadata khoảng 12px |
| Bề mặt | Phong bì Bordeaux là điểm nhấn; danh sách và form dùng giấy, viền mảnh, bóng nhẹ |
| Motion | UI dùng 160ms/320ms theo token; nghi thức mở thư là ngoại lệ có mục đích, khoảng 700–1000ms, không trang trí pulse liên tục |
| Ảnh và nhạc | Giữ ảnh dưới lớp giấy cùng alt; không hover-zoom ảnh nền; nhạc chỉ phát qua link khi người dùng chọn |
| Controls | Dùng Button/SectionHeader hiện có; vùng chạm ít nhất 44px, focus rõ và trạng thái pending/disabled dễ hiểu |

Giảm particle, glow và các chữ italic/drop-shadow lặp lại. Không thêm Three.js
hay một màn mở đầu kiểu sách 3D ở đây. Bóng và nếp gấp chỉ phục vụ nhận diện phong
bì. Cần kiểm tra ảnh sáng/tối/nhiều chi tiết để lớp giấy bảo đảm độ đọc rõ.

## 5. Cấu trúc trang

### Mốc A

1. Header chung với trạng thái Hộp thư rõ ràng.
2. Masthead “Thư hẹn ngày mở”, lời dẫn ngắn và một CTA chính “Hẹn một lá thư”.
3. Metadata gọn: số thư đang hẹn của mình và số thư đã đến ngày; bỏ card thống kê lớn.
4. “Đang hẹn của tôi”: gần ngày nhất lên trước, cùng mẫu card, điểm nhấn nhẹ ở ngày hẹn.
5. “Đã đến ngày”: title/tác giả/ngày trên phong bì; chỉ một nội dung thư mở rộng.
6. Kết trang nhỏ: “Về bộ sưu tập” và “Xem Hành trình”.

Empty state phân biệt chưa từng có thư, chưa có thư tới hạn, và không có thư của
mình đang hẹn. Không khẳng định có phong bì đang chờ nếu dữ liệu không có. Nút
viết thư không lặp cạnh nhau trong cùng viewport mà không có mục đích.

### Mốc B

Masthead nối trực tiếp tới hai lựa chọn **“Đã đến ngày”** và **“Đang hẹn của tôi”**.
Đây là hai chế độ danh sách qua URL, mặc định “Đã đến ngày”. Có thể dùng Link
và aria-current để tránh gán role tab mà thiếu keyboard contract.

- Đã đến ngày: tìm theo tiêu đề, danh sách phong bì/preview, phân trang và một
  vùng thư mở rộng trong page flow; không dialog đọc hoặc nested scroll.
- Đang hẹn của tôi: danh sách của chính actor, ngày gần nhất trước, nút Sửa/Hủy
  rõ ràng và thông tin giờ Việt Nam. Không có thư tương lai của người khác.
- Mỗi danh sách 12 thư/trang; counter là tổng thực, không phải số phần tử trang.
- Thư đang đọc giữ nội dung ổn định khi nền cập nhật; không tự thu gọn vì có thư
  mới tới hạn. Thư mới cập nhật danh sách/count, thông báo nhẹ và không cướp focus.

## 6. Quy tắc trạng thái và tương tác

### Phân biệt thời gian nghiệp vụ và trạng thái đọc

| Khái niệm | Nguồn xác định | Ý nghĩa |
| --- | --- | --- |
| Đang hẹn | Server read + RLS với opensAt còn ở tương lai | Tác giả được sửa/hủy theo quyền; chưa nằm trong nhóm đọc chung |
| Đã đến ngày | Server xác minh thời điểm, RLS vẫn áp dụng | Được phép đọc chung; không có nghĩa người dùng đã bấm mở |
| Đang mở/đang đọc/đã xem trong phiên | State React | Phục vụ nghi thức và thu gọn; không thay opensAt hoặc quyền |

Không thêm cột read_at hay ghi “đã đọc” vào localStorage. Sau reload, link tới
thư không chứng minh người xem từng đọc thư đó. Nhãn “Đọc lại” chỉ dùng khi có
trạng thái đã hoàn tất mở trong phiên hiện tại.

### Nghi thức mở và thu gọn

- Chỉ một thư active. Lần mở đầu: ready → unsealing → revealing → opened;
  thu gọn về preview; đọc lại đi thẳng opened.
- Chuyển A sang B khi A đang unsealing/revealing: hủy timer A và đưa A về trạng
  thái ready ổn định; không đánh dấu A đã đọc. A đang opened thì về preview.
- Hủy timer không được để card ở pha trung gian không còn nút mở. Dùng một
  bảng chuyển trạng thái rõ ràng, kiểm thử mọi điểm ngắt và click lặp.
- Không để link/tab target trong paper đang ẩn còn focus được. Chỉ đặt focus
  vào reader khi dữ liệu/pha mở của đúng thư active đã sẵn sàng.
- Thu gọn trả focus về nút Đọc lại; khi thư bị gỡ, trả focus về danh sách và có
  thông báo trung tính. Focus/DOM target phải tồn tại sau khi đổi nhánh render.
- Reduced motion bỏ timer/chuyển động, hiển thị nội dung ngay; thay preference
  giữa nghi thức cũng kết thúc về một trạng thái ổn định.
- Có CTA thu gọn đầu/cuối; thư 8.000 ký tự đọc bằng cuộn toàn trang.

### Viết và sửa thư

- Giữ dialog native: desktop hai vùng viết/hẹn giờ, mobile một cột; header/footer
  ổn định, body cuộn; kiểm tra bàn phím ảo và màn hình thấp.
- Create bắt đầu bằng draft mới; edit nạp đúng title, content, date/time Việt Nam,
  ảnh, alt và musicUrl của thư được chọn. Chuyển thư không làm lẫn draft.
- Title 1–160, content 1–8.000, alt 1–280 ký tự nếu có ảnh; ngày giờ tương lai;
  URL theo validation hiện có. Hiển thị lỗi sát trường, focus lỗi đầu và giữ input.
- X/Hủy/Escape đi qua cùng luồng đóng. Nếu có thay đổi chưa lưu, cho tiếp tục
  viết hoặc bỏ thay đổi; không mất draft chỉ vì đóng nhầm hoặc nền refresh.
- Draft chỉ nằm trong state React của phiên, theo new/letterId; không tự lưu
  database/localStorage. Chỉ xóa sau thành công hoặc người dùng chọn bỏ.
- Pending chặn submit lặp và đóng nhầm, kể cả native cancel; lỗi request giữ
  nội dung và mở lại controls. Không giả định timeout có nghĩa server chưa lưu;
  refresh/đối chiếu kết quả trước khi hướng dẫn gửi lại một yêu cầu tạo mơ hồ.
- Nếu thư tới hạn trong khi đang sửa: server quyết định khả năng lưu. Khi bị từ
  chối, giữ draft để người dùng sao chép, báo “Lá thư đã đến giờ mở, không thể sửa”.
  Không tự đổi giờ hay tạo một lá mới thay thế.
- Xác nhận hủy có tên thư, nói rõ hủy sẽ xóa lá thư đang hẹn; sau thành công cập
  nhật count/list và trả focus hợp lý. Quyền owner gỡ sau hạn vẫn ở admin.

### Đến giờ mở và thời gian

- Lưu instant theo cơ chế hiện có; nhập/hiển thị luôn `Asia/Ho_Chi_Minh`, kể cả
  khi máy người dùng đang ở múi giờ khác. Ghi rõ “Giờ Việt Nam (GMT+7)” cạnh lịch.
- Lấy một server time snapshot cho các read trong cùng lần render để hai nhóm
  dùng chung mốc phân loại. Database/RLS vẫn là lớp quyết định quyền; countdown
  không được tự cấp quyền hoặc mở nội dung thư chưa được server xác nhận.
- Dùng scheduler có khoảng kiểm tra ngắn có giới hạn, không đặt timeout bằng
  toàn bộ số mili giây tới một ngày xa. Browser giới hạn delay khoảng 24,8 ngày
  và có thể trì hoãn timer ở tab nền, theo [MDN setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#maximum_delay_value).
- Đề xuất kiểm tra lại tối đa mỗi 60 giây khi tab hiện và online; có refresh
  tại deadline gần đã biết, khi tab trở lại và khi mạng phục hồi. Gộp các trigger,
  không tạo request song song/lặp tức thời nếu thời gian thiết bị lệch server.
- Scheduler đặt ở phạm vi experience, hoạt động cả khi người xem không có thư
  đang hẹn của mình. Không gửi metadata thư tương lai của người khác để đặt timer.
- Không hứa UI đổi trạng thái đúng từng giây khi offline/tab nền. Khi cần xác
  nhận lại, hiển thị “Đang kiểm tra giờ mở…” và cho làm mới thủ công.
- Refresh không làm mất draft, đóng composer, reset read state hoặc kéo lên đầu.

### URL của mốc B

| URL / thao tác | Hành vi đề xuất |
| --- | --- |
| `/thu-hen-ngay-mo` | Danh sách đã đến ngày, trang 1 |
| `?box=scheduled` | Thư đang hẹn của chính actor |
| `?box=opened&q=<text>&page=2` | Tìm tiêu đề trong thư đã tới hạn được phép đọc; phân trang cùng điều kiện |
| `?letter=<id>` | Chọn đúng thư đã tới hạn; lần đầu trong phiên vẫn có CTA mở nghi thức |
| Chọn thư từ danh sách | Fetch detail qua server, giữ box/q/page; chỉ chạy nghi thức sau khi xác nhận dữ liệu và người dùng yêu cầu mở |
| `letter` ngoài trang đang liệt kê | Read detail riêng theo ID; không giả rằng thư không tồn tại chỉ vì không nằm ở trang hiện tại |
| ID sai, thư bị gỡ hoặc chưa có quyền | Thông báo chung, không lộ title/content/ngày của thư tương lai người khác |
| Có cả box=scheduled và letter | Chuẩn hóa về box=opened cho reader; edit thư đang hẹn vẫn là action riêng |
| Đổi box/query/page | Reset trang khi đổi box/query; thu gọn reader, giữ draft trong phiên; q chỉ có ý nghĩa ở box=opened |
| Back/Forward/reload | Khôi phục bộ lọc/trang/thư từ URL; không lưu read receipt bền vững |

Search không tìm toàn văn thư, không tìm thư chưa tới hạn của người khác. Metadata
trên phong bì chung chỉ xuất hiện khi đã được phép. Query parameter không bao
giờ chứa draft, content hoặc URL ảnh riêng tư; link không thay đổi quyền truy cập.

## 7. Quyền riêng tư và kiến trúc dữ liệu

Đặc tả/migration 24/07 bổ sung ngoại lệ Owner đọc/gỡ mọi thư. Kế hoạch này giữ
ngoại lệ ấy và sửa lời giải thích cho khớp, không tự thay mô hình quyền:

> Trước giờ hẹn, thư chỉ hiện trong danh sách của bạn. Owner có thể xem và gỡ
> thư để quản lý nội dung. Đến giờ hẹn, các thành viên được phép truy cập có thể đọc thư.

| Vai trò / thời điểm | Đọc | Ghi |
| --- | --- | --- |
| Anonymous | Theo access guard tới login | Không |
| Member chưa được phép | Không đọc dữ liệu thư | Không |
| Active member trước giờ hẹn | Thư của chính mình; không nhận thư tương lai người khác | Tạo; sửa/hủy thư mình trước hạn |
| Active member sau giờ hẹn | Thư đã đến ngày được phép đọc | Không sửa/hủy thư đã tới hạn |
| Owner | Đọc chung trên màn thư; quyền xem tất cả qua admin | Gỡ mọi thư ở admin; không sửa thư đã tới hạn hoặc sửa thư người khác |

Hàm deleteOwnScheduled hiện chỉ lọc ID/author, trong khi RLS cho Owner delete
sau hạn. Khi thực hiện cần kiểm tra tình huống Owner là tác giả gọi action này
sau hạn: public action phải bảo đảm đúng hợp đồng “hủy trước hạn”; quyền gỡ sau
hạn đi qua use case quản trị. Không coi ẩn nút hoặc countdown là enforcement.

Mốc B thêm read model typed trước khi nối UI:

| Phần | Hợp đồng đề xuất |
| --- | --- |
| `OpenedFutureLetterSummary` | id, title, opensAt, tác giả; không có content/media URL |
| `OwnScheduledFutureLetterSummary` | id, title, opensAt, updatedAt; chỉ của actor |
| `FutureLetterPage<T>` | items, page, pageSize=12, total, pageCount |
| `FutureMailboxSnapshot` | Hai count theo đúng quyền, thời điểm server và trang đang xem |
| `GetOpenedFutureLetter` | Detail theo ID, chỉ thư đã tới hạn; RLS và public time filter cùng áp dụng, kể cả Owner |
| `GetOwnScheduledFutureLetter` | Detail để sửa theo ID + author + còn trước hạn; gọi qua ranh giới server khi chọn Sửa |

Public page vẫn là Server Component. Tách phần khung/heading/danh sách tĩnh khỏi
client experience khi hợp lý; client islands xử lý composer, trạng thái đọc và
refresh clock. Không chuyển Supabase query vào Client Component.

Reader dùng projection, range/count theo nhóm; batch profile cho trang đã tới
hạn. Thứ tự opened là opensAt giảm dần, scheduled tăng dần, ID làm tie-breaker.
Trang ngoài giới hạn kẹp về cuối; count không lấy từ items.length. Detail ngoài
trang vẫn kiểm tra riêng theo ID. Không serialize mọi nội dung thư vào browser
chỉ để dựng phong bì hoặc form chưa mở.

Không thêm migration, RLS, trigger, service role, Cron, Realtime hay thông báo.
Nếu cần thay đổi database để đáp ứng yêu cầu phát sinh, tách thành đề xuất riêng.
Reader/action quản trị hiện có phải tiếp tục hoạt động sau refactor public read path.

## 8. Lộ trình triển khai dự kiến

### Giai đoạn 0 — Baseline và thiết kế

- [ ] Đọc lại working tree và contract chung của home/Hành trình trước khi làm;
  tôn trọng phần đã thay đổi, không tự tạo branch/commit hoặc reset.
- [ ] Chụp baseline ở 320, 390, 768, 1024, 1440px: đang hẹn, thư tới hạn, mở/thu
  gọn, thư dài, composer create/edit và bàn phím ảo.
- [ ] Duyệt bản bố cục hai mốc và bảng trạng thái; chốt copy quyền riêng tư.
- [ ] Khi được triển khai, dùng systematic debugging/TDD để tái hiện các điểm
  nghi ngờ: edit trống, đóng mất draft, chuyển thư giữa nghi thức, lịch xa, deadline.
  Chạy baseline test/lint/build, ghi lỗi có trước; không lấy báo cáo cũ làm bằng chứng.

### Giai đoạn 1 — Giao diện và hành vi hiện có, mốc A

Files chính: `src/features/future-letters/presentation/future-letters-experience.tsx`,
`scheduled-letter-list.tsx`, `future-letter-composer.tsx`, `future-letter-opening-card.tsx`,
`src/app/styles/components/future-letters.css`, `src/app/styles/motion.css`,
`src/app/styles/tokens.css`; thêm `src/app/thu-hen-ngay-mo/loading.tsx` và `error.tsx`.

- [ ] Thu gọn masthead/count, thống nhất card/heading/control và trạng thái thư.
- [ ] Composer nạp đúng dữ liệu edit, dirty guard/native cancel/focus, lỗi theo trường.
- [ ] Chốt state machine mở thư; sửa interruption/reduced motion/focus và link trong vùng ẩn.
- [ ] Giảm hiệu ứng, bảo đảm ảnh nền/text dài, thêm route loading/error/empty đúng ngữ cảnh.
- [ ] Giữ contract media dùng chung; chỉ sửa API ảnh khi cần và kiểm tra catalogue.

Files hỗ trợ thời gian/quyền: thêm `future-letter-refresh.tsx` trong presentation,
điều chỉnh `src/modules/future-letters/application/list-opened-future-letters.ts`,
`list-own-scheduled-future-letters.ts`, `manage-future-letters.ts`,
`infrastructure/supabase-future-letter-repository.ts`,
`src/app/thu-hen-ngay-mo/page.tsx`; dùng time helper hiện có.

- [ ] Snapshot thời gian chung, scheduler có giới hạn, visible/online refresh và chống vòng lặp.
- [ ] Kiểm tra deadline ở edit/delete, đặc biệt Owner là tác giả; giữ admin delete riêng.
- [ ] Giữ draft/reader qua refresh; nghiệm thu core flow trước khi thêm tìm kiếm/phân trang.

### Giai đoạn 2 — Read path cho hộp thư mới

Files dưới `src/modules/future-letters/`: `domain/future-letter-models.ts`,
`application/future-letter-reader.ts`, `infrastructure/supabase-future-letter-reader.ts`,
`infrastructure/future-letter-mappers.ts`; thêm use case
`application/list-future-mailbox.ts`, `application/get-opened-future-letter.ts`,
`application/get-own-scheduled-future-letter.ts`. Đăng ký tại
`src/lib/backend/create-server-backend.ts`.

- [ ] TDD cho active actor, ownership, opensAt trước/đúng/sau hạn, input ID/page,
  count/range và mapping nullable; không dùng any để nối interface.
- [ ] Thực hiện summary/page/detail; không tải content toàn danh sách; batch author.
- [ ] Xác minh read trước hạn của người khác không xuất hiện trong HTML, payload,
  search/count hoặc detail response; kiểm tra cả public owner và admin owner.
- [ ] Đo query/payload trên dữ liệu thử nghiệm; đối chiếu RLS thật theo từng vai trò.

### Giai đoạn 3 — Tìm lại và điều hướng thư, mốc B

Files chính: `src/app/thu-hen-ngay-mo/page.tsx`, experience/list/reader/composer đã
nêu; thêm `src/features/future-letters/lib/future-letter-navigation.ts`,
`presentation/future-mailbox-navigation.tsx`, `future-letter-pagination.tsx`,
`future-letter-draft-provider.tsx` và server detail boundary phù hợp trong
`src/modules/future-letters/presentation/future-letter-actions.ts` cho edit.

- [ ] Nối box/q/page/letter, search tiêu đề, counter đúng tổng và pagination 12.
- [ ] Detail theo ID khi chọn thư/Sửa; trạng thái tải không phát nghi thức trước khi có dữ liệu.
- [ ] Giữ một reader active, session read state và draft khi đổi box/page hoặc refresh.
- [ ] Kiểm tra Back/Forward/reload, link trực tiếp, ID bị gỡ và link không có quyền.
- [ ] Chỉ bỏ read method/component cũ khi hết consumer, gồm admin và test backend.

### Giai đoạn 4 — Kiểm chứng và bàn giao

Test dự kiến tạo trong module/component tương ứng:

- `src/modules/future-letters/domain/future-letter-time.test.ts`.
- `src/modules/future-letters/application/future-letter-use-cases.test.ts`.
- `src/modules/future-letters/infrastructure/supabase-future-letter-reader.test.ts`.
- `src/features/future-letters/presentation/future-letter-composer.test.tsx`.
- `src/features/future-letters/presentation/future-letter-opening-card.test.tsx`.
- `src/features/future-letters/presentation/future-letter-refresh.test.tsx`.
- `tests/e2e/future-letters-cohesion.spec.ts`.

- [ ] Test meaningful cho state/time/permission/URL, dùng fake timers cho lifecycle;
  pure visual dùng browser QA, không unit test class CSS cho có.
- [ ] Test dài hơn 30 ngày, tab nền, offline/online, đồng hồ thiết bị lệch; hai
  member ở hai phiên khác nhau trước/đúng/sau deadline; mutation bị từ chối giữ draft.
- [ ] Chạy test liên quan, `rtk npm run lint`, `rtk next build` và e2e phù hợp.
- [ ] QA 320/390/768/1024/1440px, keyboard/Escape/focus restore, ảnh và avatar
  lỗi, title 160/content 8.000 ký tự, reduced motion, theme nền sáng/tối tương ứng.
- [ ] Kiểm tra RLS từng vai trò; mutation chỉ trên dữ liệu/môi trường thử nghiệm
  được phép. Smoke test home, Hành trình và admin thư vì có shared dependencies.
- [ ] Rà diff, ảnh trước/sau, kết quả mới và các giới hạn còn lại trước bàn giao.

## 9. Tiêu chí nghiệm thu

1. Palette, type scale, container, spacing và controls liền mạch với home/Hành trình.
2. Nhóm “Đã đến ngày” không bị gọi nhầm là đã đọc; không có read receipt giả.
3. Sửa thư nạp đủ trường, không mất draft vì refresh/đóng nhầm; pending/lỗi rõ ràng.
4. Không kẹt phase khi đổi thư nhanh; chỉ một reader; thu gọn/đọc lại đúng focus.
5. Nội dung tới hạn theo server/database, không theo thủ thuật clock/CSS client.
6. Deadline/lịch xa/tab nền không gây vòng refresh hoặc tự mất bản đang viết.
7. Link trực tiếp/filter/pagination/history đúng trạng thái; không lộ thư tương lai người khác.
8. Count chính xác, payload danh sách không chứa toàn bộ content; admin vẫn đúng quyền.
9. Thư dài và composer dùng được ở cả năm viewport, với keyboard và reduced motion.
10. Có kết quả mới cho test/lint/build/browser và kiểm tra quyền; không tuyên bố
    đã kiểm chứng điều kiện chưa có môi trường để chạy.

Tiêu chí form, focus, nội dung dài, motion và URL được đối chiếu với
[Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

## 10. Giới hạn và bước tiếp theo

Phạm vi là màn thư chung, composer create/edit, nghi thức đọc và read path hỗ
trợ. Admin chỉ kiểm tra tương thích/quyền; không redesign admin trong đợt này.
Không thêm email/push, lịch nhắc, upload, ghi âm, phản ứng, bình luận thư, cộng
tác realtime, nháp lưu bền vững hoặc thay Google OAuth.

Sau khi thiết kế được duyệt, dùng `superpowers:writing-plans` để tạo implementation
plan theo từng mốc từ working tree mới nhất. Thực hiện tuần tự, không sub-agent,
không tự tạo commit/branch. Tài liệu này hoàn thành yêu cầu viết kế hoạch;
việc triển khai code chỉ bắt đầu khi người dùng yêu cầu.
