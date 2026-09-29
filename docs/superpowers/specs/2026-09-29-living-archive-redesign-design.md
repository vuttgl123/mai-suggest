# Living Archive — nâng cấp bản sắc toàn site

**Ngày:** 2026-09-29
**Trạng thái:** Đã duyệt toàn bộ D1–D5 theo phương án đề xuất (2026-09-29) và đã
triển khai. Migration RLS của D4 đã viết nhưng **chưa chạy** lên Supabase.

### Thay đổi sau khi duyệt (yêu cầu của người dùng, 2026-09-29)

- **Font:** thay Plus Jakarta Sans + Inter + Literata bằng hai họ:
  **Newsreader** (optical size) cho tiêu đề và chữ của người, **Be Vietnam Pro**
  cho giao diện. Lý do: người dùng thấy font cũ chưa đẹp; so sánh trực tiếp với chữ
  tiếng Việt cho thấy Plus Jakarta Sans làm dấu chồng chen chúc ở cỡ lớn. Tiêu đề
  dùng độ đậm 500, tracking nới hơn. Mục 4.2 bên dưới giữ nguyên để tham chiếu.
- **Full màn hình:** bỏ giới hạn 80rem; nội dung trải hết chiều ngang trừ lề trang
  `clamp(2.5rem, 4vw, 5rem)`. Cột đọc giữ 66ch; ảnh lớn bị giới hạn theo chiều cao
  màn hình. Bìa trang chủ phủ trọn màn hình đầu tiên trên desktop.
- **Hiệu ứng theo phần** (`effects.css`): hiện vật "gắn" lên giấy, đường kẻ mục lục
  tự vẽ, phong bì trượt vào giá, ảnh chương "hiện hình", tiêu đề nhô lên, header
  đặc lại khi cuộn, ảnh bìa trôi chậm khi rời màn hình; hover: ảnh zoom nhẹ trong
  khung, nắp phong bì hé, nền dòng mục lục. Dùng CSS scroll timeline, không JS;
  trình duyệt không hỗ trợ hiển thị bình thường; tắt khi giảm chuyển động.
- **Nghi thức mở thư, bản 2** (người dùng thấy bản đầu chưa ấn tượng): khoảng 2,6
  giây thay cho 0,8–1,2 giây trong brief, bỏ qua được bất cứ lúc nào (nút, chạm,
  Esc, Enter), không phát lại khi đọc lại, tắt khi giảm chuyển động. Nhịp: phòng
  tối và quầng sáng vàng → phong bì nổi lên → ánh sáng lướt qua dấu sáp → dấu vỡ,
  vụn sáp rơi, bụi vàng bay → nắp lật lộ lót Bordeaux → thư trượt ra → trang thư
  mở gấp, chữ hiện từng dòng.
- **Sửa lỗi mobile "mất nội dung sau khi mở thư"**, hai nguyên nhân đã tái hiện:
  (1) tờ thư bị kéo cao đúng một màn hình, thư dài tràn chữ tối lên nền đêm;
  (2) ở trình duyệt thiếu `showModal` (webview trong app), phòng đọc bị cắt trong
  khung phong bì. Phòng đọc giờ render qua portal vào `body`, khóa cuộn trang nền,
  tờ thư cao theo nội dung.
**Tên làm việc:** Bảo tàng nhỏ của chúng mình / A Living Archive. Tên thương hiệu
"Điều Em Yêu" giữ nguyên.

## Quan hệ với các đặc tả trước

Tài liệu này thay thế hướng thị giác của `implementation_plan.md` ("Modern
SaaS-infused", commit `9b5fea3`) và phần thị giác của
`2026-09-04-quiet-editorial-home-design.md`. Kiến trúc, ranh giới server/client,
quy tắc dữ liệu và quyền trong các đặc tả cũ vẫn giữ nguyên hiệu lực.

Nếu được duyệt, nó cũng đảo ngược quyết định giữ hành trình Three.js
(`2026-07-22-cinematic-diary-intro-landing-design.md` và các đặc tả nối tiếp) làm
màn mở đầu trang chủ — xem "Quyết định cần duyệt", mục D2.

## Ranh giới kiểm chứng

- **Đã kiểm chứng bằng đọc mã:** mọi khẳng định có đường dẫn file bên dưới.
- **Đã xem trực tiếp:** trang `/login` trên dev server (ảnh chụp 1280 px).
- **Chưa xem được:** các trang cần đăng nhập. Phiên Playwright trong
  `tests/e2e/.auth/state.json` (ngày 04/09) đã hết hạn và chuyển hướng về
  `/login`. Chẩn đoán các trang này dựa trên mã nguồn, không dựa trên ảnh.
- **Chưa đo:** LCP, CLS, INP. Không có số đo nào trong tài liệu này.
- Các skill `superpowers:*` và công cụ `rtk` mà `AGENTS.md` nhắc tới không có
  trong phiên này; quy trình brainstorm → duyệt → plan → TDD → xác minh được làm
  thủ công theo đúng tinh thần đó.

---

## 1. Chẩn đoán

### 1.1 Bản sắc đang bị tách làm hai

`src/app/styles/tokens.css` (commit `9b5fea3`) đặt `:root` theo bảng màu SaaS:
`--color-brand: #0f172a`, `--color-accent: #3b82f6`, `--color-paper: #ffffff`.
Khối `body[data-theme="bordeaux"]` trong `themes.css` chỉ đổi radius và hoa văn,
không đổi màu. Vì vậy chủ đề mặc định mang tên "Bordeaux Diary" thực tế hiển thị
slate + xanh dương, kèm hoa văn đồng Bordeaux và radius lệch kiểu giấy.

Bốn preset theo mùa (`valentine`, `spring`, `noel`, `anniversary`) vẫn mang bảng
màu Bordeaux thời kỳ trước. Hệ quả: đổi chủ đề là đổi cả họ màu thương hiệu, trái
với nguyên tắc "thay không khí, giữ sự quen thuộc".

Ảnh chụp `/login` xác nhận: nền rượu vang, nhãn "Điều Em Yêu" màu xanh dương
`#3b82f6`, thẻ kính mờ lớn giữa màn hình.

### 1.2 Trang chủ bắt người xem đi qua một màn mở đầu

- `CinematicDiaryIntro` chiếm `min-height: 140svh`
  (`cinematic-diary.css:6`); `<h1>` của nó là `sr-only`. Nội dung thật bắt đầu sau
  khoảng 1,4 màn hình. Brief yêu cầu không ép xem intro.
- Fallback CSS của intro ghi cứng "Anh yêu em"
  (`cinematic-diary-intro.tsx`). Câu này giả định hai người và giới tính, trái yêu
  cầu hỗ trợ nhiều thành viên.
- Three.js chỉ tồn tại trong intro này. `ThemeAtmosphere` là các lớp gradient CSS,
  không dùng Three.js (khác với mô tả trong brief).

### 1.3 Bộ sưu tập

- Chế độ tổng quan dựng N băng cuộn ngang (`CatalogueChapterBand`), mỗi băng 6
  item. Người xem phải cuộn ngang trong từng chương.
- **Lỗi điều hướng (đọc mã, chưa xác minh trên trình duyệt):** "Xem tất cả" và
  "Xem thêm" trong `catalogue-chapter-band.tsx` trỏ tới
  `/catalogue/${preview.category.slug}`. Route đó tra **item** theo slug
  (`catalogue/[slug]/page.tsx` → `getVisibleItemDetail`), nên nhiều khả năng trả
  404. Đường đúng là `createCataloguePath({ categorySlug, page: 1 })`.
- Nút quay lại ở chi tiết luôn về `/#collection`
  (`catalogue-detail-hero.tsx:27`), làm mất bộ lọc, từ khóa và trang đang xem.
- Danh sách item không có trạng thái cá nhân hay hành động lưu:
  `CatalogueItemSummary` không chứa `user_item_states`.

### 1.4 Hành trình

- Điều hướng chương duy nhất là cuộn phim ngang (`timeline-film-viewport`), kể cả
  trên mobile. Brief yêu cầu không bắt kéo ngang cả hành trình.
- Chương đang đọc được bọc trong `Card`; không có liên kết chương trước/sau.
- Giữ được: `?chapter=<id>` và hành vi tự chọn chương đầu tiên
  (`hanh-trinh/page.tsx`).

### 1.5 Thư hẹn ngày mở

Nền tảng quyền đang tốt ở phía người xem:

- Hộp thư chung chỉ lấy cột tóm tắt (`FUTURE_LETTER_SUMMARY_COLUMNS`), lọc
  `opens_at <= serverNow`.
- Nội dung chỉ tải khi bấm mở qua `getOpenedFutureLetterAction`, lọc lại theo giờ
  server.
- Số "đang niêm phong" ở hero là thư của chính tác giả (`listOwnScheduled` lọc
  `author_id`).
- Nghi thức mở đã có (460 ms → 1020 ms) và tôn trọng reduced motion.

Mâu thuẫn quyền riêng tư với Owner được trình bày ở mục 7.

### 1.6 Vấn đề hệ thống

- Hiệu ứng lặp và vô hạn: `animate-luxury-reveal` với độ trễ so le, keyframe
  `luxury-float` vô hạn, và khai báo lỗi chính tả `---slow` trong `@theme`
  (`globals.css`).
- 11 icon `<Heart>` dùng làm trang trí, trong đó có mọi empty state.
- Màu cứng cản trở chủ đề tối: 10 `bg-white`, 27 `text-white`, 19 `*-black/*`
  trong TSX.
- Nhiều nhãn nhỏ dùng `text-muted/60`, `text-muted/70` hoặc cỡ `text-[9px]`,
  `text-[10px]`.

### 1.7 Nền tảng nên giữ

`requireActivePageAccess()`, đọc dữ liệu qua use case trong Server Component, RLS
làm lớp quyền cuối, phân trang server-side, `ViewTransition` cho chuyển bộ lọc,
skip link trên mọi trang, `MediaRailControls` có nhãn trợ năng, xử lý reduced
motion trong nghi thức thư.

### 1.8 Giả định

- Đa số thời gian có hai thành viên hoạt động, nhưng thiết kế phải chạy với N.
- Ảnh là URL ngoài do Owner nhập; tỷ lệ và chất lượng không đồng đều.
- Có thể có chương hành trình, danh mục hoặc thư không có ảnh.
- `categories.cover_image_url` có thể trống.

---

## 2. Nghiên cứu tham chiếu

Ảnh chụp headless ở 1280 px, lưu trong scratchpad của phiên. Chỉ ghi điều nhìn thấy
trên khung tĩnh. Không có kết luận nào về motion.

### 2.1 Ba nguồn dẫn dắt art direction

| Nguồn | Quan sát | Nguyên lý | Ứng dụng | Giới hạn |
| --- | --- | --- | --- | --- |
| [Kinfolk](https://www.kinfolk.com/) (trang chủ tạp chí) | Bìa số báo chiếm khoảng 22% chiều ngang, đặt giữa một khoảng trắng rất lớn. Tiêu đề và dòng dẫn là một khối chữ hai dòng cùng cỡ. Dòng meta "Arts & Culture, Issue 61" nằm trên tiêu đề của từng bài. Ảnh tràn viền, danh sách bài phủ lên góc ảnh. | Độ tương phản tỷ lệ: một vật thể nhỏ trong khoảng trắng lớn, hoặc một ảnh tràn với chữ nhỏ. Tiêu đề và dòng dẫn đi thành một cặp. | Bìa trang chủ (ảnh tràn phải, chữ nhỏ hơn ảnh); nhãn lưu trữ của hiện vật; cặp tiêu đề/dẫn của chương. | Là tạp chí thương mại, có banner đăng ký cố định. Không học banner hay thẻ danh mục ALL CAPS. |
| [Aman](https://www.aman.com/) (trang chủ) | Banner cookie che phần lớn trang; mình không chấp nhận cookie. Phía sau: bố cục bất đối xứng ảnh 2/3 + ảnh 1/3; một cột chữ hẹp bên trái, hàng ảnh bên phải; liên kết là chữ gạch chân ("Discover more"), không phải nút. | Tiết chế: CTA bằng liên kết chữ, lời dẫn ngắn, khoảng nghỉ dài giữa các cụm. | Các lối vào trên trang chủ; catalogue chi tiết (liên kết bản đồ/menu dạng chữ rõ ràng); giọng văn ngắn. | Hero là video đang tải nên không kết luận về hero. Là website bán dịch vụ cao cấp; không mang nút "Reserve" hay cấu trúc bán hàng. |
| [The Pudding — menu story](https://pudding.cool/2026/06/menu-story/) | Khung đầu: các thực đơn cổ được scan như hiện vật thật, xếp chồng và xoay nhẹ trên nền giấy; câu hỏi tiêu đề nằm trong một ô chú thích; có gợi ý điều khiển bằng bàn phím. | Tài liệu được trình bày như vật thể có mép, bóng, dấu thời gian, chứ không phải ảnh trong khung UI. Điều hướng có chỉ dẫn bàn phím rõ. | Ảnh như hiện vật (passe-partout), phong bì thư, gợi ý phím tắt trong nghi thức thư. | Chỉ xem khung đầu. Câu chuyện này điều hướng theo từng slide, không phải scrollytelling; không suy ra chuyển động. |

### 2.2 Nguồn hỗ trợ UX

| Nguồn | Quan sát | Nguyên lý | Ứng dụng | Giới hạn |
| --- | --- | --- | --- | --- |
| [FutureMe](https://www.futureme.org/) (trang chủ) | Vùng soạn thư là hero. Bộ chọn "Deliver in" (6 tháng, 1 năm…) và "Or choose a date" nằm ngay cạnh vùng viết. Quy trình được gọi tên "Write. Pick a date. Send. Verify." Một nút chính duy nhất. | Đặt ngày giờ cạnh nơi viết; gọi tên nghi thức bằng các bước ngắn. | Form hẹn thư: ngày, giờ và múi giờ đặt cạnh nhau; câu giải thích ngay trên nút hẹn. | Là trang marketing có form. Không mô phỏng email, công khai ẩn danh hay tính năng trả phí. |
| [Linear — How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui) | Bài viết mô tả: giảm nhiễu ở sidebar, tab, header; căn chỉnh icon và nhãn; hệ màu LCH từ ba biến (base, accent, contrast); hạn chế dùng màu chrome; tăng tương phản chữ. | Chrome trung tính; màu thương hiệu chỉ cho hành động và trạng thái. Token màu sinh từ ít biến gốc. | Admin, tab trong hộp thư, trạng thái tương tác. Token theo chủ đề sinh từ nền, chữ và accent. | Là bài viết, không phải giao diện được thao tác. Linear là công cụ làm việc; chỉ áp dụng cho admin. |
| [Are.na — About](https://www.are.na/about) | Ba khái niệm: block, channel, connection. Một block có thể nằm trong nhiều channel mà không nhân bản. Trang giới thiệu dạng văn bản, danh sách a/b/c. | Nội dung là đơn vị độc lập, được tập hợp vào các ngữ cảnh. | Củng cố mô hình "hiện vật + chương". Gợi ý mở rộng: một hiện vật thuộc nhiều chương (cần dữ liệu mới, xem mục 10). | Là trang giới thiệu, không phải giao diện bên trong app. |
| [Day One — On This Day](https://dayoneapp.com/features/on-this-day/) | Chỉ đọc được văn bản; bản headless bị chặn bởi màn xác minh người dùng và mình không vượt qua. Nội dung: gợi lại bài viết, ảnh, địa điểm của cùng ngày những năm trước, trong một view riêng. | Chỉ gợi lại khi thật sự có dữ liệu cùng ngày. | Ô "Ngày này năm ấy" trên trang chủ, chỉ hiện khi có chương khớp ngày. | Trang marketing; không thấy giao diện thật. |

### 2.3 Nguồn không dùng làm căn cứ

- [Cosmos](https://www.cosmos.so/): chỉ xem landing page (ảnh xoay rải quanh một
  tiêu đề lớn ở giữa). Đó là marketing, không phải giao diện bộ sưu tập; không dùng.
- [Mobbin](https://mobbin.com/): cần tài khoản để xem màn hình và flow. Không truy
  cập.
- [Landbook](https://land-book.com/): trả về HTTP 403 khi truy cập tự động.
- [Awwwards — Storytelling](https://www.awwwards.com/websites/storytelling/) và
  [Recent](https://recent.design/) (godly.website chuyển hướng tới đây): chỉ đọc
  được danh sách và bộ lọc, chưa mở từng website. Không dùng làm căn cứ.

---

## 3. Ba hướng sáng tạo

### 3.1 Bảo tàng nhỏ của chúng mình / A Living Archive — **chọn**

- **Ý tưởng:** mỗi kỷ niệm là một hiện vật được lưu giữ cẩn thận. Ảnh được "đóng
  khung" như bản in trong bảo tàng; ngày tháng và nguồn gốc nằm trên nhãn lưu trữ.
  Không gian vẫn đang được viết tiếp, nên có một sợi chỉ nối các chương.
- **Bảng màu:** giấy ngà, mực, Bordeaux, hồng đất (trang trí), olive trầm (trạng
  thái).
- **Typography:** Plus Jakarta Sans cho tiêu đề, Inter cho giao diện, Literata cho
  chữ do thành viên viết.
- **Hero:** ảnh chương mới nhất tràn mép phải; khối chữ nhỏ hơn ở trái, có nhãn
  lưu trữ.
- **Tương tác đặc trưng:** mục lục chương; rê chuột hoặc focus vào một dòng làm
  ảnh xem trước của chương đó hiện ra.
- **Rủi ro:** dễ thành "kem + serif + đỏ" chung chung; dễ trang trí quá tay bằng
  giấy, tem, băng dính. Cách giảm rủi ro nằm ở mục 4.10.

### 3.2 Thư lúc chạng vạng / Blue Hour Letters

- **Ý tưởng:** không gian chờ đợi: xanh đêm, một nguồn sáng vàng ấm chiếu vào tờ
  thư.
- **Bảng màu:** xanh đêm `#1B2130`, giấy `#F5F1EA`, vàng ấm `#E0B872`, hồng đất.
- **Typography:** như 3.1, nội dung thư dùng Literata cỡ lớn hơn.
- **Hero:** tối, một phong bì nằm giữa một vệt sáng.
- **Tương tác đặc trưng:** con dấu niêm phong tách đôi, vệt sáng lan ra tờ thư.
- **Rủi ro:** đọc lâu trên nền tối mệt mắt; khó giữ tương phản cho ảnh và form; dễ
  thành "điện ảnh" thay vì thân mật.
- **Vai trò được giữ lại:** phòng đọc thư (lớp phủ khi mở thư) và preset "Đêm cuối
  năm".

### 3.3 Những ngày bình thường đáng nhớ / Sunday Archive

- **Ý tưởng:** album đời thường: ảnh nhỏ nhiều, collage có lưới, nhịp vui.
- **Bảng màu:** nền sáng gần trắng, olive, hồng đất, một điểm Bordeaux.
- **Typography:** Plus Jakarta Sans tỷ lệ lớn, Inter; không serif.
- **Hero:** lưới ảnh 3×2 so le, câu mở đầu ngắn đè lên một ô.
- **Tương tác đặc trưng:** ảnh xoay nhẹ khi được lưu.
- **Rủi ro:** phụ thuộc nhiều ảnh đẹp; nhanh chóng giống scrapbook hay mạng xã hội;
  kém chiều sâu cho thư và hành trình.

### 3.4 Vì sao chọn 3.1

3.1 chịu được việc thiếu ảnh: nhãn lưu trữ và chữ vẫn đứng được một mình. Nó có
chỗ cho cả ba nhịp của sản phẩm: sưu tầm (catalogue), đọc lại (hành trình), mong
chờ (thư). 3.2 mạnh nhưng hẹp, nên được dùng đúng chỗ: phòng đọc thư và một preset
mùa. 3.3 cần nguồn ảnh mà dữ liệu hiện tại không bảo đảm.

---

## 4. Design system

### 4.1 Màu và vai trò

Giữ tên token hiện có để không phải đổi hàng trăm utility (`bg-paper`,
`text-brand-strong`…), chỉ đổi giá trị và ghi rõ vai trò.

| Token | Giá trị | Vai trò | Tương phản đã tính |
| --- | --- | --- | --- |
| `--color-surface` | `#F5F1EA` giấy ngà | Nền trang | — |
| `--color-paper` | `#FBF9F5` giấy vellum | Bề mặt nâng: form, dialog, tờ thư, passe-partout | — |
| `--color-ink` | `#282522` mực | Chữ nội dung | 13,5:1 trên ngà |
| `--color-muted` | `#5A534C` mực nhạt | Chữ phụ, meta, nhãn | 6,7:1 trên ngà |
| `--color-brand` | `#6D2936` Bordeaux | Hành động chính, liên kết, focus, chỉ đỏ đậm | 9,2:1 trên ngà; chữ ngà trên nền Bordeaux 9,2:1 |
| `--color-brand-strong` | `#4A1D26` rượu vang sâu | Tiêu đề | 12,5:1 trên ngà |
| `--color-brand-soft` | `#EFE3DF` | Nền trạng thái đang chọn | chữ mực 12,1:1, chữ Bordeaux 8,3:1 |
| `--color-accent` | `#8C4F49` hồng đất sẫm | Chữ nhấn nhỏ (thay cho xanh dương cũ) | 5,6:1 trên ngà |
| `--color-rose` (mới) | `#C18C86` hồng đất | **Chỉ trang trí:** sợi chỉ, dấu niêm phong, viền ảnh chọn | 2,5:1, không dùng cho chữ |
| `--color-olive` (mới) | `#707566` olive trầm | Icon trạng thái, chấm "đã thử/đã mua" | 4,2:1, đạt 3:1 cho đồ họa; không dùng cho chữ nhỏ |
| `--color-positive` | `#5C6152` olive sẫm | Chữ trạng thái tích cực | 5,7:1 trên ngà |
| `--color-danger` | `#9B2C1F` | Xóa, lỗi; luôn đi kèm icon và chữ | 6,7:1 trên ngà |
| `--color-border` | mực 14% alpha | Viền hairline, đường phân tách | trang trí |
| `--color-border-input` (mới) | ~ `#8A7F71` | Viền ô nhập | mục tiêu ≥ 3:1, đo lại khi triển khai |
| `--color-focus` | `#6D2936` | Vòng focus 2 px, offset 3 px | 9,2:1 |
| `--color-night` (mới) | `#1B2130` | Phòng đọc thư, preset Đêm cuối năm | chữ ngà 14,3:1 |
| `--color-gold` (mới) | `#E0B872` | Ánh sáng ấm trên nền đêm | 7,3:1 trên `#262E40` |

Quy tắc:

- Bordeaux chỉ dành cho hành động, liên kết và điểm nhấn có chủ đích. Không phủ
  Bordeaux lên diện rộng ngoài nút chính và dấu niêm phong.
- Trạng thái không bao giờ chỉ dựa vào màu: luôn có chữ, và icon hoặc hình dạng.
- Không gradient phủ nền. Một lớp grain SVG tĩnh, độ mờ 3–4%, đặt trên nền trang.

### 4.2 Typography: ba giọng

| Giọng | Font | Dùng cho |
| --- | --- | --- |
| Tiêu đề | Plus Jakarta Sans 600/700 | Tiêu đề trang, chương, hiện vật; số chương |
| Giao diện | Inter 400/500/600 | Điều hướng, nút, form, nhãn, thông báo, meta |
| Chữ của người | **Literata** 400 + italic 400 (đề xuất thêm) | Câu chuyện chương, chiêm nghiệm, nội dung thư, lời nhắn đánh giá, hồi đáp, bình luận |

Lý do thêm Literata: font thứ ba có một vai trò rõ, là **phân biệt lời của thành
viên với lời của giao diện**. Literata được thiết kế cho đọc dài, có trục optical
size và subset `vietnamese` trong `next/font`, đã kiểm tra trong
`font-data.json` của Next 16.2.10. Nếu không duyệt, chữ của người dùng Inter 18 px
với line-height 1,75.

Thang cỡ, bám thang cổ điển 12–14–16–18–21–24–36–48–60–72:

| Token | Cỡ | Line-height | Tracking | Font |
| --- | --- | --- | --- | --- |
| `--type-cover` | `clamp(2.5rem, 5.2vw, 4.5rem)` (40→72) | 1,04 | −0,03em | PJS 600 |
| `--type-display` | `clamp(2.25rem, 4vw, 3.75rem)` (36→60) | 1,06 | −0,025em | PJS 600 |
| `--type-heading` | `clamp(1.75rem, 2.6vw, 2.25rem)` (28→36) | 1,15 | −0,02em | PJS 600 |
| `--type-title` | `1.3125rem` (21) | 1,3 | −0,01em | PJS 600 |
| `--type-lead` | `1.3125rem` (21) | 1,55 | 0 | Literata |
| `--type-prose` | `1.125rem` (18) | 1,75 | 0 | Literata, tối đa 66ch |
| `--type-body` | `1rem` (16) | 1,6 | 0 | Inter |
| `--type-small` | `0.875rem` (14) | 1,5 | 0 | Inter |
| `--type-label` | `0.8125rem` (13) | 1,4 | 0,01em | Inter 500, sentence case |

- Ngày giờ, đếm ngược, số lượng và số chương dùng `tabular-nums`.
- Không nhãn ALL CAPS. Không eyebrow phía trên mọi tiêu đề. Nhãn chỉ gắn vào hiện
  vật.
- Không tô riêng một từ trong tiêu đề.
- Tiêu đề dùng `text-wrap: balance`; đoạn văn dùng `text-wrap: pretty`.
- Cỡ nhỏ nhất cho chữ có nghĩa là 13 px. Bỏ `text-[9px]`, `text-[10px]` và các
  opacity `/60`, `/70` trên chữ.

### 4.3 Lưới và khoảng cách

- Desktop: 12 cột, nội dung tối đa 1280 px, gutter 24 px, lề 40 px.
- Tablet 768: 8 cột, gutter 20 px, lề 32 px.
- Mobile: 4 cột, lề 16 px.
- Cột đọc: 66ch cho Literata 18 px (khoảng 680 px), đặt ở cột 4–10 hoặc 5–11 tùy
  trang.
- Bước khoảng cách: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.
- Nhịp section: 96–128 px trên desktop, 64 px trên mobile.
- Căn chữ: căn trái mọi nơi. Chỉ màn bảo trì và empty state ngắn được căn giữa.

### 4.4 Radius, độ nổi, chất liệu

Radius theo vai trò, không một giá trị cho mọi thứ:

| Vai trò | Radius | Ghi chú |
| --- | --- | --- |
| Hiện vật: ảnh, phong bì | 2 px | Bản in, giấy có cạnh sắc |
| Bề mặt giấy: dialog, tờ thư, form | 6 px | |
| Điều khiển: nút, chip, ô tìm kiếm, header capsule | 999 px | Thao tác thì mềm tay |

Bỏ các radius lệch (`1.2rem 1.65rem 1.3rem 1.55rem`…) của các preset.

Độ nổi:

- `flat`: chỉ hairline.
- `resting`: hiện vật nằm trên giấy,
  `0 1px 1px rgb(40 37 34 / 6%), 0 10px 24px -14px rgb(74 29 38 / 22%)`.
- `floating`: header capsule, menu, dialog; bóng sâu hơn, ám Bordeaux.

Kính mờ chỉ dùng ở header capsule, menu di động và backdrop dialog. Vùng đọc dài
luôn nằm trên nền đặc.

### 4.5 Ảnh

- **Hiện vật** (ảnh item, ảnh trong thân chương, ảnh đính kèm thư) có
  passe-partout: viền giấy vellum 8 px (6 px trên mobile), hairline ngoài, bóng
  `resting`. Tỷ lệ cố định theo vị trí (4:5 trong lưới, 3:2 trong chương) với
  `object-fit: cover`. Luôn có đường xem ảnh đầy đủ (mở dialog ảnh gốc).
- **Không khí** (ảnh bìa trang chủ, ảnh mở chương danh mục) tràn viền, không
  passe-partout.
- Giữ tỷ lệ khung trước khi ảnh tải (`aspect-ratio`) để tránh nhảy bố cục. Ảnh bìa
  ưu tiên tải (`fetchPriority="high"`), ảnh ngoài màn hình `loading="lazy"`.
- Thiếu ảnh: khung giữ đúng tỷ lệ, nền giấy sâu hơn, bên trong đặt tiêu đề hiện
  vật bằng PJS. Không dùng ảnh stock, không tạo ảnh giả làm kỷ niệm.
- Ảnh lỗi: cùng khung thiếu ảnh, thêm dòng "Ảnh này chưa tải được" và liên kết mở
  ảnh gốc.

### 4.6 Icon

Lucide, nét 1,5, cỡ 16 hoặc 20. Icon đứng một mình phải có `aria-label`. Trái tim
chỉ còn ở **hai nơi**: nút Yêu thích (nơi nó mang nghĩa) và dấu thương hiệu. Bỏ
khỏi mọi empty state và trang trí.

### 4.7 Ba chi tiết nhận diện

1. **Nhãn lưu trữ.** Lấy từ nhãn tường trong bảo tàng: các dòng xếp chồng, căn
   trái, nằm dưới một hairline ngắn. Thứ tự: tiêu đề (PJS 600), ngày (tabular),
   nguồn gốc (chương, người viết). Không nối các dòng bằng dấu chấm giữa. Dùng cho
   item, chương hành trình và thư.
2. **Sợi chỉ.** Một đường 1 px màu `--color-rose`. Trong hành trình, nó là trục
   mục lục chương. Trên trang chủ, nó nối nhãn bìa xuống mục lục. Trong thư, nó là
   sợi dây buộc phong bì. Sợi chỉ chỉ nối, không bao giờ đo tiến độ.
3. **Dấu niêm phong.** Một đĩa Bordeaux có vân sáp. **Chỉ** xuất hiện ở thư (đang
   niêm phong, đang mở) và làm nền cho dấu thương hiệu trong header. Hiếm nên có
   nghĩa.

Không dùng: băng dính, sticker, mép giấy xé, tem bưu chính, hoa văn hạt.

### 4.8 Motion

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| `--motion-micro` | 160 ms | hover, press, đổi màu |
| `--motion-component` | 280 ms | mở menu, đổi tab, chuyển chương |
| `--motion-scene` | 640 ms | ảnh bìa "hiện hình" lần đầu |
| `--motion-ritual` | tổng 1000 ms | nghi thức mở thư |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | xuất hiện |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | trạng thái |

Bỏ `luxury-reveal` so le, `luxury-float`, `pulse-slow`, `float-subtle`. Skeleton
dùng tông tĩnh, không shimmer. Không chiếm quyền cuộn, không tự phát âm thanh.
`prefers-reduced-motion: reduce` tắt mọi chuyển động không do người dùng kích
hoạt, và rút chuyển động do người dùng kích hoạt thành đổi trạng thái tức thì.

### 4.9 Token theo chủ đề

Mọi preset chỉ đổi token, ánh sáng và chuyển động. Vị trí điều hướng, ý nghĩa
trạng thái, radius và typography giữ nguyên. Không đổi `SITE_THEME_KEYS`, nên không
cần migration.

| Key | Tên hiển thị | Nền | Chữ | Hành động | Trang trí |
| --- | --- | --- | --- | --- | --- |
| `bordeaux` | Bordeaux Diary (mặc định) | ngà `#F5F1EA` | mực | Bordeaux `#6D2936` | hồng đất |
| `valentine` | Lời hẹn tháng Hai | ngà ấm hơn `#F7EFEA` | mực | ruby `#7A1F33` | hồng đất đậm hơn |
| `spring` | Mùa xuân dịu dàng | ngà `#F3F1E8` | mực | Bordeaux | sage `#8A9479` (trang trí), olive |
| `noel` | Đêm cuối năm (Blue Hour) | đêm `#1B2130` | ngà | vàng ấm `#E0B872` | hồng đất |
| `anniversary` | Chương kỷ niệm | ngà sâu `#F1EADF` | mực | rượu vang `#5F1A28` | vàng cổ `#A88343` (trang trí) |

`noel` là chủ đề tối duy nhất. Nó đòi hỏi quét toàn bộ màu cứng (mục 1.6) và đo
lại tương phản trước khi bật. `ThemeAtmosphere` rút còn grain và một vùng sáng mềm
theo preset.

### 4.10 Tự rà soát trước khi chốt

Đã đối chiếu kế hoạch với các lựa chọn mặc định dễ gặp:

- **Nền kem + serif tương phản cao + accent đỏ đất.** Brief ghim nền ngà và
  Bordeaux, nên giữ. Tiêu đề vẫn là sans (PJS); serif bị giới hạn cho chữ của
  thành viên, không làm display.
- **Bỏ:** mục lục ba lối vào đánh số La Mã I/II/III. Ba phân hệ không phải một
  chuỗi nên không đánh số.
- **Bỏ:** "số hiệu hiện vật" kiểu `2026.14` cho item. Đó là số bịa, không mang
  thông tin. Chỉ chương hành trình (một chuỗi thật theo `sort_order`) và chương
  catalogue (mục lục có thứ tự) được đánh số.
- **Thay:** chuỗi meta nối bằng dấu chấm giữa → nhãn xếp chồng. Riêng thời điểm mở
  thư viết thành câu đầy đủ: "Mở lúc 20:30 ngày 14/02/2027, giờ Việt Nam". Cách này
  lệch khỏi ví dụ trong brief nhưng giữ đủ thông tin.
- **Thay:** bộ card bo tròn giống nhau có bóng xám → hiện vật không có hộp chứa:
  ảnh có passe-partout, chữ nằm thẳng trên giấy.
- **Bỏ:** mũi tên "→" nối vào chữ CTA, font mono cho nhãn dữ liệu.

---

## 5. Đặc tả từng màn

### 5.1 Header (mọi trang đã đăng nhập)

- Capsule nổi, cao 56 px, cách mép trên 12 px cộng `env(safe-area-inset-top)`.
- Trái: dấu niêm phong nhỏ chứa trái tim, rồi "Điều Em Yêu".
- Giữa: Bộ sưu tập, Hành trình, Hộp thư. Trạng thái active: chữ Bordeaux đậm và
  một gạch 2 px màu rose bên dưới. Có `aria-current="page"`.
- Phải: Quản trị (chỉ Owner), avatar và tên hiển thị. Tên dài bị cắt ở 12 ký tự,
  có `title` đầy đủ.
- Nền `--color-paper` 78% + blur 12 px. Chữ luôn đạt 4,5:1 vì nền đủ đặc, kể cả
  khi nằm trên ảnh bìa.
- Mobile: dấu + tên + nút menu 44×44. Menu mở thành tấm phủ toàn chiều ngang,
  focus vào mục đầu, Esc đóng và trả focus về nút.

### 5.2 Trang chủ — bìa của cuốn nhật ký đang viết

**Tác vụ chính:** vào bộ sưu tập (tìm, lọc, xem). **Dấu ấn:** Living Cover (mục 6.1).

Hai trạng thái:

- **Tổng quan** (không có `category`, `q`): Bìa → Lối vào → "Hôm nay" (có điều kiện)
  → Bộ sưu tập.
- **Đang lọc/tìm:** bỏ bìa, lối vào và "Hôm nay"; trang mở thẳng vào đầu chương
  hoặc kết quả tìm kiếm. Người đang tìm không phải cuộn qua phần trang trí.

Desktop 1280:

```
┌─ header capsule ──────────────────────────────────────────────┐
│                                                               │
│  Có những ngày,                    ┌──────────────────────────┤ ← ảnh tràn
│  mình muốn giữ lại mãi.            │                          │   mép phải,
│  (cover, cột 1–5)                  │   ẢNH CHƯƠNG MỚI NHẤT     │   cột 6–12
│                                    │   (tỷ lệ 4:5 → 5:4 tùy   │   + bleed
│  ─────                             │    chiều cao màn hình)    │
│  Buổi sáng ở Tam Đảo   ← nhãn      │                          │
│  14 tháng 3, 2026                  │                          │
│  Chương 7 trong Hành trình         └──────────────────────────┤
│  Đọc chương này                                               │
│  │  ← sợi chỉ                                                 │
├──┼────────────────────────────────────────────────────────────┤
│  │ Bộ sưu tập          Hành trình           Hộp thư           │
│  │ Những điều muốn     Đọc lại từng         Gửi một chút hôm  │
│  │ cùng nhau thử       chương               nay đến ngày mai  │
│  │ 24 điều             7 chương             3 lá thư đã mở    │
├──┴────────────────────────────────────────────────────────────┤
│  Ngày này năm ấy  /  Một lá thư vừa đến ngày mở  (có điều kiện)│
├───────────────────────────────────────────────────────────────┤
│  Một hôm nào đó, mình cùng đi nhé          [ô tìm kiếm      ] │
│  Mục lục chương (số, tên, mô tả, số điều)  │ ảnh xem trước   │ │
│  ...                                                          │
│  Mới lưu gần đây: gợi ý nổi bật + lưới hiện vật + phân trang  │
└───────────────────────────────────────────────────────────────┘
```

Mobile 390, theo thứ tự đọc: câu mở đầu → ảnh (tràn hai mép, 4:5) → nhãn → "Đọc
chương này" → ba lối vào xếp dọc thành danh sách có hairline → "Hôm nay" → tìm
kiếm → mục lục → danh sách.

**Lối vào:** ba cột bằng nhau, không có hộp. Mỗi cột có tên phân hệ (PJS 21), một
dòng giọng văn và số lượng thật (tabular). Toàn bộ cột là một liên kết; hover gạch
chân tên; focus có vòng rõ. Số lượng lấy từ dữ liệu người xem được phép thấy:
tổng item hiển thị, số chương đã công khai, số thư **đã mở**. Không bao giờ đếm thư
đang niêm phong.

**"Hôm nay"**, chỉ một ô, ưu tiên theo thứ tự:

1. Một thư có `opens_at` trong 7 ngày gần nhất: tiêu đề, người viết, "Mở lúc…",
   nút "Đến hộp thư".
2. Một chương có `occurred_on` trùng ngày và tháng hôm nay ở năm trước: "Ngày này
   năm ấy", nhãn chương, liên kết.
3. Không có gì thì không hiển thị ô này.

Ngày "hôm nay" tính theo `Asia/Ho_Chi_Minh` ở server.

**Bộ sưu tập (tổng quan):**

- Tiêu đề section "Một hôm nào đó, mình cùng đi nhé". Tên chức năng "Bộ sưu tập"
  vẫn là nhãn của ô tìm kiếm và mục điều hướng.
- Ô tìm kiếm là control pill, cao 48, có nút xóa và nút "Tìm". Bỏ gợi ý `⌘K` vì
  chưa có phím tắt đó.
- **Mục lục chương:** mỗi dòng có số chương (theo `sort_order`), tên (PJS 24), mô tả
  một dòng, số điều. Desktop: cột ảnh xem trước cố định bên phải đổi theo dòng
  đang hover **hoặc focus**. Ảnh lấy từ `cover_image_url`, nếu trống thì dùng ảnh
  item đầu tiên. Mobile và thiết bị chạm: ảnh thu nhỏ 56×70 nằm ngay trong dòng,
  không phụ thuộc hover. Bấm dòng → `/?category=<slug>#collection`.
- **Mới lưu gần đây:** trang 1 của toàn bộ item. Gợi ý nổi bật (item đầu), sau đó
  lưới hiện vật và phân trang (mục 5.3).

### 5.3 Catalogue — danh sách

**Tác vụ chính:** tìm và mở một điều muốn thử.

- **Mở chương** (khi có `category`): số chương, tên chương (display), mô tả, số
  điều. Nếu có `cover_image_url`: ảnh tràn chiều ngang, tỷ lệ 21:9 trên desktop,
  4:3 trên mobile.
- **Hàng chip chương**, cuộn ngang được trên mobile, có `aria-current`. Nhãn chip là
  tên danh mục thật. Đây là bộ lọc, nên tên phải rõ nghĩa.
- **Gợi ý nổi bật** (trang 1): trải hai cột. Ảnh 7 cột có passe-partout, chữ 5 cột
  gồm nhãn lưu trữ, tóm tắt (Inter 16), giá tham khảo, liên kết "Xem chi tiết".
- **Lưới hiện vật:** 3 cột desktop, 2 cột tablet, 1 cột dưới 480 px (390 px vẫn là
  1 cột để giữ ảnh đủ lớn). Mỗi hiện vật: ảnh 4:5 có passe-partout, tên (PJS 18),
  tóm tắt 2 dòng, giá. **Không có hộp card.** Toàn bộ khối là một liên kết. Hover:
  bóng tăng nhẹ và tên gạch chân trong 160 ms.
- Thứ tự ổn định theo thứ tự server trả về. Không masonry, không đổi vị trí khi
  thao tác.
- **Phân trang:** "Trang 2 trên 5", liên kết Trước/Sau và số trang, cao 44 px. Giữ
  `ViewTransition` hiện có cho chuyển trang.
- **Quay lại đúng ngữ cảnh:** liên kết item mang `?back=<đường dẫn catalogue hiện
  tại>`. Trang chi tiết chỉ chấp nhận đường dẫn tương đối bắt đầu bằng `/` và
  không bắt đầu bằng `//`, để tránh open redirect; nếu không hợp lệ thì về
  `/?category=<danh mục của item>#collection`.
- **Trạng thái cá nhân trên danh sách:** cần đọc thêm `user_item_states` của
  người xem. Đây là phạm vi bổ sung (chặng 4b): không đổi schema, chỉ thêm
  reader/use case. Chưa có thì danh sách không hiện trạng thái.

### 5.4 Catalogue — chi tiết

**Tác vụ chính:** quyết định cùng nhau có thử không, và ghi lại cảm nhận.

Nhịp: ảnh → câu chuyện → thông tin thực tế → tương tác thành viên.

- Desktop: cột trái 7 cột chứa ảnh chính (passe-partout, 4:5, sticky khi cuộn qua
  câu chuyện), dải ảnh phụ bên dưới, bấm ảnh mở dialog ảnh đầy đủ. Cột phải 5 cột:
  nhãn lưu trữ (tên, chương, giá tham khảo), câu chuyện (Literata), rồi **khối
  thông tin thực tế**: địa chỉ, liên kết bản đồ, menu, shop, đánh giá ngoài kèm
  nguồn. Liên kết là dòng chữ có icon, cao ≥ 44 px, mở tab mới, có nhãn "(mở trang
  ngoài)" cho trình đọc màn hình.
- **Tương tác thành viên**, section riêng, rộng hết lưới:
  - **Của bạn:** năm trạng thái dạng radio group: Muốn thử, Đã thử, Muốn mua, Đã
    mua, Không quan tâm. Mỗi trạng thái có icon riêng và chữ. Nút Yêu thích là nút
    toggle độc lập (`aria-pressed`). Ghi chú cá nhân. Giữ nguyên ý nghĩa và giá trị
    enum.
  - **Cảm nhận của mọi người:** mỗi thành viên một dòng: avatar, tên, 1–5 sao (sao
    + số, ví dụ "4 trên 5"), lời nhắn bằng Literata. Không gộp thành một điểm trung
    bình chung.
  - **Bình luận:** dạng trò chuyện; tên và thời gian trên mỗi lời; tác giả sửa/xóa
    lời của mình; Owner chỉ có "Gỡ".
- Mobile: ảnh → nhãn → liên kết thực tế (đưa lên sớm để dễ tìm đường) → câu chuyện
  → tương tác.

### 5.5 Hành trình — đọc lại từng chương

**Tác vụ chính:** đọc một chương và để lại hồi đáp. **Dấu ấn:** Memory Thread (6.2).

- Đầu trang, ngắn: "Chuyện hôm ấy, mình vẫn nhớ" và số chương.
- Desktop: cột 1–3 sticky chứa mục lục chương trên sợi chỉ; cột 5–11 là vùng đọc.
- Thứ bậc mỗi chương: ngày (nhãn, tabular) → tiêu đề (display) → câu chuyện
  (Literata 18, 66ch) → ảnh (3:2, passe-partout, có thể mở rộng tới cột 12) →
  chiêm nghiệm (Literata italic 21, hairline rose bên trái, không icon ngoặc kép)
  → hồi đáp.
- Hồi đáp: danh sách trò chuyện, avatar 32 px, tên, thời gian, nội dung Literata
  16. Ô viết cuối danh sách. Quyền sửa/xóa giữ nguyên.
- Cuối chương: "Chương trước" và "Chương sau", mỗi liên kết có tên chương.
- Mobile: bỏ cột mục lục. Đầu vùng đọc có bộ chọn gọn "Chương 3 trên 7" dạng
  disclosure, mở ra danh sách chương. Không cuộn ngang. Liên kết trước/sau ở cuối.
- Giữ `?chapter=<id>`, giữ tự chọn chương đầu khi thiếu tham số, giữ
  `scroll={false}`. Đổi chương thì cross-fade 280 ms qua `ViewTransition`, focus
  chuyển tới tiêu đề chương.
- Chương không có ảnh: bỏ khối ảnh, không chèn placeholder.
- Empty: "Hành trình đang chờ chương đầu tiên." Owner thấy nút "Viết chương đầu
  tiên"; member thấy câu "Chương đầu tiên sẽ xuất hiện ở đây khi được viết."

### 5.6 Hộp thư — nghi thức nhận một lời nhắn đúng lúc

**Tác vụ chính:** mở thư đã đến ngày; viết và hẹn thư mới. **Dấu ấn:** Letter
Ritual (6.3).

- Đầu trang: "Gửi một chút hôm nay đến ngày mai", một câu giải thích, và **một**
  nút chính "Viết một lá thư". Bỏ ô thống kê.
- **Tab** (`role="tablist"`, trạng thái lưu ở `?tab=`):
  - "Hòm thư chung": thư đã mở, không kèm số thư đang niêm phong.
  - "Thư tôi đã hẹn (n)": n là số thư **của chính người xem**; tab chỉ hiện khi
    n > 0 hoặc khi người xem đang ở tab đó.
- **Hòm thư chung:** danh sách dọc kiểu giá thư. Mỗi thư là một phong bì dẹt,
  radius 2 px, có đường nắp gấp và dấu niêm phong nhỏ. Trên phong bì: tiêu đề, "Từ
  <tên>", "Mở lúc 20:30 ngày 14/02/2027". Thư đã đọc trên thiết bị này hiện dấu đã
  tách. Tìm theo tiêu đề và phân trang giữ nguyên.
- **Thư tôi đã hẹn:** mỗi dòng có tiêu đề, "Mở lúc … giờ Việt Nam", thời gian còn
  lại ("còn 138 ngày", "còn 5 giờ 20 phút", tabular), và nút Sửa, Xóa. Xóa cần xác
  nhận tại chỗ. `FutureLetterRefresh` vẫn làm mới trang khi tới giờ.
- **Form viết** (dialog toàn màn hình trên mobile, tấm rộng 720 px trên desktop):
  - Tiêu đề; nội dung (textarea Literata 18, cao tối thiểu 12 dòng); ảnh (URL + mô
    tả ảnh, bắt buộc mô tả khi có URL, giữ quy tắc hiện tại); liên kết bài hát.
  - **Ngày và giờ đặt cạnh nhau**, ngay bên phải là nhãn cố định "Giờ Việt Nam
    (GMT+7)". Dưới đó là dòng xem trước sống: "Thư sẽ mở lúc 20:30 ngày 14/02/2027,
    giờ Việt Nam."
  - Ngay trên nút: "Đến giờ hẹn, thư sẽ xuất hiện trong hòm thư chung và không thể
    chỉnh sửa hoặc xóa bởi người viết."
  - Nút "Hẹn ngày mở"; thông báo sau khi lưu: "Đã hẹn ngày mở". Lỗi hiện ngay dưới
    trường sai.
- Empty hòm thư chung: "Chưa có lá thư nào đến ngày mở." cùng nút "Viết một lá
  thư". Không icon trái tim.

### 5.7 Không khí theo mùa và màn bảo trì

- Theo 4.9. Không thêm Three.js mới trừ khi được yêu cầu; không khí là CSS tĩnh.
- Màn bảo trì: nền theo preset đích, tiêu đề "Không gian đang được thay áo mới", một
  câu về thời gian ("Trang sẽ quay lại sau khoảng 1–2 phút"), và nút "Tải lại"
  thay cho thanh đo giả. Không thêm màn chờ khi chuyển trang.

### 5.8 Admin

Cùng token, mật độ cao hơn, học nguyên lý của Linear.

- Chrome trung tính: nền giấy, không dùng Bordeaux cho khung. Bordeaux chỉ cho nút
  lưu và mục đang chọn.
- Tab workspace: Bộ sưu tập, Hành trình, Thư hẹn, Không khí. Gạch dưới cho mục
  active, không dùng pill đậm.
- Trạng thái nội dung: **Nháp** là viền đứt + chữ "Nháp"; **Công khai** là chấm
  olive + chữ "Công khai". Không chỉ dùng màu.
- Form: nhãn phía trên, trợ giúp dưới trường, lỗi ngay tại trường
  (`aria-describedby`), nút lưu cố định cuối form trên mobile.
- Bảng/danh sách: hàng cao 48, cột căn trái, số liệu tabular.
- Chủ đề: thẻ preset hiển thị mẫu nền, chữ và hành động thật từ token. Ba thao tác
  tách biệt: "Kích hoạt ngay", "Lên lịch", và **"Xem thử"**. "Xem thử" chỉ áp token
  lên một khung mẫu trong trang, không đổi site. Nếu picker hiện tại chưa có "Xem
  thử" thì đây là phạm vi bổ sung, cần xác nhận khi viết plan.
- Thư hẹn: phụ thuộc quyết định ở mục 7.

### 5.9 Đăng nhập, từ chối truy cập, trạng thái phụ

- **Đăng nhập:** nền giấy ngà. Bên trái: "Điều Em Yêu" cỡ cover và câu "Một không
  gian riêng, chỉ dành cho những người được mời." Bên phải: nút Google theo hướng
  dẫn nhận diện (nền trắng, logo G màu, chữ "Đăng nhập bằng Google"). Lỗi OAuth hiện
  ngay dưới nút, có "Thử lại". Mobile: xếp dọc.
- **Từ chối truy cập:** "Tài khoản này chưa được mời vào không gian." Nút "Đăng xuất
  để dùng tài khoản khác" và câu "Nếu bạn nghĩ đây là nhầm lẫn, hãy nhắn cho người
  đã mời bạn." Không hiện tên, số lượng hay email thành viên.
- **Loading:** skeleton theo đúng khung sẽ hiện (nhãn, ảnh 4:5), tông tĩnh.
- **Error** (`error.tsx`): nói điều gì không tải được, nút "Thử lại"
  (`reset()`), liên kết về trang chủ.
- **Disabled:** độ mờ 50% cộng `cursor: not-allowed`; lý do đặt cạnh nếu có.
- **Chữ dài:** tên thành viên cắt một dòng kèm `title`; tiêu đề hiện vật tối đa 3
  dòng trong lưới; tiêu đề thư ngắt từ an toàn (`overflow-wrap: anywhere`).
- **Focus:** vòng 2 px Bordeaux, offset 3 px, trên mọi phần tử tương tác.

---

## 6. Ba dấu ấn sáng tạo

### 6.1 Living Cover

- **Dữ liệu:** chương hành trình công khai có ảnh, chọn chương mới nhất theo
  `occurred_on` (thiếu thì theo `sort_order` cuối cùng). Cần `imageUrl`,
  `imageAltText`, `title`, `dateLabel`, số thứ tự chương. Nếu không có chương có
  ảnh: dùng item nổi bật có ảnh, với nhãn "Trong bộ sưu tập" và tên chương
  catalogue. Nếu cũng không có: **bìa chữ**, chỉ câu mở đầu cỡ lớn trên giấy cùng
  ba lối vào. Không bịa ngày hay tên.
- **Desktop:** như sơ đồ 5.2. Ảnh cao tối đa `min(78svh, 760px)`.
- **Mobile:** câu mở đầu → ảnh tràn hai mép → nhãn. Ảnh 4:5, tối đa 70svh.
- **Trạng thái:** có ảnh chương / có ảnh item / chỉ chữ / ảnh lỗi (chuyển sang bìa
  chữ, giữ nhãn).
- **Bàn phím:** "Đọc chương này" là liên kết thứ hai trong thứ tự tab, sau skip
  link và header. Ảnh không nhận focus riêng.
- **Chuyển động:** lần tải đầu, ảnh "hiện hình" (opacity 0→1, scale 1,02→1, 640 ms)
  và sợi chỉ vẽ xuống (stroke-dashoffset, 600 ms, trễ 120 ms). Chỉ một chuỗi, không
  lặp khi chuyển bộ lọc. Reduced motion: hiện ngay.
- **Triển khai nhẹ nhất:** một Server Component `LivingCover` nhận read model đã
  chọn sẵn từ `page.tsx`; chuyển động bằng CSS `@starting-style`/keyframe, không
  cần JS. Cần một use case đọc mới, hoặc mở rộng `listVisibleTimelineChapters` để
  trả `occurredOn`. Đây là thay đổi read model ở tầng application/infrastructure,
  không đổi schema.

### 6.2 Memory Thread

- **Dữ liệu:** `TimelineChapterPreview` (id, dateLabel, title, sortOrder) đã có sẵn.
- **Desktop:** trục dọc 1 px `--color-rose` ở cột 1–3. Mỗi chương là một nút 8 px
  trên trục, bên cạnh là số chương (tabular, PJS), ngày và tiêu đề hai dòng. Nút
  active: đĩa Bordeaux 10 px và chữ đậm. Mục lục sticky, cuộn riêng nếu dài hơn màn
  hình. Trang chủ dùng lại cùng thành phần ở dạng ngắn (đường nối nhãn bìa tới lối
  vào).
- **Mobile:** disclosure "Chương 3 trên 7: <tên>"; khi mở, cùng danh sách trên sợi
  chỉ, chiều dọc.
- **Trạng thái:** chương active, chương khác, một chương (ẩn trục, chỉ hiện nhãn),
  không chương (empty state).
- **Bàn phím:** danh sách là `<ol>` các liên kết; mũi tên lên/xuống không bắt buộc.
  Tab tuần tự, `aria-current="page"` cho chương đang đọc.
- **Không bao giờ** tô đầy sợi chỉ theo tiến độ đọc hay hiển thị phần trăm.
- **Reduced motion:** không cross-fade khi đổi chương.
- **Triển khai nhẹ nhất:** CSS thuần (`border-left` + pseudo-element cho nút), không
  cần SVG. Không cần JS ngoài `Link`.

### 6.3 Letter Ritual

- **Điều kiện:** chỉ diễn ra sau khi server trả nội dung qua
  `getOpenedFutureLetterAction` (lọc `opens_at <= now` phía server). Đồng hồ client
  không quyết định quyền.
- **Nhịp (≈ 1000 ms):** bấm "Mở thư" → phòng đọc phủ xuống, nền chuyển sang
  `--color-night` 92% (200 ms) → dấu niêm phong tách hai nửa, xoay ±8° (280 ms) →
  nắp phong bì lật lên (rotateX, 280 ms) → tờ thư trượt lên và phóng lớn thành vùng
  đọc, ánh vàng ấm lan nhẹ quanh mép giấy (240 ms).
- **Vùng đọc:** tờ giấy vellum tối đa 680 px trên nền đêm; tiêu đề PJS, "Từ <tên>,
  mở lúc …", nội dung Literata 18/1,75, ảnh passe-partout, liên kết bài hát (không
  tự phát). Nút "Đóng" cố định góc trên.
- **Bỏ qua:** nút "Bỏ qua" hiện từ 0 ms; Esc, Enter hoặc bấm vào vùng phủ đều nhảy
  thẳng tới trạng thái đọc.
- **Đọc lại:** nếu thư đã mở trên thiết bị này, bỏ qua nghi thức và vào thẳng vùng
  đọc. Lưu bằng `localStorage` (danh sách id thư đã xem nghi thức), bọc try/catch.
  Đây là trạng thái giao diện thuần túy, không mang nghĩa nghiệp vụ "đã đọc"; mất
  dữ liệu chỉ làm nghi thức phát lại.
- **Trợ năng:** dialog có `aria-modal`, focus trap, focus vào tiêu đề thư khi vào
  vùng đọc, trả focus về phong bì khi đóng. Có thông báo `aria-live` "Đang mở thư"
  trong lúc tải.
- **Reduced motion:** không nghi thức; mở thẳng vùng đọc trên nền đêm.
- **Lỗi:** không tải được thì phong bì giữ nguyên, hiện "Chưa mở được thư này. Thử
  lại" ngay dưới phong bì. Không mở vùng đọc rỗng.
- **Mobile:** vùng đọc chiếm toàn màn hình, nút Đóng tránh safe area.
- **Triển khai nhẹ nhất:** dùng lại `FutureLetterOpeningCard` và các phase hiện có
  (`sealed → unsealing → revealing → opened`). Chuyển phần hiển thị sang một
  `<dialog>` và CSS keyframe; không thêm dependency.

---

## 7. Quyền riêng tư và mâu thuẫn cần giải quyết

### 7.1 Bất biến được giữ

- Người không phải tác giả không nhận được bất kỳ dữ liệu nào của thư chưa mở:
  không trong HTML, payload RSC, cache, URL ảnh hay số đếm.
- Trang chủ, "Hôm nay" và lối vào chỉ đếm và hiển thị thư đã mở.
- Mọi đọc dữ liệu vẫn qua use case và RLS; không lọc quyền ở client.
- Không đổi schema. Mọi đổi policy phải được duyệt riêng (mục 7.2).

### 7.2 Mâu thuẫn: Owner và thư đang niêm phong

- **Brief mới:** "Tuyệt đối không hiển thị cho người khác phong bì, tên tác giả,
  tiêu đề, đếm ngược hoặc số lượng thư còn niêm phong… Không tự suy diễn Owner có
  quyền đọc trước thư niêm phong; giữ chính sách đã xác nhận."
- **Chính sách đã xác nhận** (`2026-07-24-future-letter-opening-admin-design.md`,
  dòng 50–51, migration `docs/migrations/2026-07-24-owner-manage-future-letters.sql`):
  Owner "có thể đọc và gỡ mọi thư, kể cả sau giờ mở". Policy SELECT có thêm
  `or (select private.is_owner())`.
- **Thực tế trong mã:**
  - `/admin/thu-hen-ngay-mo` hiển thị cho Owner tiêu đề, tên tác giả, thời điểm mở
    và số lượng "đang hẹn" của **mọi** thư đang niêm phong.
  - `SupabaseFutureLetterReader.listManaged()` chọn cả `content`, `image_url`,
    `music_url`. Toàn bộ nội dung thư niêm phong được tuần tự hóa vào props của
    Client Component `AdminFutureLetters`, dù giao diện không hiển thị.

Như vậy chính sách hiện hành cho phép đúng điều brief mới cấm. Cần người dùng chọn:

- **Phương án A (đề xuất):** Owner là thành viên bình thường với thư chưa mở. Đưa
  policy SELECT và DELETE của Owner về chỉ thư đã mở (cần migration, cần duyệt
  riêng). Admin thư chỉ quản lý thư đã mở. Owner vẫn thấy thư chưa mở **của chính
  mình** trong "Thư tôi đã hẹn".
- **Phương án B:** giữ quyền gỡ thư chưa mở, nhưng Owner chỉ thấy thư được báo cáo.
  Cần luồng báo cáo và dữ liệu mới; ngoài phạm vi redesign.
- **Phương án C:** giữ chính sách hiện hành. Giao diện Owner vẫn hiện metadata thư
  chưa mở, chấp nhận lệch khỏi brief.

**Việc làm được ngay dù chọn phương án nào (không cần migration):** `listManaged`
không chọn `content`, `image_url`, `music_url` cho thư chưa mở. Đây là tối thiểu
hóa dữ liệu ở tầng infrastructure, có test.

---

## 8. Component và kế hoạch theo chặng

### 8.1 Component

**Tạo mới** (`src/components/ui/` hoặc `presentation/` của feature tương ứng):

| Component | Vai trò |
| --- | --- |
| `ArchiveLabel` | Nhãn lưu trữ xếp chồng (tiêu đề, ngày, nguồn gốc) |
| `MattedImage` | Ảnh hiện vật có passe-partout, tỷ lệ cố định, trạng thái thiếu/lỗi, mở ảnh đầy đủ |
| `MemoryThread` | Trục sợi chỉ + danh sách chương (desktop), disclosure (mobile) |
| `WaxSeal` | Dấu niêm phong (tĩnh, tách đôi) |
| `LivingCover` | Bìa trang chủ (Server Component) |
| `HomeEntrances` | Ba lối vào kèm số lượng thật |
| `TodayNote` | Ô "Hôm nay" có điều kiện |
| `CatalogueChapterIndex` | Mục lục chương có ảnh xem trước (hover + focus + touch) |
| `ArchiveObject` | Hiện vật trong lưới (thay `CatalogueItemCard`) |
| `LetterEnvelope` | Phong bì trong giá thư |
| `LetterReadingRoom` | Dialog đọc thư, nền Blue Hour, nghi thức |
| `MailboxTabs` | Tab hòm thư chung / thư tôi đã hẹn |

**Chỉnh:** `tokens.css`, `themes.css`, `base.css`, `typography.css`, `motion.css`,
`globals.css` (`@theme`, xóa keyframe luxury, sửa `---slow`); `layout.tsx` (thêm
Literata nếu duyệt); `app-header.tsx`; `button.tsx`; `section-header.tsx`;
`catalogue-home.tsx`; `catalogue-search.tsx`; `catalogue-chapter-rail.tsx`;
`catalogue-pagination.tsx`; `catalogue-featured-item-card.tsx`;
`catalogue-detail*.tsx`; `catalogue-engagement-panel.tsx`;
`relationship-timeline.tsx`; `timeline-chapter-reader.tsx`;
`timeline-response-panel.tsx`; `future-letters-experience.tsx`;
`future-letter-opening-card.tsx`; `future-letter-composer.tsx`;
`scheduled-letter-list.tsx`; `theme-atmosphere.tsx`;
`theme-maintenance-screen.tsx`; `magical-login-client.tsx`;
`access-denied/page.tsx`; các file `loading.tsx` và `error.tsx`; các component
admin (chỉ token và trạng thái).

**Gỡ khỏi trang chủ** (tùy quyết định D2): `CinematicDiaryIntro`,
`cinematic-diary-scene.ts`, `cinematic-diary-geometry.ts` cùng test và CSS;
`CatalogueChapterBand`; `TimelineFilmControls`, `TimelineChapterPreview` (thay bằng
`MemoryThread`); `magical-background.tsx`.

### 8.2 Chặng triển khai

Mỗi chặng kết thúc với lint, test và build xanh. Các tác vụ cốt lõi (tìm, lọc, phân
trang, đánh giá, hồi đáp, hẹn/mở thư) chạy được sau mọi chặng.

0. **Nền móng:** token màu/type/radius/motion, font, grain, preset `bordeaux` thật,
   header, `Button`, primitive (`ArchiveLabel`, `MattedImage`, `WaxSeal`). Sửa lỗi
   link chương (test trước). Tối thiểu hóa `listManaged` (test trước).
1. **Trang chủ:** read model bìa và "Hôm nay" (test use case trước), `LivingCover`,
   `HomeEntrances`, `TodayNote`, mục lục chương, lưới hiện vật, `?back=` (test hàm
   kiểm tra đường dẫn trước). Gỡ intro nếu D2 được duyệt.
2. **Hành trình:** `MemoryThread`, vùng đọc, chương trước/sau, bộ chọn mobile.
3. **Thư:** tab, giá thư, `LetterReadingRoom` và nghi thức, form, danh sách đã hẹn.
   Áp phương án đã chọn ở mục 7.2.
4. **Các màn còn lại:** chi tiết catalogue và tương tác, đăng nhập, từ chối truy
   cập, loading/error/empty, admin, 4 preset mùa. Chặng 4b (tùy chọn): trạng thái cá
   nhân trên danh sách.
5. **Xác minh bàn giao:** mục 9.

Plan chi tiết từng bước sẽ được viết sau khi đặc tả được duyệt, theo
`docs/superpowers/plans/`.

---

## 9. Kiểm thử và xác minh

- **Unit (Vitest, TDD):** hàm kiểm tra `?back=`; đường dẫn chương catalogue; chọn
  dữ liệu bìa (chương có ảnh / item / chữ); chọn "Hôm nay" theo giờ Việt Nam, kể cả
  ranh giới nửa đêm; `listManaged` không trả nội dung thư chưa mở; định dạng
  "Mở lúc …" và đếm ngược; `localStorage` nghi thức hỏng không làm vỡ trang.
- **Component:** `MemoryThread` đặt `aria-current` đúng; `LetterReadingRoom` có
  focus trap, Esc, "Bỏ qua" và reduced motion; `CatalogueChapterIndex` hiện ảnh xem
  trước khi focus.
- **Quyền (theo từng vai trò: anonymous, member không được phép, member, owner):**
  truy cập trang; thư chưa mở của người khác không có trong HTML hay payload của
  `/`, `/thu-hen-ngay-mo`, `/admin/thu-hen-ngay-mo`; tác giả không sửa/xóa được sau
  giờ mở; rating, bình luận, trạng thái chỉ sửa được của mình.
- **Bắt buộc trước bàn giao:** `npm run test`, `npm run lint`, `npm run build`.
- **Browser QA** ở 320, 360, 390, 768, 1024, 1280, 1440 px: chữ tràn, chồng lấn,
  ảnh, hover, focus, reduced motion, tên và tiêu đề dài, dấu tiếng Việt. Cần phiên
  đăng nhập mới: người dùng chạy `npm run auth:save`.
- **Hiệu năng:** đo Lighthouse (lab) trên `/` và `/hanh-trinh` với build
  production. Chỉ báo đạt LCP ≤ 2,5 s, CLS ≤ 0,1 nếu có số đo; ghi rõ là số lab.
  INP cần đo tương tác thực tế và sẽ báo là chưa đo nếu không có dữ liệu.

---

## 10. Phạm vi mở rộng (không nằm trong redesign)

Cần dữ liệu, API hoặc migration mới:

- Trạng thái cá nhân và nút lưu nhanh trên danh sách item (reader mới, không đổi
  schema; chặng 4b nếu được duyệt).
- Theo dõi "đã đọc" thư trong database thay cho `localStorage`.
- Một hiện vật thuộc nhiều chương (kiểu Are.na): bảng nối mới.
- Bản đồ kỷ niệm, playlist đồng bộ, gợi ý hẹn hò bằng AI, thông báo đẩy.
- Cấu hình "không gian hai người" để bật lời văn riêng cho hai người.

---

## 11. Quyết định cần duyệt

- **D1.** Duyệt hướng Living Archive và design system ở mục 4.
- **D2.** Gỡ màn mở đầu Three.js khỏi trang chủ, thay bằng Living Cover (đề xuất),
  hay giữ nó ở vị trí khác.
- **D3.** Thêm Literata cho "chữ của người" (đề xuất), hay chỉ dùng Inter.
- **D4.** Phương án cho Owner và thư chưa mở (mục 7.2); phương án A cần migration
  RLS, được duyệt riêng.
- **D5.** `noel` thành chủ đề tối Blue Hour (cần quét màu cứng), hay giữ sáng ở giai
  đoạn này.
