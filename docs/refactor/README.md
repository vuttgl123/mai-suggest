# Kế hoạch refactor FE và nâng cấp UI/UX

## Mục đích

Bộ tài liệu này chia việc refactor thành các section độc lập để có thể duyệt và
triển khai tuần tự. Không sửa source code của section sau khi section đó chưa được
duyệt.

## Ràng buộc toàn dự án

- Ứng dụng tiếp tục frontend-only với Next.js App Router, React và TypeScript.
- Nội dung website và catalogue tiếp tục nằm trong `public/data/*.json`.
- Lựa chọn của người dùng tiếp tục lưu trên thiết bị bằng `localStorage`.
- Không thêm backend, database, auth, API route, server action hoặc dịch vụ gửi mail.
- Giữ tương thích dữ liệu `localStorage` hiện tại trong suốt quá trình refactor.
- Không làm mất các luồng hiện có: tìm kiếm, lọc, thích, thích nhất, ghi chú,
  tổng kết, clipboard, `mailto` và reset.
- Không sửa hoặc hoàn nguyên thay đổi chưa commit của người dùng ngoài phạm vi
  section đang được thực thi.
- Không tạo sub-agent nếu người dùng chưa yêu cầu rõ ràng.

## Tiêu chuẩn UI/UX bắt buộc

- Mục tiêu accessibility là WCAG 2.2 AA:
  <https://www.w3.org/TR/WCAG22/>.
- Control chính có vùng tương tác tối thiểu 44 x 44 CSS px. Đây là mục tiêu nội bộ
  cao hơn mức tối thiểu 24 x 24 CSS px của WCAG 2.2 AA:
  <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum>.
- Mọi luồng chính phải dùng được bằng keyboard, có focus visible và focus order
  hợp lý.
- Dialog phải có accessible name, focus trap, Escape, restore focus và scroll lock.
- Mọi thay đổi thị giác phải kiểm tra tại 320, 390, 768, 1024 và 1440 px.
- Không có text tràn, overlap, layout shift vô cớ hoặc control đổi kích thước theo
  trạng thái.
- Có đủ loading, empty, error, disabled, hover, focus, selected và reduced-motion.
- Không dùng card lồng card hoặc biến toàn bộ section thành floating card.
- Item card có bán kính không quá 8 px; modal và tool surface cũng dùng bán kính
  có kiểm soát.
- Không dùng cỡ chữ phụ thuộc trực tiếp vào viewport width; dùng scale cố định và
  breakpoint rõ ràng.
- Letter spacing bằng 0; không dùng tracking âm.
- Không lạm dụng gradient, họa tiết trang trí, copy cảm xúc chung chung hoặc nhiều
  biến thể của cùng một màu.
- Ảnh phải cho thấy món đồ hoặc trải nghiệm thật, có `alt`, kích thước ổn định và
  crop phù hợp.
- Core Web Vitals không được regression. Mục tiêu tham chiếu: LCP <= 2.5 s,
  INP <= 200 ms và CLS <= 0.1:
  <https://web.dev/articles/defining-core-web-vitals-thresholds>.

## Thứ tự và trạng thái duyệt

| Mã | Section | Phụ thuộc | Trạng thái |
| --- | --- | --- | --- |
| `01` | [Baseline và Core Codebase](./01-baseline-core-codebase.md) | Không | Hoàn tất code, chờ browser smoke |
| `02` | [UI Foundation và Design System](./02-ui-foundation.md) | `01` | Đang thực thi |
| `03` | [Information Architecture](./03-information-architecture.md) | `01`, `02` | Đã duyệt |
| `04` | [Catalogue Discovery và Product UX](./04-catalogue-experience.md) | `01`-`03` | Đã duyệt |
| `05` | [Selection, Summary và Sharing](./05-selection-workflow.md) | `01`-`04` | Đã duyệt |
| `06` | [Humanize Visual và Content](./06-human-visual-content.md) | `02`-`05` | Đã duyệt |
| `07` | [Accessibility, Performance và Release QA](./07-quality-release.md) | `01`-`06` | Đã duyệt |

Người dùng có thể duyệt từng section bằng mã, ví dụ: `Duyệt 01 và 02`. Section đã
duyệt vẫn được triển khai theo thứ tự dependency ở trên.

## Cách thực thi mỗi section

1. Đọc lại `AGENTS.md`, file section và source hiện tại.
2. Dùng `superpowers:executing-plans` để thực thi task theo thứ tự.
3. Dùng `superpowers:test-driven-development` cho thay đổi hành vi.
4. Dùng `vercel-react-best-practices` khi sửa React/Next.js.
5. Chỉ dùng skill bổ sung khi section ghi rõ điều kiện kích hoạt.
6. Kết thúc từng task bằng test liên quan và self-review diff.
7. Kết thúc section bằng full test, lint, build và quality gate được liệt kê.
8. Dùng `superpowers:verification-before-completion` trước khi báo hoàn tất.

## Definition of Done toàn chương trình

- Mọi section đã được người dùng duyệt và thực thi theo dependency.
- JSON vẫn là nguồn nội dung duy nhất; không có backend mới.
- Dữ liệu lựa chọn cũ vẫn hydrate được từ `localStorage`.
- Không còn module trùng trách nhiệm hoặc code chết đã được xác minh.
- Các luồng chính có unit/component/browser test.
- UI đạt quality gate trong file này trên desktop, tablet, mobile và keyboard.
- Lint, test, build và production browser QA đều có bằng chứng mới.
