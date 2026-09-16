# Kế hoạch refactor và phát triển màn Hành trình `/hanh-trinh`

Ngày: 14/09/2026.

**Trạng thái:** Chỉ lập kế hoạch theo yêu cầu người dùng. Chưa sửa code ứng dụng,
chưa triển khai thiết kế và chưa thực hiện thay đổi database. Những hành vi mới
trong tài liệu là đề xuất để duyệt, không được coi là đã được chấp thuận triển khai.

**Mục tiêu:** Hành trình nối tiếp ngôn ngữ Bordeaux Diary của trang chủ, giúp
người dùng tìm một mốc, đọc câu chuyện và để lại hồi đáp thuận tiện trên cả mobile
lẫn desktop. Giữ cảm giác một cuốn nhật ký chung và giá trị ngang nhau của các chương.

**Kế hoạch liên quan:** [Trang chủ `/`](./2026-09-14-home-cohesion-roadmap.md).
Nền tảng trong kế hoạch trang chủ là đầu vào thiết kế; không mặc định toàn bộ
kế hoạch đó đã được triển khai hoặc nghiệm thu.

## 1. Cơ sở và phạm vi khảo sát

Đã đọc route, component Hành trình, film controls, hồi đáp, CSS, read model,
reader, use case, Server Actions và migration timeline trong repo. Đối chiếu với:

- `docs/product-direction.md`.
- `docs/superpowers/specs/2026-07-23-timeline-filmstrip-design.md`.
- `docs/superpowers/specs/2026-07-23-timeline-film-controls-design.md`.
- `docs/superpowers/specs/2026-07-21-relationship-timeline-design.md`.

Các nhận xét dưới đây dựa trên working tree hiện tại, gồm thay đổi chưa commit.
Lượt lập kế hoạch này không chạy dev server, test, lint, build hoặc browser QA,
không truy cập database thật. Migration trong repo không chứng minh trạng thái RLS
đã deploy; phải kiểm tra riêng khi triển khai.

## 2. Chẩn đoán hiện trạng

| Điểm cần xử lý | Bằng chứng | Hướng giải quyết |
| --- | --- | --- |
| Có hai lớp giới thiệu trước nội dung | `relationship-timeline.tsx:45` có card đếm chương; `:63` thêm tiêu đề lớn cho film strip sau hero | Thu gọn masthead; chuyển số chương thành metadata nhỏ |
| Hành trình chưa theo cùng khổ với home | `tokens.css:118` chỉ scope container 75rem cho `.home-layout`; Hành trình vẫn dùng `.diary-shell` | Dùng cùng contract container đã chốt, với scope riêng cho Hành trình |
| Mỗi khung phim có thể rất cao | `timeline-chapter-card.tsx:51` render toàn bộ story, `:65` render toàn bộ panel; validation cho phép story 8.000 ký tự và mỗi hồi đáp 2.000 ký tự | Mốc A chỉnh nhịp đọc; mốc B tách chọn chương khỏi vùng đọc đầy đủ |
| Các card bị kéo theo chương dài nhất | `timeline.css:19` tạo một hàng grid; `:72` cho card `flex: 1` | Không dùng chiều cao của toàn bộ câu chuyện/hồi đáp để định hình rail điều hướng |
| Snap nằm khác phần tử thực sự cuộn | `timeline.css:6` đặt overflow ở viewport nhưng `:19` đặt scroll-snap-type ở filmstrip | Chuyển snap contract về viewport; xác minh lại bằng browser |
| Mốc thời gian có nhiều trang trí chuyển động | `timeline.css:95`, `:109` dùng pulse lặp; dot có gradient/glow và hover phóng lớn | Dùng đường mảnh, chấm Bordeaux tĩnh; chuyển động chỉ phục vụ thao tác |
| Typography và màu chưa thống nhất | `timeline-chapter-card.tsx:26`, `:33` dùng số/ngày gradient; `timeline-response-panel.tsx:149` dùng `#fdfaf5`, `:174` dùng serif italic cho toàn bộ hồi đáp | Dùng semantic tokens và type scale chung; body/hồi đáp bằng Be Vietnam Pro |
| Form có điểm thiếu accessibility | `timeline-response-panel.tsx:167` có textarea sửa không có label; style chung dùng outline-none và chỉ đổi viền khi focus | Label rõ cho form tạo/sửa, focus-visible, lỗi gắn đúng ô nhập |
| Controls ở giữa stage có thể xa vùng đang đọc | `media-rail.css:7` overlay controls căn giữa toàn bộ stage; ẩn dưới 1024px | Mốc A kiểm tra card dài; mốc B đặt điều hướng vùng chọn chương, không che nội dung |
| Read path lấy tất cả nội dung và hồi đáp cùng lúc | `supabase-timeline-reader.ts:28` đọc entry đầy đủ rồi lấy response của mọi entry | Mốc B tách metadata điều hướng và chi tiết của mốc được chọn |
| Màn chưa có loading/error riêng | `src/app/hanh-trinh` chỉ có page; root loading/error dùng câu chữ “bộ sưu tập” | Thêm loading/error riêng đúng ngữ cảnh Hành trình |
| Còn component nổi bật không được dùng | `timeline-featured-chapter.tsx` còn khai báo, không có consumer trong tìm kiếm hiện tại | Chỉ bỏ sau khi kiểm tra lại consumer; không đưa chương nổi bật trở lại |

Điểm cần giữ: Server Component và access guard; native horizontal scroll;
MediaRailControls đã dùng chung; danh sách có ngữ nghĩa `ol/li`; ngày dùng Intl;
form đã có pending, thông báo và xác nhận xóa; quyền hồi đáp đi qua Server Action.
Không coi việc đã có những cơ chế này là bằng chứng chúng đã được QA đầy đủ.

## 3. Hướng thiết kế đề xuất

| Phương án | Lợi ích | Đánh đổi |
| --- | --- | --- |
| **Filmstrip chọn chương + một vùng đọc — đề xuất cho mốc B** | Giữ nhận diện cuộn phim, dễ chọn mốc, đọc dài và hồi đáp trên vùng thoáng | Cần trạng thái chọn chương theo URL và read path phù hợp |
| Chỉnh giao diện, giữ toàn bộ nội dung trong từng frame | Ít đổi hành vi; phù hợp làm mốc A | Chương dài và nhiều hồi đáp vẫn làm rail cao, khó bao quát |
| Đổi toàn bộ thành timeline dọc | Cuộn đọc quen thuộc trên mobile | Thay đổi bản sắc filmstrip đã thống nhất trước đây |

Lộ trình gồm **A — thống nhất giao diện hiện tại** và **B — đọc theo chương**.
Mốc A có thể nghiệm thu độc lập; mốc B chỉ triển khai sau khi thiết kế tương tác được duyệt.

Mốc B đề xuất thay cách đặt toàn bộ story/hồi đáp trong từng frame của đặc tả
filmstrip 23/07. Giữ nguyên nguyên tắc mọi chương ngang hàng; chương đang chọn
chỉ là trạng thái đọc, không phải chương được ưu tiên hoặc nổi bật. Khôi phục đầy
đủ yêu cầu kiểm thử hiện hành từ AGENTS.md, không kế thừa miễn QA trong tài liệu cũ.

## 4. Ngôn ngữ chung với trang chủ

| Thành phần | Quy tắc |
| --- | --- |
| Màu | Dùng token giấy ngà, Bordeaux, chữ mực và đồng ấm đã chốt với home; không hardcode palette riêng cho timeline |
| Chất liệu | Giấy, viền mảnh, shadow nhẹ; giảm băng dính giả, gradient chữ và glow. Giữ dấu hiệu cuộn phim ở mức tiết chế |
| Font | Playfair Display cho heading/quote ngắn; Be Vietnam Pro cho story, hồi đáp, ngày và UI |
| Khổ trang | Cùng container 1200px của home khi nền tảng này được duyệt; lề 16/24/32px theo viewport; vùng story tối đa khoảng 60–65 ký tự mỗi dòng |
| Type scale | Heading lớn vừa đủ cho masthead, heading chương rõ, body 16px, UI chính tối thiểu 14px, metadata khoảng 12px |
| Khoảng cách | Tái sử dụng nhịp 8/12/16/24/32/48/64/96px; intro ngắn hơn để sớm thấy một chương thật |
| Tương tác | Nút 44px trở lên cho vùng chạm; focus rõ, label đầy đủ; không nâng toàn bộ article đang chứa form khi hover |
| Motion | Khoảng 160ms/320ms theo token chung; cuộn do người dùng điều khiển; không autoplay, pulse lặp hoặc thêm hiệu ứng mở sách 3D ở màn này |

Không thêm một bộ Card/Button/SectionHeader mới. Dùng primitive đã có khi đúng
vai trò; article chứa form không bọc bằng Link toàn card. Thay đổi shared component
phải kiểm tra home và các consumer hiện hữu, nhất là MediaRailControls và ảnh catalogue.

## 5. Bố cục sau từng mốc

### Mốc A — màn hiện tại được chỉnh cho liền mạch

1. Header chung, trạng thái Hành trình được nhận biết bằng thị giác và ngữ nghĩa.
2. Masthead ngắn: “Hành trình của chúng mình”, lời dẫn hiện có và số chương nhỏ.
3. Filmstrip các chương ngang hàng, typography/card/marker theo nền tảng chung.
4. Hồi đáp vẫn trong từng chương; cải thiện form, độ đọc rõ và trạng thái.
5. Kết trang gọn với “Về bộ sưu tập” và “Mở hộp thư” dẫn tới route đã có.

Không tự cắt mất story/hồi đáp để ép card cao bằng nhau. Kiểm tra lối cuộn và
controls ở các chương có chiều dài rất khác nhau; sửa vị trí controls theo scope
timeline nếu cần, không đổi mặc định của các rail khác.

### Mốc B — filmstrip làm mục lục, nội dung có vùng đọc riêng

1. Header + masthead gọn, như mốc A.
2. Mục lục: các frame có ảnh nhỏ, số thứ tự, dateLabel và tiêu đề; cùng cấu trúc.
3. Thanh chọn mốc: “Đang đọc chương X / N”, nút trước/sau và select có nhãn
   “Chọn một mốc” để đi trực tiếp, đặc biệt hữu ích trên mobile.
4. Vùng đọc: tiêu đề, ngày, ảnh, story và lesson của chương được chọn.
5. Hồi đáp của chương đó, sau nội dung câu chuyện.
6. Liên kết chuyển chương ở cuối vùng đọc và điều hướng sang các màn khác.

Filmstrip dùng native scroll. Vuốt chỉ thay vị trí xem mục lục, không tự đổi
chương đang đọc; chọn frame mới đổi nội dung. Nút cuộn rail và nút “Chương trước/
sau” có nhãn phân biệt. Không tự chuyển chương theo timer hoặc vị trí cuộn.

Desktop đặt date/sequence thành phần phụ cạnh nội dung khi đủ chỗ; mobile xếp
theo chiều dọc. Story và hồi đáp không có scrollbar dọc lồng riêng. Ảnh nội dung
giữ bố cục tự nhiên, không ép mọi ảnh kỷ niệm vào crop dọc 4:5; thumbnail mục lục
có thể dùng tỷ lệ cố định 4:3. Thiếu ảnh không ngăn đọc chương.

## 6. Hành vi mới và trạng thái

### Chọn chương và URL

| Tình huống | Hành vi đề xuất |
| --- | --- |
| `/hanh-trinh` | Chọn chương đầu trong thứ tự hiện có; không đánh dấu featured |
| `/hanh-trinh?entry=<id>` | Mở đúng chương được phép đọc; frame mục lục hiện trạng thái đang chọn |
| Chọn frame, select hoặc trước/sau | Cập nhật entry bằng điều hướng thật; nút bị vô hiệu ở đầu/cuối; giữ vị trí vùng đọc hợp lý |
| Cuộn mục lục | Không đổi URL/selection; không làm mất nội dung đang viết |
| Back/Forward hoặc reload | Khôi phục chương từ URL; không nhảy về chương đầu sau mỗi refresh |
| ID sai, đã xóa hoặc không được phép đọc | Thông báo chung “Không tìm thấy mốc này”, có đường về Hành trình; không lộ tiêu đề hay phân biệt bản nháp với ID không tồn tại |
| Link cũ `#timeline-entry-<id>` | Giữ anchor trên preview; có bridge nhỏ chuẩn hóa sang query entry sau hydration để mở đúng vùng đọc; query entry rõ ràng được ưu tiên nếu có cả hai |
| Chương không có ngày cụ thể | Dùng dateLabel; không tự suy diễn ngày/năm từ câu chữ |

Thứ tự vẫn là sortOrder rồi occurredOn. Khi đồng hạng dùng ID làm tie-breaker
ổn định; không đổi thành mới nhất trước. Không gán trạng thái “đã đọc” bền vững.
Chỉ thông báo thay chương bằng aria-live sau thao tác chọn, không thông báo mỗi
pixel cuộn. Khi cần chuyển focus tới vùng đọc, chỉ làm sau thao tác rõ ràng và
không cướp focus lúc đang nhập hoặc refresh hồi đáp.

### Hồi đáp

- Đọc và viết trong một vùng ổn định; body dễ đọc, tên tác giả/ngày là metadata.
- Tạo và sửa đều có label; giữ giới hạn 2.000 ký tự; lỗi hiển thị cạnh form và
  được liên kết bằng aria-describedby/aria-invalid khi phù hợp.
- Trong lúc lưu/xóa: chống gửi lặp, phản hồi đúng thao tác; nếu request thất bại
  thì giữ nội dung đã nhập, thông báo lỗi rõ và cho thử lại.
- Chọn chương khác giữ draft tạo/sửa theo entryId/responseId trong state React
  của wrapper Hành trình; chỉ xóa sau khi lưu thành công hoặc người dùng hủy.
  Không dùng localStorage, không tự lưu lên database. Rời trang có nội dung chưa
  lưu cần cảnh báo phù hợp; draft không được coi là đã lưu qua reload/đóng tab.
- Refresh sau mutation giữ chương, vị trí đọc và draft khác; không chuyển về đầu rail.
- Xóa có xác nhận inline và trả focus về vị trí hợp lý; owner không được sửa
  lời của người khác. Avatar lỗi có chữ cái thay thế.

### Loading, error và dữ liệu biên

- Thêm `src/app/hanh-trinh/loading.tsx` và `error.tsx` dùng câu chữ Hành trình.
- Mốc A skeleton theo filmstrip; mốc B theo mục lục và vùng đọc. Khi chỉ tải lại
  hồi đáp, giữ phần câu chuyện đang đọc ổn định.
- Empty toàn trang: lời dẫn ngắn; owner có “Viết mốc đầu tiên” tới admin; member
  không có CTA quản trị. Một chương duy nhất không có controls vô ích.
- Story dài, lesson vắng, tên dài, URL liền chuỗi, ảnh hỏng, avatar hỏng và nhiều
  hồi đáp đều có cách hiển thị rõ; không dùng dữ liệu giả để lấp giao diện.

## 7. Dữ liệu và quyền

Mốc A giữ read path hiện tại, chỉ kiểm tra quyền và ghi nhận giới hạn. Mốc B
thiết kế typed mapping trước khi sửa component, trên schema hiện có:

| Phần | Hợp đồng đề xuất |
| --- | --- |
| Mục lục | `TimelineChapterSummary`: id, dateLabel, occurredOn, title, imageUrl, imageAltText, sortOrder; không mang story hoặc responses |
| Chi tiết | `TimelineChapterDetail`: thông tin chương được chọn, story, lesson và response page riêng |
| Trang hồi đáp | `TimelineResponsePage`: items, page, pageSize, total, pageCount; 20 hồi đáp mỗi trang, theo createdAt rồi ID |
| URL hồi đáp | `?entry=<id>&responsesPage=2`; đổi entry đặt trang hồi đáp về 1; trang quá lớn kẹp về trang cuối |
| Use case | `ListVisibleTimelineChapters` và `GetVisibleTimelineChapter`; kiểm tra active actor, validate ID/trang trước khi delegate |
| Reader | Đọc metadata cho mục lục, chi tiết theo ID, hồi đáp chỉ cho ID đang mở; batch profile của trang hồi đáp đó |

Không coi `entries.length` là tổng chính xác nếu API đã giới hạn kết quả. Mục lục
metadata phải đọc đủ qua các range có giới hạn và count đối chiếu trong phạm vi
nhật ký hiện tại; kiểm tra quy mô thật trước khi nghiệm thu. Nếu cần mục lục có
phân trang cho tập rất lớn, tách thiết kế đó thành việc tiếp theo, không âm thầm
cắt mất mốc hoặc kéo toàn bộ story/response về để làm navigation.

Trang Hành trình chung đề xuất chỉ hiển thị mốc đã công khai, kể cả khi owner đọc;
bản nháp được xem/quản lý ở `/admin/hanh-trinh`. Reader hiện không có filter
is_published; migration trong repo cho owner đọc bản nháp. Đây là quy tắc sản phẩm
cần xác nhận trong thiết kế mốc B, không phải kết luận có lỗ hổng RLS. Nếu được
duyệt, áp dụng filter phía server ở cả mục lục, count và chi tiết, RLS vẫn có hiệu lực.

| Vai trò | Đọc | Ghi |
| --- | --- | --- |
| Anonymous | Theo access guard tới login | Không |
| Member chưa được phép | Bị chặn, không có dữ liệu chương trong response | Không |
| Active member | Mốc công khai và hồi đáp được phép | Tạo hồi đáp, sửa/xóa của mình |
| Owner | Trải nghiệm đọc chung; bản nháp ở admin theo đề xuất trên | Quản lý mốc ở admin; gỡ hồi đáp, không sửa nội dung của người khác |

Không thay OAuth, migration, RLS, trigger hoặc Supabase dashboard trong kế hoạch
này. Không dùng service role cho public read path. Actions hiện hữu được giữ;
UI ẩn nút chỉ là hiển thị, quyền vẫn được kiểm tra server/database. `decorateResponses`
đang được admin reader import từ public reader: refactor cần giữ export tương thích
hoặc tách helper có kiểm soát và smoke test admin.

## 8. Lộ trình triển khai dự kiến

### Giai đoạn 0 — Chuẩn bị và chốt thiết kế

- [ ] Chốt contract dùng chung từ home; kiểm tra working tree lúc bắt đầu,
  không chạy lại nguyên các kế hoạch cũ hoặc ghi đè phần đang làm.
- [ ] Chụp baseline có đăng nhập ở 320, 390, 768, 1024, 1440px; gồm chương ngắn,
  dài, nhiều hồi đáp, trạng thái sửa/xóa và cuộn rail.
- [ ] Dựng bản bố cục desktop/mobile để duyệt mốc A và mốc B; đánh dấu rõ thay
  đổi so với filmstrip trước đây và quy tắc owner đọc bản nháp.
- [ ] Chạy baseline test liên quan, lint/build; ghi lại lỗi thật ở thời điểm đó.

Đầu ra: thiết kế được duyệt và baseline dùng để đối chiếu khi thực hiện.

### Giai đoạn 1 — Giao diện chung, hoàn thành mốc A

Files chính: `src/features/timeline/presentation/relationship-timeline.tsx`,
`timeline-chapter-card.tsx`, `timeline-response-panel.tsx`, `timeline-film-controls.tsx`,
`src/app/styles/components/timeline.css`, `src/app/styles/tokens.css`,
`src/app/hanh-trinh/loading.tsx` (mới), `src/app/hanh-trinh/error.tsx` (mới).

- [ ] Thu gọn hero/count, dùng cùng container, type scale, SectionHeader và Button.
- [ ] Chỉnh card/marker/form; bỏ gradient chữ, glow/pulse và nền hardcode trong scope.
- [ ] Sửa scroll-snap về đúng viewport; xác minh controls, text dài và touch dọc/ngang.
- [ ] Bổ sung label/focus cho sửa hồi đáp, trạng thái lỗi và fallback avatar.
- [ ] Thêm trạng thái route riêng và kết trang; kiểm tra home/header/rail dùng chung.

Đầu ra: Hành trình đồng bộ giao diện, giữ cách đọc filmstrip hiện tại.

### Giai đoạn 2 — Read model cho vùng đọc theo chương

Files chính: `src/modules/timeline/domain/timeline-models.ts`,
`application/timeline-reader.ts`, `application/list-visible-timeline-chapters.ts` (mới),
`application/get-visible-timeline-chapter.ts` (mới),
`infrastructure/supabase-timeline-reader.ts`, `infrastructure/timeline-mappers.ts`,
`src/lib/backend/create-server-backend.ts`, `src/app/hanh-trinh/page.tsx`.
Các đường dẫn rút gọn ở đây nằm dưới `src/modules/timeline/`.

- [ ] TDD cho use case, ID/trang không hợp lệ, actor, mapping nullable và read không tồn tại.
- [ ] Hoàn thiện projection mục lục, chi tiết, response page và batch profile.
- [ ] Thống nhất filter published theo thiết kế được duyệt; kiểm tra count và thứ tự.
- [ ] Đăng ký use case mới và query parsing; kiểm thử độc lập trước khi nối UI.
- [ ] Đo số query/payload; xác minh bằng quyền từng vai trò, không chỉ bằng mock test.

Đầu ra: dữ liệu typed cho UI mới, không đọc hồi đáp mọi chương cùng lúc.

### Giai đoạn 3 — Điều hướng và vùng đọc, hoàn thành mốc B

Files chính: `src/features/timeline/presentation/relationship-timeline.tsx`,
`timeline-chapter-preview.tsx` (mới), `timeline-chapter-reader.tsx` (mới),
`timeline-chapter-navigation.tsx` (mới), `timeline-draft-provider.tsx` (mới),
`timeline-legacy-anchor.tsx` (mới), `timeline-response-panel.tsx`,
`src/features/timeline/lib/timeline-navigation.ts`,
`src/app/styles/components/timeline.css`.

- [ ] Tạo preview và article đọc; giữ các chương đồng cấp, không thêm featured.
- [ ] Thực hiện entry URL, select, trước/sau, legacy hash và Back/Forward.
- [ ] Giữ draft theo ID trong wrapper ổn định; xử lý pending/error và refresh
  không mất chương hoặc nội dung đang viết; thêm phân trang hồi đáp.
- [ ] Ảnh vùng đọc dùng tỷ lệ phù hợp. Nếu cần mở rộng component ảnh dùng chung,
  ghi rõ API/consumer và kiểm tra catalogue; tránh sửa crop mặc định toàn ứng dụng.
- [ ] Loại bỏ phần render đầy đủ trong rail sau khi reader mới đã hoạt động;
  chỉ xóa component/use case cũ sau khi kiểm tra không còn consumer, kể cả test/admin.

Đầu ra: chọn chương → đọc → hồi đáp → chuyển chương là một luồng liên tục.

### Giai đoạn 4 — Kiểm chứng và bàn giao

- [ ] Thêm `src/modules/timeline/application/timeline-use-cases.test.ts`,
  `src/modules/timeline/infrastructure/supabase-timeline-reader.test.ts`,
  `src/features/timeline/lib/timeline-navigation.test.ts` và
  `src/features/timeline/presentation/timeline-response-panel.test.tsx` cho hành vi mới.
- [ ] Bổ sung test MediaRailControls khi thay contract dùng chung; không chỉ
  kiểm tra label/disabled mà cần xác minh đi đúng frame và resize/reduced motion.
- [ ] Thêm `tests/e2e/journey-cohesion.spec.ts` cho chọn chương, history, deep link,
  form, retry/xóa và viewport. Chạy mutation trong môi trường thử nghiệm được phép.
- [ ] Chạy test liên quan, `rtk npm run lint`, `rtk next build` và e2e theo scope.
- [ ] Browser QA 320/390/768/1024/1440px: overflow, focus, ảnh, hover, text dài,
  bàn phím, thao tác vuốt và prefers-reduced-motion; smoke test home và admin timeline.
- [ ] Đối chiếu diff với scope, ảnh trước/sau và ma trận quyền; báo rõ hạn chế
  xác minh nếu thiếu môi trường hoặc phiên đăng nhập thử nghiệm.

## 9. Tiêu chí nghiệm thu

1. Hành trình cùng palette, type scale, khổ trang và nhịp motion với home.
2. Không thêm chương nổi bật; thứ tự nghiệp vụ được giữ, marker/preview có cùng thứ bậc.
3. Ở mốc B, story 8.000 ký tự và nhiều hồi đáp không làm mục lục cao theo nội dung.
4. Cuộn ngang nằm trong rail, cuộn dọc trang vẫn bình thường; controls/focus không bị che.
5. Query entry, legacy hash, Back/Forward và refresh mở đúng chương; ID không đọc được không lộ dữ liệu.
6. Đổi chương không làm mất draft trong phiên; lỗi lưu giữ nội dung; không gửi trùng khi pending.
7. Tạo/sửa/xóa hồi đáp đúng quyền và đúng chương; owner không sửa lời người khác.
8. Loading/error/empty/ảnh lỗi đúng ngữ cảnh; không tự tạo dữ liệu hoặc ngày giả.
9. Cả năm viewport đọc được, không overflow hoặc cắt dấu tiếng Việt; reduced motion không giấu nội dung.
10. Có kết quả test/lint/build/browser/RLS phù hợp cho thay đổi; không dùng báo cáo cũ làm bằng chứng mới.

Các tiêu chí keyboard/focus, form, chuyển động và URL state được đối chiếu với
[Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

## 10. Giới hạn và bước tiếp theo

Phạm vi là `/hanh-trinh`, query state, luồng hồi đáp và read path hỗ trợ.
Admin chỉ được smoke test hoặc chỉnh consumer chung cần thiết; không redesign
`/admin/hanh-trinh`. Không thêm chat, reaction, nhắc ngày, export, upload hoặc
trạng thái đọc bền vững. Những tính năng đó cần thiết kế và phạm vi riêng.

Sau khi người dùng duyệt thiết kế, dùng `superpowers:writing-plans` để viết
implementation plan chi tiết theo từng mốc từ working tree mới nhất. Thực hiện
tuần tự, không sub-agent, không tự tạo branch/commit. Tài liệu này là đầu ra của
yêu cầu lập kế hoạch; không phải chỉ thị bắt đầu sửa code.
