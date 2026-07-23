# Bộ sưu tập: giữ ngữ cảnh và tìm kiếm — thiết kế

**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.

## Mục tiêu

Khi thành viên đổi chương hoặc trang trong Bộ sưu tập, trang giữ nguyên vị trí
đang đọc thay vì quay về phần mở đầu landing page. Đồng thời, thành viên có thể
tìm trong Bộ sưu tập theo tiêu đề và mô tả ngắn của item mà không mở rộng phạm
vi thành tìm kiếm toàn website.

## Nguyên nhân hiện tại

Các thẻ chương và liên kết phân trang đều điều hướng tới URL `/?category=…` hoặc
`/?page=…` bằng hành vi cuộn mặc định của Next.js. Vì route gốc chứa phần
landing/intro ở đầu, mỗi lần URL query đổi trình duyệt được đưa về đầu trang.
Đây không phải lỗi của View Transition.

## Trải nghiệm điều hướng

- Chỉ các thao tác ngay trong Bộ sưu tập được giữ vị trí cuộn: chọn chương,
  “Xem tất cả”, và phân trang.
- Các liên kết điều hướng giữa những trang lớn (Hành trình, Thư hẹn ngày mở,
  Quản trị) vẫn mở từ đầu trang mới. Liên kết “Bộ sưu tập” ở header vẫn là
  `/#collection`, nên chủ ý đưa người dùng đến vùng Bộ sưu tập.
- Các liên kết nội bộ của Bộ sưu tập dùng `scroll={false}`. Không bổ sung hiệu
  ứng route mới hay thay đổi chuyển động hiện có.

## Tìm kiếm Bộ sưu tập

- Một ô tìm kiếm nhỏ nằm ngay trước vùng kết quả, sau rail chọn chương.
- Thành viên nhập cụm từ rồi nhấn Enter hoặc nút “Tìm”. Không gửi truy vấn mỗi
  ký tự; điều này tránh request thừa và giữ input mượt.
- Nút xóa xuất hiện khi đang có từ khóa. Xóa đưa về trang 1 của cùng danh mục,
  không có `q`, và vẫn giữ vị trí cuộn.
- Kết quả tìm theo `title` hoặc `summary`, không phân biệt hoa/thường. Khi có
  cả danh mục và từ khóa, hai điều kiện được kết hợp (tìm trong danh mục đã
  chọn). Kết quả luôn trở về trang 1 khi đổi từ khóa hoặc danh mục.
- Dòng trạng thái nêu rõ “Kết quả cho …” và số item. Trạng thái rỗng nêu đúng
  ngữ cảnh tìm kiếm, khác với thông báo Bộ sưu tập chưa có nội dung.

## URL và điều hướng lịch sử

- Dùng query `q`: `/?category=di-choi&q=ca-phe&page=2`.
- Chuẩn hóa `q` ở server: lấy giá trị đầu tiên, trim, gộp khoảng trắng liên tiếp,
  cắt tối đa 80 ký tự; chuỗi rỗng được xem là không tìm kiếm.
- `createCataloguePath` nhận thêm `query`, chỉ đặt `q` khi có giá trị, và luôn
  giữ `q` khi chuyển chương/phân trang. `page` tiếp tục chỉ hiện khi lớn hơn 1.
- Khi người dùng đi Back/Forward hoặc mở URL đã chia sẻ, server đọc `q` và input,
  danh mục, phân trang cùng hiển thị đúng trạng thái URL.

## Kiến trúc và ranh giới

- `catalogue-search-query.ts` trong domain là nguồn duy nhất để chuẩn hóa từ
  khóa. `catalogue-navigation.ts` dùng helper này để parse URL và tạo URL
  catalogue; infrastructure dùng cùng helper trước khi tạo filter PostgREST.
- `CatalogueSearch` là Client Component nhỏ, chỉ quản lý giá trị input và gọi
  `router.push(path, { scroll: false })` khi submit/xóa. Không gọi Supabase từ
  browser và không giữ bản sao dữ liệu kết quả ở client.
- `app/page.tsx` truyền `q` đã chuẩn hóa vào `ListVisibleItemPage` và
  `CatalogueHome`; trường hợp trang vượt tổng trang phải giữ nguyên cùng `q` khi
  tải lại trang cuối.
- `CatalogueReader` mở rộng criteria đọc bằng `query?: string` để luồng
  application và infrastructure cùng có kiểu rõ ràng. Danh mục, quyền active
  member, mapping item và truy vấn ảnh giữ nguyên.
- `SupabaseCatalogueReader` áp dụng điều kiện `or(title.ilike…,summary.ilike…)`
  lên query `items` trước khi `order`/`range`, nên `count: "exact"`, phân trang
  và ảnh trả về cùng một tập kết quả.

## An toàn dữ liệu và hiệu năng

- Không thay schema, migration, index, RLS, quyền hay Supabase client boundary.
  Việc đọc vẫn chỉ từ Server Component qua backend hiện có; RLS hiện hành tiếp
  tục quyết định item nào được thấy.
- Supabase yêu cầu đối số `.or()` tuân thủ cú pháp PostgREST và được sanitize.
  Trước khi ghép query, mã chỉ giữ chữ Unicode, số, khoảng trắng và dấu gạch nối
  trong từ khóa; ký tự điều khiển/cú pháp PostgREST, wildcard và dấu câu bị loại
  bỏ. Wildcard `%` chỉ do server thêm vào để tìm theo cụm từ.
- Đây là tìm kiếm `ILIKE` có chứa cụm từ cho Bộ sưu tập hiện có. Không thêm
  full-text index trong phạm vi này. Nếu dữ liệu tăng đáng kể, cần một đặc tả
  riêng về generated `tsvector`/GIN index và migration trước khi tối ưu tiếp.

## Trường hợp biên

- Danh mục không tồn tại vẫn trả trang rỗng như hiện tại, đồng thời phản ánh
  trạng thái tìm kiếm nếu có `q`.
- Nếu người dùng chỉ nhập ký tự bị loại bởi chuẩn hóa, URL không chứa `q` và
  hiển thị toàn bộ kết quả của danh mục hiện chọn.
- Trang yêu cầu lớn hơn trang cuối tiếp tục được kẹp về trang cuối, với cả
  `category` và `q` không thay đổi.
- Không có truy vấn hoặc kết quả rỗng không làm hỏng rail chương, featured item,
  phân trang hay View Transition hiện có.

## Ngoài phạm vi

- Tìm kiếm Hành trình, Thư hẹn ngày mở, trang quản trị hoặc toàn website.
- Gợi ý tức thì, lịch sử tìm kiếm, autocomplete, lọc theo loại/giá, hay thay
  đổi giao diện landing page.
- Bất kỳ migration, index, thay đổi RLS, cache mới, commit hoặc nhánh Git nào.

## Xác minh dự kiến

Theo yêu cầu đã chốt của người dùng, không chạy test, lint, build hoặc browser
QA cho thay đổi này. Bàn giao sẽ chỉ kiểm tra tĩnh: đối chiếu các đường dữ liệu,
kiểu TypeScript trong phần đã sửa và diff phạm vi liên quan.
