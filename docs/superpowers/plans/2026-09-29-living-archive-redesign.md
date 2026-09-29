# Living Archive redesign — kế hoạch triển khai

**Đặc tả:** `docs/superpowers/specs/2026-09-29-living-archive-redesign-design.md`
**Duyệt:** người dùng duyệt toàn bộ D1–D5 theo phương án đề xuất ngày 2026-09-29
("Được làm hết cho tôi").

Phạm vi quyết định:

- D1: Living Archive.
- D2: gỡ intro Three.js khỏi trang chủ và gỡ dependency `three`.
- D3: thêm Literata cho chữ của người.
- D4: phương án A. Viết migration SQL vào `docs/migrations/`, **không** tự chạy
  lên Supabase. Code ứng dụng tự lọc thư đã mở để an toàn cả khi migration chưa
  chạy.
- D5: `noel` thành chủ đề tối Blue Hour.

Không commit, không tạo branch.

Baseline 2026-09-29: 20 file test / 54 test pass; lint 20 lỗi có sẵn
(`fix*.js`, `.remember/tmp`, `any` trong test và reader thư).

## Chặng 0 — Nền móng

1. Dọn lint có sẵn: xóa `fix.js`, `fix2.js`, `fix3.js` (script sửa lỗi một lần, đã
   áp dụng); thêm `.remember/**` vào `globalIgnores`.
2. Token: viết lại `tokens.css` (màu, type, radius, độ nổi, motion), `themes.css`
   (5 preset, `noel` tối), `@theme` trong `globals.css` (thêm rose, olive, night,
   gold, border-input, font prose; bỏ keyframe luxury và `---slow`).
3. `base.css` (grain, focus), `typography.css` (thang mới + class tương thích cũ),
   `layout.tsx` (Literata, `themeColor`).
4. Primitive: `ArchiveLabel`, `MattedImage` (từ `CatalogueItemImage`), `WaxSeal`;
   restyle `Button`, `Card`, `SectionHeader`.
5. `AppHeader`: capsule, dấu niêm phong, gạch rose cho mục active, menu mobile có
   Esc và trả focus.
6. `ThemeAtmosphere`: grain và một vùng sáng tĩnh theo preset.

## Chặng 1 — Trang chủ

1. **TDD** `selectLivingCover` (chương có ảnh mới nhất → item nổi bật → bìa chữ).
2. **TDD** `selectTodayNote` (thư mở trong 7 ngày → chương cùng ngày/tháng năm
   trước theo `Asia/Ho_Chi_Minh` → không có).
3. **TDD** `sanitizeCatalogueReturnPath` (`?back=`), chặn `//`, `http:`, `\`.
4. Read model: thêm `occurredOn` vào `TimelineChapterPreview` (mapper, cột select,
   test mapper hoặc reader).
5. `page.tsx`: tổng quan lấy trang item, chapter preview (1 item mỗi chương), chương
   hành trình, trang 1 hòm thư đã mở. Lọc/tìm kiếm thì bỏ bìa.
6. Component: `LivingCover`, `HomeEntrances`, `TodayNote`, `CatalogueChapterIndex`,
   `ArchiveObject`, `CatalogueFeaturedObject`; restyle search, chip rail,
   pagination, empty state.
7. Gỡ `CinematicDiaryIntro`, scene, geometry cùng test và CSS,
   `CatalogueChapterBand`, `CatalogueItemCard`; `npm uninstall three @types/three`.

## Chặng 2 — Hành trình

1. `MemoryThread` (desktop sticky), `TimelineChapterSelect` (disclosure mobile).
2. Viết lại `RelationshipTimeline`, `TimelineChapterReader` (chương trước/sau),
   `TimelineResponsePanel`.
3. Gỡ `TimelineFilmControls`, `TimelineChapterPreview`, CSS cuộn phim.

## Chặng 3 — Thư

1. **TDD** reader: `listManaged(serverNow)` chỉ trả thư đã mở; use case truyền giờ
   server. Sửa `any` trong test và reader.
2. **TDD** `formatFutureLetterOpening` ("Mở lúc 20:30 ngày 14/02/2027") và
   `formatTimeUntil` (đếm ngược).
3. Migration `docs/migrations/2026-09-29-seal-letters-from-owner.sql` (phương án A).
4. Admin thư: chỉ thư đã mở.
5. `FutureLettersExperience`: header, tab `?tab=`, giá thư `LetterEnvelope`,
   `LetterReadingRoom` (dialog Blue Hour + nghi thức, `localStorage` cho lần đọc
   lại), danh sách đã hẹn có đếm ngược, form viết theo đặc tả 5.6.
6. Cập nhật `future-letter-opening-card.test.tsx` theo hành vi mới (mở thư, bỏ qua,
   reduced motion).

## Chặng 4 — Các màn còn lại

1. Chi tiết catalogue: hero, liên kết thực tế, `?back=`, bảng tương tác (trạng
   thái, yêu thích, cảm nhận, bình luận).
2. Login, access denied, `loading.tsx`, `error.tsx`, màn bảo trì.
3. Admin: token, trạng thái Nháp/Công khai, tab gạch dưới.
4. Quét màu cứng (`bg-white`, `text-white`, `*-black/*`) để `noel` tối đọc được.

## Chặng 5 — Xác minh

`npm run test`, `npm run lint`, `npm run build`, browser QA ở 320–1440 px (cần
`npm run auth:save`), rà diff chỉ chứa thay đổi trong phạm vi.

## Kết quả triển khai (2026-09-29)

Tất cả chặng 0–4 đã làm. Bổ sung ngoài plan, theo yêu cầu giữa chừng của người dùng:
đổi font sang Newsreader + Be Vietnam Pro, bố cục full màn hình, hiệu ứng theo phần
(xem đặc tả, mục "Thay đổi sau khi duyệt").

Lỗi có sẵn được sửa trong lúc làm:

- "Xem tất cả" của chương trỏ vào route item → thay bằng mục lục chương dùng
  `createCataloguePath`.
- Trang chi tiết mất toàn bộ phần trạng thái cá nhân và Yêu thích (action server
  còn nhưng UI đã mất) → thêm `MyItemStatePanel` (có test).
- Bình luận không tải lại sau khi gửi/sửa/xóa → thêm `router.refresh()`.
- Placeholder ô tìm thư và nút "Trang trước" bị lỗi mã hóa ký tự.
- Ảnh bị ẩn cho tới khi hydrate (xấu cho LCP) → ảnh hiện từ HTML server.
- Token theme bị "đóng băng" ở `:root` khiến preset tối không đổi nền → khai báo
  token trên `:root, body`.

Xác minh: 24 file test / 90 test pass; lint 0 vấn đề; `next build` pass; e2e
Playwright pass; QA trực quan bằng dữ liệu mẫu (render tĩnh) ở 320/390/768/1024/
1440/2560 px, sáng và tối, reduced motion; axe không có lỗi tương phản/ARIA.

Chưa xác minh được: các trang cần đăng nhập với dữ liệu thật (phiên Playwright hết
hạn), admin (chỉ đổi token/nhãn, chưa QA trực quan), số đo LCP/CLS/INP, RLS theo
từng vai trò trên database thật, migration D4 (chưa chạy).
