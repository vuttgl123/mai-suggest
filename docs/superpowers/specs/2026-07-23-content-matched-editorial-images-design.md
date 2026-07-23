# Ảnh biên tập theo chiều cao nội dung — thiết kế

**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.

## Vấn đề đã xác nhận

`CatalogueItemImage` hiện luôn tạo một khung `aspect-[4/5]`. Khi component này
được đặt trong card hai cột, chiều cao của ảnh chỉ phụ thuộc vào chiều rộng,
trong khi cột nội dung có thể cao hơn nhiều do câu chuyện dài. Điều này thấy rõ
ở chương nổi bật của Hành trình và cũng xảy ra ở card nổi bật của Bộ sưu tập.

## Mục tiêu

Ảnh trong card biên tập hai cột phải phủ kín cùng chiều cao với phần nội dung
trên màn hình đủ rộng, để card trông như một trang nhật ký thống nhất. Trên màn
hình hẹp, ảnh vẫn là một dải ảnh có chiều cao tối thiểu vừa phải trước nội dung.

## Giải pháp được chọn

- `CatalogueItemImage` nhận prop bố cục rõ nghĩa `variant?: "portrait" | "content-fill"`.
  Giá trị mặc định `portrait` giữ nguyên toàn bộ hành vi và tỷ lệ `4:5` hiện có.
- `content-fill` dùng một khung ảnh có `height: 100%`, `min-height` khoảng
  `16rem`, và ảnh `object-cover`. Khung vì thế kéo theo chiều cao hàng grid khi
  nó có cột nội dung cạnh bên, nhưng không bị co rỗng khi xếp dọc trên mobile.
- Biến thể này chỉ được dùng tại:
  - `TimelineFeaturedChapter`, tại breakpoint `lg` nơi card thành hai cột.
  - `CatalogueFeaturedItemCard`, tại breakpoint `md` nơi card thành hai cột.
- Ở hai card trên, cột ảnh được để stretch theo hàng grid; không đặt
  `aspect-ratio` ở wrapper của card. `object-cover` giữ hình không méo khi nội
  dung cao hơn ảnh.

## Những phần cố ý không thay đổi

- `TimelineChapterCard` vẫn là bố cục dọc: ảnh nằm giữa tiêu đề và câu chuyện,
  nên không có cột nội dung cạnh ảnh để đồng bộ chiều cao.
- Catalogue list card, catalogue detail hero, future letter, ảnh keepsake và
  placeholder/lỗi mặc định vẫn giữ `portrait` 4:5.
- Không chỉnh global CSS, không đổi data model, không đổi URL ảnh, preload,
  lazy loading, fallback lỗi, animation tải ảnh, RLS hay Supabase.

## Khả năng tiếp cận và responsive

- `alt`, `aria-busy`, trạng thái lỗi và skeleton giữ nguyên từ component ảnh
  hiện có.
- Trên mobile, card vẫn xếp ảnh rồi nội dung; `min-height` ngăn ảnh lùn hoặc
  nhảy bố cục trong lúc tải.
- Từ `md`/`lg` đúng theo grid hiện hữu, grid item stretch theo hàng chung; nếu
  câu chuyện dài hơn, phần ảnh cao theo, không biến dạng.
- Không thêm transition hay hiệu ứng mới; `prefers-reduced-motion` vì thế không
  bị ảnh hưởng.

## Ngoài phạm vi

- Biến mọi card Hành trình thành layout hai cột.
- Tự suy đoán tỷ lệ ảnh thật, thay đổi crop thủ công, thay Next/Image, hay tải
  ảnh từ client.
- Test, lint, build, browser QA, commit hoặc tạo nhánh, theo yêu cầu đã chốt.

## Xác minh dự kiến

Chỉ đối chiếu tĩnh các props, class responsive, hai nơi dùng biến thể mới và
diff phạm vi. Không đưa ra tuyên bố runtime vì người dùng không yêu cầu chạy
test, lint, build hoặc browser QA.
