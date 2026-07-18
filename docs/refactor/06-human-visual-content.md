# Section 06: Humanize Visual và Content Implementation Plan

> **Cho Codex:** REQUIRED SUB-SKILL: dùng `superpowers:executing-plans`. Không dùng
> `imagegen` nếu người dùng chưa duyệt việc tạo hoặc thay asset raster.

**Mục tiêu:** Loại bỏ cảm giác template do AI tạo bằng một hệ thống thị giác có
chủ đích, copy cụ thể, nhịp layout tự nhiên và hình ảnh giúp đánh giá món quà thật.

**Kiến trúc:** Giữ romantic editorial nhưng giảm trang trí và card hóa. Design
tokens từ Section 02 điều khiển visual; nội dung riêng của catalogue tiếp tục nằm
trong JSON, còn command UI phổ quát nằm trong component.

**Tech stack:** CSS/Tailwind, Next Image, Motion có kiểm soát, JSON content.

## Global Constraints

- Không dùng gradient orb, bokeh blob hoặc SVG pattern trang trí nền.
- Không làm toàn trang thành một bảng màu wine/cream đơn sắc.
- Không dùng handwriting giả hoặc chi tiết “thủ công” không liên quan nội dung.
- Không thêm câu thơ/copy cảm xúc chỉ để lấp khoảng trống.
- Không dùng hero split card layout.
- Không tạo hình AI thay ảnh sản phẩm thật nếu ảnh hiện tại đủ rõ.

---

## Task 1: Audit và phân loại dấu hiệu “AI template” hiện tại

**Files:**

- Inspect: `src/app/globals.css`
- Inspect: `src/components/**/*.tsx`
- Inspect: `public/data/site.json`
- Inspect: `public/data/categories/*.json`
- Create: `docs/refactor/visual-content-audit.md`

- [ ] **Step 1: Kiểm kê visual patterns**

Ghi theo file/dòng: radius lớn, gradient, decorative pattern, card lồng card, copy
lặp, heading quá lớn, tracking âm, nhiều CTA ngang cấp và ảnh crop khó đánh giá.

- [ ] **Step 2: Phân loại giữ/sửa/xóa**

Mỗi pattern có quyết định và lý do UX. Không dùng nhận xét chung như “trông AI”;
mô tả triệu chứng quan sát được và ảnh hưởng đến task flow.

- [ ] **Step 3: Chốt visual principles**

```text
Brand rõ nhưng không áp đảo nội dung.
Ảnh và tên món quà là tín hiệu chính.
Mỗi section có một mục tiêu và một action chính.
Trang trí chỉ tồn tại khi hỗ trợ nhịp đọc.
Copy cụ thể hơn copy lãng mạn chung chung.
```

## Task 2: Loại bỏ decorative excess và card hóa section

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/components/hero-section.tsx`
- Modify: `src/components/preference-catalogue.tsx`
- Modify: `src/features/catalogue/components/collection-picker.tsx`
- Modify: `src/features/catalogue/components/filter-controls.tsx`
- Possible delete after consumer scan: `src/components/decorative-elements.tsx`

- [ ] **Step 1: Viết visual acceptance trước khi sửa**

Chụp baseline tại 390 và 1440 px. Đánh dấu section nào đang có nested surface,
gradient/pattern hoặc khoảng trắng không phục vụ hành trình.

- [ ] **Step 2: Xóa radial background và SVG pattern**

`catalogue-surface` dùng nền phẳng/section bands; không thay bằng gradient trang trí
khác.

- [ ] **Step 3: Chuyển filter/progress/CTA sections sang unframed layout**

Giữ border/divider khi cần phân vùng. Card chỉ dùng cho item lặp, dialog và tool
thật sự cần frame.

- [ ] **Step 4: Rà consumer của decorative elements**

Run: `rg -n "DecorativeDivider|decorative-elements" src`

Chỉ xóa file khi không còn consumer; nếu giữ một divider thì làm đơn giản, không
dùng icon trang trí lặp khắp trang.

## Task 3: Chuẩn hóa image direction

**Files:**

- Modify: `src/components/smart-image.tsx`
- Modify: `src/components/preference-card.tsx`
- Modify: `src/components/product-message-dialog.tsx`
- Modify as needed: `public/data/site.json`
- Modify as needed: `public/data/categories/*.json`

**Image rules:**

- Hero: full-bleed, chủ thể và không gian thật, không crop tối/blur đến mức chỉ còn
  atmosphere.
- Product card: aspect ratio ổn định, item nhìn rõ, không dùng ảnh quá giống stock.
- Detail: ưu tiên crop giúp đánh giá chất liệu/hình dáng.
- Mỗi ảnh có alt mô tả nội dung, không lặp tên item một cách máy móc.

- [ ] **Step 1: Tạo script/report kiểm tra image metadata**

Tận dụng `scripts/build-catalogue.mjs` hoặc validator để kiểm tra URL, alt không rỗng,
duplicate URL và hostname được `next/image` cho phép.

- [ ] **Step 2: Xác định ảnh cần thay**

Chỉ thay ảnh fail các rule trên. Ưu tiên nguồn ảnh thật/CDN ổn định. `imagegen` chỉ
được kích hoạt sau khi người dùng duyệt asset cụ thể cần tạo.

- [ ] **Step 3: Cố định image geometry**

Card/detail có `aspect-ratio` rõ; loading và error fallback giữ cùng kích thước.

- [ ] **Step 4: Browser image QA**

Kiểm tra object-position ở năm viewport, không cắt mặt/chủ thể và không layout shift.

## Task 4: Audit và viết lại microcopy

**Files:**

- Modify: `public/data/site.json`
- Modify selectively: `public/data/categories/*.json`
- Modify: component files chứa command/status copy.
- Update: `src/lib/preference-validation.ts` only when JSON field contract changes.

**Copy rules:**

- Command dùng động từ trực tiếp: `Lọc`, `So sánh`, `Xem lựa chọn`, `Gửi qua email`.
- Status nói điều đã xảy ra: `Đã lưu trên thiết bị này`.
- Không dùng “mình”, “em”, “câu chuyện”, “điều khiến em mỉm cười” lặp ở mọi section.
- Giữ giọng thân mật ở hero/message riêng; utility UI ưu tiên rõ ràng.
- Không hứa tính năng không có như gửi tự động hoặc đồng bộ thiết bị.

- [ ] **Step 1: Extract toàn bộ visible copy để review**

Run:

```bash
rg -n '>[[:space:]]*[^<{][^<]*<' src/components src/features
```

Kết hợp với text trong JSON để tạo danh sách copy theo context.

- [ ] **Step 2: Viết lại copy theo user action**

Mỗi text phải thuộc một trong: brand, hướng dẫn ngắn, label, status, error hoặc nội
dung riêng của item. Xóa đoạn không có vai trò.

- [ ] **Step 3: Cập nhật JSON có validation**

Không đổi ID, taxonomy hoặc item relationships. Nếu thêm field content, cập nhật
type, validator, script và test trong cùng task.

- [ ] **Step 4: Kiểm tra text overflow tiếng Việt**

Kiểm tra label dài nhất trong button, chip, tab, card và dialog ở 320 px.

## Task 5: Giảm và chuẩn hóa motion

**Files:**

- Modify: `src/components/hero-section.tsx`
- Modify: components đang import `motion/react`.
- Modify: `src/app/globals.css`

- [ ] **Step 1: Kiểm kê motion theo mục đích**

Mỗi animation phải thuộc feedback, continuity hoặc reveal có ích. Animation chỉ
để “trông mềm mại” bị xóa.

- [ ] **Step 2: Chuẩn hóa duration/easing bằng token**

Hover không làm layout shift. Card không nhảy vị trí khi favorite. Dialog có một
enter/exit ngắn; reduced-motion gần như tức thời.

- [ ] **Step 3: Không thêm View Transitions mặc định**

Chỉ dùng `vercel-react-view-transitions` nếu sau này có route/shared-element use
case được người dùng duyệt.

## Task 6: Visual QA và content QA

- [ ] **Step 1: Chạy test, lint, build**

Run in order:

```bash
npm run test
npm run lint
npm run build
```

- [ ] **Step 2: Chụp năm viewport**

Hero phải để lộ phần tiếp theo; product nhìn rõ; không card lồng card; không text
tràn hoặc control overlap.

- [ ] **Step 3: Soát visual consistency**

So sánh radius, divider, typography, focus, image ratio, button hierarchy và section
spacing trên toàn trang.

- [ ] **Step 4: Soát content consistency**

Search copy lặp, lời hứa sai, status mơ hồ, label dài và giọng điệu không nhất quán.

## Acceptance Checklist

- [ ] Không còn decorative radial/SVG pattern hoặc nested page-section cards.
- [ ] Palette có brand, neutral và functional colors rõ vai trò.
- [ ] Typography không viewport-scaled và không tracking âm.
- [ ] Copy utility trực tiếp; copy cảm xúc chỉ nằm ở context phù hợp.
- [ ] Ảnh giúp đánh giá item và giữ geometry ổn định.
- [ ] Motion có mục đích và reduced-motion hoạt động.
- [ ] Visual/content QA hoàn tất ở năm viewport.

## Skill Routing

- Thực thi: `superpowers:executing-plans`.
- UI audit: `web-design-guidelines`.
- Ảnh raster mới: `imagegen`, chỉ sau khi người dùng duyệt asset.
- React performance: `vercel-react-best-practices`.
- Hoàn tất: `superpowers:verification-before-completion`.
