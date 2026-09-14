# Kế hoạch thống nhất giao diện và phát triển trang chủ `/`

Ngày: 14/09/2026.

**Trạng thái:** Đề xuất thiết kế và lộ trình để người dùng duyệt. Chưa triển khai code.
Người dùng đã chọn **giữ nhật ký 3D, rút gọn phần mở đầu** trong cuộc hội thoại
ngày 14/09. Các quyết định còn lại dưới đây là đề xuất, chưa được coi là đã duyệt.

**Mục tiêu:** Trang chủ có một ngôn ngữ xuyên suốt từ phần mở sách đến nội dung:
giấy ngà, Bordeaux, typography biên tập, bố cục có nhịp và chuyển động tiết chế.
Nền tảng này được tái sử dụng khi làm những màn tiếp theo.

**Cơ sở:** Đọc mã nguồn trong working tree, kể cả thay đổi chưa commit, đối chiếu
`docs/product-direction.md` và thiết kế `2026-09-04-quiet-editorial-home-design.md`.
Đây là đánh giá từ mã nguồn; chưa có browser QA mới cho trạng thái hiện tại.
Ảnh QA và báo cáo test trong tài liệu cũ không phải bằng chứng cho lần làm này.

## 1. Chẩn đoán hiện trạng

| Điểm cần xử lý | Bằng chứng trong mã hiện tại | Hệ quả / việc cần làm |
| --- | --- | --- |
| Phần mở đầu và nội dung khác chất liệu | `src/app/styles/components/cinematic-diary.css:6` dùng intro `200svh`; `:16` dùng nền Bordeaux tối; card trong `catalogue-item-card.tsx` dùng nền trong, blur và shadow | Cần thiết kế lại đoạn nối giữa intro và nội dung, cùng một hệ surface |
| Điều hướng xuất hiện sau phần mở đầu | `src/features/catalogue/presentation/catalogue-home.tsx:54` đặt intro trước header | Cần lối vào bộ sưu tập và các màn khác sớm hơn |
| Khổ bố cục không thống nhất | `app-header.tsx` dùng `max-w-4xl`, search dùng `max-w-2xl`, trong khi `tokens.css` đặt `--content-max: 90rem` | Thống nhất đường canh; chiều rộng ô tìm kiếm là vùng con có chủ đích |
| Đã có thang chữ nhưng trang chủ chưa dùng nhất quán | `tokens.css` và `components/typography.css` có type scale; `catalogue-home.tsx:101`, `:121` vẫn tự đặt size/tracking | Áp dụng type scale vào tiêu đề, card, nhãn và nội dung |
| Grid để lại khoảng trống theo công thức | `catalogue-home.tsx:130` chia span bằng modulo; ba card đầu chiếm `5 + 3 + 3 = 11` trên 12 cột | Bỏ phép chia theo vị trí; dùng grid có cột ổn định |
| Nhiều nhịp hiệu ứng cùng tồn tại | `globals.css` có `luxury-reveal` 800ms; card có transition 500ms; `tokens.css` có cả `--duration-*` và `--motion-*`; route có ViewTransition | Phân vai hiệu ứng; một tương tác chỉ có một chuyển động chính |
| Component nền tảng chưa đi vào trang chủ | `src/components/ui/card.tsx` và `section-header.tsx` đã có, nhưng chưa được trang chủ/card catalogue import | Hoàn thiện và sử dụng component đã có; tránh tạo thêm một bộ tương tự |
| Tìm kiếm hiển thị phím tắt chưa được nối hành vi | `catalogue-search.tsx:83` hiển thị `⌘ K`, component không có keyboard handler | Bỏ gợi ý này trong mốc giao diện; chỉ thêm lại khi có hành vi và test |
| Fallback intro có nguy cơ giấu CTA | `cinematic-diary.css:243` mặc định CTA có `opacity: 0` và `pointer-events: none`; chỉ mở ở phase reading/handoff; reduced-motion chưa có override CTA riêng | Kiểm tra và bảo đảm CTA luôn hiện ở chế độ tĩnh, lỗi WebGL và reduced motion |
| Dữ liệu xem trước chương còn dở | `supabase-catalogue-reader.ts:48` khai báo `Result<any[]>` rồi trả lỗi; test import `list-visible-chapter-previews.ts` nhưng file chưa tồn tại | Hoàn thiện typed read path trước khi nối màn tổng quan chương |

Những phần đã có cần tiếp tục sử dụng: hai font hỗ trợ tiếng Việt; CSS đã tách
file và dùng layer; semantic color tokens; MediaRailControls; tìm kiếm/phân trang
theo URL; server access guard. Không lặp lại các công việc này từ kế hoạch cũ.

Kiểm tra mới ngày 14/09: chạy
`rtk npm run test -- src/modules/catalogue/application/catalogue-use-cases.test.ts`
trả exit code 1: suite không nạp được vì thiếu module
`@/modules/catalogue/application/list-visible-chapter-previews`; chưa có test case
nào được chạy. Đây là lỗi trong working tree có trước khi viết tài liệu này.
Chưa chạy lint/build hoặc browser QA trong lượt lập kế hoạch.

## 2. Lựa chọn hướng làm

| Hướng | Lợi ích | Đánh đổi |
| --- | --- | --- |
| **Hoàn thiện hệ giao diện, rồi áp dụng trọn trang `/` — đề xuất** | Xử lý nguyên nhân rời rạc; có nền tảng tái sử dụng; giới hạn phạm vi | Cần làm cả token, component và nhịp trang, không chỉ đổi CSS vài chỗ |
| Chỉ chỉnh màu và font trên bố cục hiện tại | Khối lượng ban đầu nhỏ | Vẫn còn intro dài, grid lệch và nhiều kiểu card/chuyển động |
| Thiết kế lại đồng thời toàn bộ ứng dụng | Dễ hình dung tổng thể mới | Phạm vi lớn; khó đánh giá từng bước trong workspace đang có nhiều thay đổi |

Chọn hướng đầu tiên. Chia thành hai mốc có thể nghiệm thu riêng:
**A — trang chủ nhất quán** và **B — khám phá theo chương**.

## 3. Ngôn ngữ thiết kế đề xuất

### Màu và chất liệu

Giữ bản sắc Bordeaux Diary. Dùng palette đang có làm điểm xuất phát:

| Vai trò | Màu nền tảng | Quy tắc |
| --- | --- | --- |
| Giấy chính | `#FFF9F3` | Nền nội dung, card nhẹ |
| Nền phụ | `#F4ECE6` | Phân biệt vùng chức năng, không tạo một theme khác |
| Bordeaux | `#650C1C` | Hành động chính, mục đang chọn, điểm nhấn nhận diện |
| Tiêu đề | `#31050C` | Tiêu đề và nhãn quan trọng |
| Nội dung | `#281216` | Chữ đọc dài |
| Chữ phụ | `#6F5B5B` | Mô tả và thông tin phụ, cần kiểm tra contrast ở surface thực tế |
| Đồng ấm | `#A65B45` | Chi tiết nhỏ, đường kẻ, ký hiệu; không phủ toàn bộ CTA/card |

Intro đặt sách Bordeaux trên nền sáng ấm cùng họ màu với nội dung. Độ sâu tập
trung ở chất liệu sách và bóng đổ; phần nền nối xuống bộ sưu tập liên tục.
Card dùng giấy, viền mảnh, shadow nhẹ; loại bỏ blur kính và glow trên card trang chủ.
Theme theo mùa thay giá trị token có kiểm soát, giữ cùng cấu trúc và độ đọc rõ.

### Phông chữ và thứ bậc

- Giữ Playfair Display cho tiêu đề và Be Vietnam Pro cho UI/nội dung.
- Áp dụng type scale hiện có: display cho mở đầu, display-md cho chương,
  title cho card, body/body-sm cho nội dung và metadata.
- Chữ UI chính tối thiểu 14px; body 16px; nhãn nhỏ khoảng 12px.
- Không dùng uppercase và tracking rộng cho mọi nhãn. Đoạn đọc dài tối đa khoảng
  60–65 ký tự mỗi dòng; kiểm tra dấu tiếng Việt khi chữ lớn hoặc italic.
- Chữ trên sách canvas dùng cùng font display, đợi font tải hoặc vẽ lại khi font
  sẵn sàng. Nội dung cốt lõi có bản HTML đọc được trong fallback.
- Có một `h1` cho trang; tiêu đề vùng là `h2`, card nằm trong vùng là `h3`.

### Bố cục

- Đề xuất container nội dung tối đa 1200px cho home; header, utility row và các
  section cùng đường canh. Khi chưa chuyển các màn khác, dùng scope home để
  tránh thay đổi âm thầm toàn ứng dụng.
- Lề ngang: 16px trên mobile nhỏ, 24px trên tablet, 32px trên desktop.
- Dùng một nhịp khoảng cách: 8/12/16/24/32/48/64/96px theo vai trò.
- Card grid: một cột trên mobile, hai cột trên tablet, ba cột desktop;
  featured là một block riêng. Không chia span bằng index modulo.
- Bo góc có vai trò: control gọn, card mềm hơn; không biến mọi thành phần thành pill.
- Ảnh cùng loại dùng cùng tỷ lệ và cách crop; thiếu ảnh có fallback cùng chất liệu.

### Hiệu ứng

- UI: khoảng 160ms cho phản hồi ngắn; 320ms cho chuyển trạng thái, cùng easing.
- Card: nâng tối đa 2px và đổi viền; không tilt 3D, zoom mạnh hoặc glow.
- Bỏ reveal nối đuôi theo từng index. Nội dung không bị giấu để chờ animation.
- Giữ ViewTransition hiện có khi có ích cho đổi kết quả/chuyển chi tiết; không
  thêm route transition mới. Tránh cả page và card cùng chạy hiệu ứng cho một thao tác.
- Three.js + Motion tập trung vào mở sách; giảm trang trí nền chuyển động lặp.
- Reduced motion: nội dung và CTA xuất hiện ngay, không stagger/delay, không
  cần cuộn để mở khóa nội dung. Hover không dịch chuyển khi giảm chuyển động.

## 4. Trang chủ sau refactor

Thứ tự đọc đề xuất:

1. **Header gọn:** nhận diện, Bộ sưu tập, Hành trình, Hộp thư và tài khoản.
2. **Nhật ký 3D:** một điểm mở đầu; lời dẫn ngắn và CTA vào bộ sưu tập.
3. **Thanh khám phá:** chọn chương + tìm kiếm, chung một vùng chức năng.
4. **Nội dung chính:** mốc A giữ featured/grid; mốc B tổ chức thành các chương.
5. **Kết trang nhỏ:** liên kết Hành trình và Hộp thư, cùng chất liệu và typography.

Không thêm thống kê, phản ứng hay nội dung mẫu để lấp bố cục. Hai liên kết cuối
trang dùng route đã có, không cần thêm dữ liệu hoặc quyền truy cập.

### Rút gọn phần mở sách — lựa chọn đã được người dùng xác nhận

- Điểm xuất phát: desktop khoảng `140svh`, mobile khoảng `120svh`, thay cho
  `200svh` / `160svh`; tinh chỉnh bằng browser QA theo tốc độ và cảm giác cuộn thực tế.
- Header/lối vào bộ sưu tập dùng được từ đầu; không cần hoàn tất animation mới
  tìm được điều hướng. CTA “Khám phá bộ sưu tập” hiện rõ từ trạng thái đầu.
- Khi chọn chương, tìm kiếm hoặc phân trang, hiển thị phần nội dung trực tiếp,
  không buộc người dùng đi lại phần mở sách. Back/Forward phục hồi URL và vị trí phù hợp.
- Khi WebGL lỗi hoặc reduced motion bật, dùng sách tĩnh và CTA rõ ràng.
- Giữ hình học mở sách hiện có; chỉ chỉnh staging, palette, typography và lifecycle
  cần thiết. Scene dừng khi ngoài viewport hoặc tab bị ẩn.

### Phát triển thêm: khám phá theo chương

| URL | Cách hiển thị đề xuất |
| --- | --- |
| `/` | Tổng quan: mỗi chương có tên, mô tả, ảnh bìa, số lượng và tối đa 5 preview |
| `/?category=<slug>` | Một chương: tiêu đề chương, featured ở trang đầu, grid và phân trang |
| `/?q=<text>` | Kết quả tìm kiếm dạng grid; không đưa kết quả đầu thành featured |
| `/?category=<slug>&q=<text>` | Tìm trong chương đang chọn; giữ query/category khi đổi trang |
| `/?page=2` và URL phân trang cũ không có bộ lọc | Tiếp tục đọc trang danh sách tất cả qua read path hiện có; có liên kết về tổng quan chương |

Mỗi chương dùng một block có thứ bậc rõ ràng và rail preview có nút trước/sau,
keyboard và touch. Mobile xếp ảnh/mô tả theo chiều dọc; rail cuộn trong vùng riêng.
Số lượng lấy từ dữ liệu được phép đọc, không suy ra từ số preview. Chương rỗng có
thông báo ngắn; không render rail trống. Tổng quan chương không có phân trang item.

## 5. Các giai đoạn triển khai và đầu ra

### Giai đoạn 0 — Chốt hiện trạng và bản thiết kế

- [ ] Ghi nhận diff hiện có, không reset/ghi đè; không tạo commit hoặc branch.
- [ ] Chụp mới `/` sau đăng nhập ở 320, 390, 768, 1024, 1440px, gồm lúc sách đóng,
  mở và vùng catalogue; xác nhận URL chưa bị chuyển về login.
- [ ] Chạy baseline test liên quan, lint, build; phân biệt lỗi có trước với lỗi mới.
- [ ] Lập bản bố cục desktop/mobile và mẫu token/card/header để duyệt toàn mạch.
- [ ] Sau khi thiết kế được duyệt, khép phần use case đang dở để suite catalogue
  nạp được: tạo `src/modules/catalogue/application/list-visible-chapter-previews.ts`
  theo interface/test đã có, kiểm tra actor và giới hạn preview trước khi delegate
  sang reader. Chạy lại suite; chưa nối overview vào UI. Việc này phải xong trước
  nghiệm thu mốc A, còn adapter đọc preview thật thuộc mốc B.

Đầu ra: baseline đáng tin cậy và thiết kế đủ cụ thể để chuyển sang implementation plan.

### Giai đoạn 1 — Hoàn thiện nền tảng giao diện

Files: `src/app/styles/tokens.css`, `src/app/styles/components/typography.css`,
`src/app/styles/components/diary.css`, `src/components/ui/card.tsx`,
`src/components/ui/section-header.tsx`, `src/components/ui/button.tsx`.

- [ ] Chốt surface, type, spacing, radius, shadow và motion; tái sử dụng token hiện có.
- [ ] Hoàn thiện Card/SectionHeader và áp dụng cho một vùng catalogue để đối chiếu.
- [ ] Giới hạn override theo home khi token/component còn phục vụ màn khác.
- [ ] Chỉ bỏ alias hoặc style cũ sau khi xác nhận không còn consumer cần nó.

Đầu ra: cùng một card/tiêu đề/control không còn được viết theo nhiều kiểu.

### Giai đoạn 2 — Ghép lại toàn trang, hoàn thành mốc A

Files: `src/components/app-header.tsx`, `src/app/styles/components/header.css`,
`src/features/catalogue/presentation/catalogue-home.tsx`, `catalogue-chapter-rail.tsx`,
`catalogue-search.tsx`, `catalogue-item-card.tsx`, `catalogue-featured-item-card.tsx`,
`catalogue-pagination.tsx`, `cinematic-diary-intro.tsx`, `cinematic-diary-scene.ts`,
`src/app/styles/components/cinematic-diary.css`, `src/app/styles/motion.css`,
`src/app/globals.css`.

- [ ] Rút ngắn intro; thống nhất nền và chữ; header/CTA dùng được ngay.
- [ ] Ghép chọn chương và search; sửa focus, mục đang chọn và menu mobile.
- [ ] Dùng card/type scale chung, sửa grid và bỏ hiệu ứng chồng lớp.
- [ ] Nối cuối trang với các route Hành trình/Hộp thư; kiểm tra không có link chết.
- [ ] Kiểm tra không replay intro khi thao tác nội dung, không lỗi khi WebGL không có.

Đầu ra: trang `/` nhất quán với chức năng tìm kiếm/lọc/phân trang đang có.

### Giai đoạn 3 — Hoàn thiện khám phá theo chương, mốc B

Files: `src/modules/catalogue/domain/catalogue-read-models.ts`,
`src/modules/catalogue/application/catalogue-reader.ts`,
`src/modules/catalogue/application/list-visible-chapter-previews.ts` (mới),
`src/modules/catalogue/application/catalogue-use-cases.test.ts`,
`src/modules/catalogue/infrastructure/supabase-catalogue-reader.ts`,
`src/lib/backend/create-server-backend.ts`, `src/lib/backend/create-server-backend.test.ts`,
`src/app/page.tsx`, `src/features/catalogue/presentation/catalogue-home.tsx`,
`src/features/catalogue/presentation/catalogue-chapter-band.tsx` (mới),
`src/components/ui/media-rail.tsx` (tái sử dụng).

- [ ] Hoàn thiện adapter cho `CatalogueChapterPreview`, thay hàm khung
  `Result<any[]>`; sử dụng use case đã được khép ở giai đoạn 0.
- [ ] Chọn projection/giới hạn truy vấn từ schema hiện có; ưu tiên batch đọc ảnh
  cho các preview đã chọn. Không tải toàn bộ catalogue không giới hạn để cắt ở client.
- [ ] Đo số truy vấn, payload và thời gian trên dữ liệu thật trước khi chốt adapter.
  Nếu cần RPC/schema mới để đáp ứng thì tách thành đề xuất riêng, giữ mốc A hoạt động.
- [ ] Đăng ký use case ở server backend, phân nhánh overview/category/search ở page.
- [ ] Tạo chapter band bằng component nền tảng và MediaRailControls hiện có.
- [ ] Giữ URL cũ, phân trang 6 item và quy tắc search; xác minh count/preview cùng quyền đọc.

Đầu ra: trang chủ dẫn người dùng đi qua từng chương và tới nội dung chi tiết.

### Giai đoạn 4 — Trạng thái, kiểm thử và nghiệm thu

Files: `src/app/loading.tsx`, `src/app/error.tsx`, các component home đã sửa;
test hành vi đặt cạnh module/component tương ứng; thêm
`tests/e2e/home-cohesion.spec.ts` cho luồng trình duyệt cần bảo vệ.

- [ ] Skeleton theo bố cục mới; phân biệt bộ sưu tập rỗng, chương rỗng, search
  không có kết quả, lỗi tải và ảnh lỗi. Error retry dẫn tới trạng thái dùng được.
- [ ] TDD cho hành vi mới: mode routing, giới hạn preview, access guard, URL state,
  mobile navigation, fallback intro. Dùng browser QA cho tiêu chí thuần thị giác.
- [ ] Chạy test liên quan, `rtk npm run lint`, `rtk next build` và test e2e thực tế.
- [ ] QA đủ 5 viewport; keyboard/focus, menu, ảnh, text dài, hover, reduced motion,
  WebGL unavailable và browser Back/Forward.
- [ ] Kiểm tra bốn vai trò: anonymous, member chưa được phép, active member và owner.
  Không dùng UI render thành công làm bằng chứng RLS.
- [ ] Smoke test các màn dùng chung header/token: chi tiết, Hành trình, Hộp thư,
  login và admin, nhằm phát hiện hồi quy do nền tảng chung.

Đầu ra: ảnh trước/sau, kết quả lệnh thực tế, vấn đề còn lại nếu có và diff trong phạm vi.

## 6. Tiêu chí nghiệm thu

1. Từ intro xuống nội dung cùng họ màu, font và chất liệu; có một điểm nhấn chính.
2. Header, section và grid có đường canh thống nhất; không có ô trống do công thức span.
3. Không tràn ngang toàn trang, cắt dấu tiếng Việt hoặc đè nút ở 320/390/768/1024/1440px.
4. CTA vào catalogue luôn tiếp cận được; fallback không có nội dung quan trọng bị ẩn.
5. Search, category, pagination và Back/Forward giữ đúng trạng thái; tìm kiếm không replay intro.
6. Nội dung/ảnh/số lượng là dữ liệu thật; đủ empty/loading/error và ảnh fallback.
7. Chế độ giảm chuyển động hiển thị nội dung ngay; focus nhìn rõ; mobile menu dùng được bằng bàn phím.
8. Các màn dùng chung component/token không bị hồi quy ngoài ý muốn.
9. Các kiểm tra bắt buộc có kết quả mới; lỗi có trước được ghi rõ và xử lý trong phạm vi phù hợp.

Các tiêu chí focus, animation, nội dung dài và URL state được đối chiếu với
[Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

## 7. Phạm vi và cách tiếp tục

Đợt này tập trung `/` cùng query state và những component dùng để tạo trang đó.
Next.js giữ vai trò UI/server logic; Supabase giữ dữ liệu và quyền. Không đổi
Google OAuth, không seed, migration, RLS hay dashboard; không thêm dependency
runtime cho thay đổi thị giác này. Trạng thái nghiệp vụ mới, nếu đề xuất sau này,
phải có thiết kế database riêng.

Sau khi thống nhất thiết kế toàn trang, dùng `superpowers:writing-plans` để tạo
implementation plan theo từng mốc, dựa trên working tree lúc triển khai. Không
chạy lại nguyên kế hoạch 04/09: nhiều phần đã hoàn thành, nhiều dòng tham chiếu
và baseline trong đó đã lỗi thời. Thực hiện tuần tự trong phiên, không sub-agent.

Thứ tự mở rộng sau khi `/` được nghiệm thu: trang chi tiết catalogue → Hành trình
→ Hộp thư → login/admin. Mỗi màn tái sử dụng nền tảng đã chốt và có phạm vi riêng.
