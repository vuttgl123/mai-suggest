# Catalogue detail, pagination, owner workspace and motion

## Mục tiêu

Biến bộ sưu tập thành một trải nghiệm tình cảm hoàn chỉnh: người xem khám phá
item theo trang, mở từng item để đọc những lời nhắn riêng; Owner có một nơi
quản lý chi tiết, gọn gàng; toàn bộ giao diện dùng Bordeaux đỏ trầm và điều
hướng có chuyển động nhẹ, có ý nghĩa.

Phạm vi này không tạo backend service mới, migration, RLS mới hoặc mock data.
Next.js App Router tiếp tục là lớp server-side application logic và Supabase là
nguồn dữ liệu duy nhất.

## Dữ liệu và ranh giới DDD

### Lời nhắn trong metadata

Mỗi `items.metadata` được mở rộng bằng khóa `keepsakes`, nhưng các khóa metadata
hiện có phải được giữ nguyên. Giá trị có dạng mảng có thứ tự:

```ts
{
  keepsakes: [
    {
      id: "stable-client-id",
      kind: "message" | "poem" | "memory",
      title: "Tiêu đề tùy chọn",
      content: "Nội dung lời nhắn",
    },
  ],
}
```

Một domain utility độc lập sẽ đọc metadata không tin cậy thành `ItemKeepsake[]`
và bỏ qua entry sai định dạng khi đọc. Khi Owner lưu, application layer sẽ kiểm
tra metadata: tối đa 24 mảnh thư/item, `id` không trống và duy nhất, kind hợp lệ,
title tối đa 120 ký tự (có thể trống) và content 1–2.000 ký tự. Việc ghi metadata
được merge để không làm mất `source`, `initialCuration` hoặc dữ liệu hợp lệ khác.

JSON là lựa chọn phù hợp cho các mảnh thư chỉ thuộc về một item, được hiển thị
theo thứ tự và không cần truy vấn/đếm trên toàn catalogue. Nếu sau này cần tìm
kiếm, quyền riêng tư từng thư, ảnh riêng hoặc mốc thời gian có truy vấn, khi đó
mới tách bảng `item_keepsakes` bằng một migration và RLS được duyệt riêng.

### Phân trang

Thêm read model `CatalogueItemPage` gồm `items`, `page`, `pageSize`, `total` và
`pageCount`. `CatalogueItemCriteria` nhận `categorySlug`, `page` và `pageSize`.
Use case mới `ListVisibleItemPage` kiểm tra actor active và để reader lấy một
trang data thật.

`SupabaseCatalogueReader` sẽ:

1. Xác định category hợp lệ như hiện tại; category không có sẽ trả trang rỗng.
2. Query `items` có `count: "exact"`, `order("title")` và `range(from, to)`.
3. Chỉ query `item_images` cho các item của trang hiện tại.

Trang chủ chuẩn hóa `page` từ URL, mặc định 1, tối thiểu 1 và kẹp vào trang cuối.
Kích thước trang public là 6 để grid 3×2 cân đối; link danh mục luôn trở về trang
1 và link phân trang giữ `category`. Không lấy toàn bộ catalogue rồi cắt ở client.

## Trải nghiệm public

### Trang bộ sưu tập `/`

- Hero hiển thị tổng số item trong bộ lọc, không phải số item ở riêng trang đang
  xem.
- Grid chỉ chứa sáu item mỗi trang; pagination có Trước/Sau, số trang hiện tại và
  các trang lân cận, dùng URL có thể chia sẻ.
- Card trở thành link tới `/catalogue/[slug]`, có trạng thái focus rõ ràng và
  hover nâng rất nhẹ.
- Nền và card chuyển từ hồng nhạt sang giấy ngà ấm; Bordeaux sâu là màu của các
  điểm nhấn, button và typography chính.

### Trang chi tiết `/catalogue/[slug]`

Trang là Server Component, dùng `getVisibleItemDetail` hiện có và danh mục để
hiển thị nhãn. Slug không tồn tại trả 404. Nội dung gồm:

1. Điều hướng trở lại bộ sưu tập.
2. Hero item: ảnh chính hoặc placeholder, danh mục, title, summary, giá/địa chỉ
   khi có.
3. Mô tả và link nguồn chính thức khi có.
4. "Những điều muốn nói" — từng `keepsake` hiển thị là một tờ thư gọn, có biểu
   tượng và nhãn theo loại: Lời nhắn, Thơ, Kỷ niệm. Thứ tự đúng với Owner đã sắp.
5. Empty state lịch sự nếu item chưa có lời nhắn; không tạo nội dung giả.

Trang chi tiết chỉ đọc public data mà RLS đã cho active member thấy; không có
secret hay query server-only trong Client Component.

## Owner workspace `/admin`

Admin được thiết kế lại thành workspace đáp ứng desktop và mobile, vẫn chỉ Owner
qua guard/action hiện có mới được truy cập và ghi dữ liệu.

### Bố cục

- Header thông tin workspace với thống kê item/danh mục và link xem catalogue.
- Cột trái: danh mục, số item và nút tạo danh mục.
- Cột giữa: danh sách item có phân trang, filter theo danh mục, trạng thái
  Published/Draft và link chọn item. Query/selection nằm trong URL để refresh vẫn
  giữ ngữ cảnh.
- Cột phải: item editor; mobile chuyển thành từng khối theo thứ tự danh mục →
  danh sách → editor.

Editor có ba section rõ ràng:

1. **Thông tin** — danh mục, loại, title, slug, summary, description, giá, địa
   điểm, trạng thái công khai.
2. **Những điều muốn nói** — thêm Lời nhắn/Thơ/Kỷ niệm, sửa title/nội dung,
   đổi thứ tự bằng controls, xóa có xác nhận inline. Các thay đổi chỉ được ghi khi
   bấm Lưu item.
3. **Hình và đường dẫn** — danh sách ảnh/link hiện có cùng form thêm, sửa, xóa.

Tạo item mới khởi đầu ở editor với metadata rỗng. Sau khi tạo, workspace chọn
item vừa tạo. Form/action server giữ `useTransition`, thông báo success/error và
`router.refresh`; mọi mutation vẫn đi qua `ManageCatalogue`, `runServerAction`
và Owner guard.

## Màu sắc và chuyển động

### Bordeaux sâu

Các semantic tokens được điều chỉnh theo bảng sau:

| Token | Vai trò | Giá trị |
| --- | --- | --- |
| `--color-brand` | Bordeaux chính | `#650C1C` |
| `--color-brand-strong` | Tiêu đề/độ sâu | `#31050C` |
| `--color-brand-soft` | nhấn nhẹ, không hồng | `#E9DEDA` |
| `--color-paper` | giấy nền | `#FFF9F3` |
| `--color-surface` | nền phụ | `#F4ECE6` |
| `--color-accent` | đồng ấm | `#A65B45` |
| `--color-focus` | focus tương phản | `#8F1730` |

Giảm opacity các radial wash đỏ/hồng; giữ giấy ngà chiếm phần lớn bề mặt. Không
dùng đỏ nền cho đoạn văn dài hay input nhằm giữ khả năng đọc và tương phản.

### View Transitions

Bật `experimental.viewTransition` của Next.js, dùng React `<ViewTransition>` và
CSS recipes chuẩn thay vì animation tự viết hoặc thêm thư viện mới.

Navigation map:

| Nguồn | Đích | Chuyển động |
| --- | --- | --- |
| `/` card | `/catalogue/[slug]` | `nav-forward`: tiến sâu rất nhẹ; ảnh chính morph nếu có |
| `/catalogue/[slug]` back link | `/` | `nav-back`: trở lại nhẹ |
| `/` danh mục | `/` bộ lọc khác | cross-fade vùng grid, không slide hướng |
| `/` trang N | `/` trang N±1 | horizontal nhẹ theo thứ tự trang |
| `/admin` chọn item | `/admin?item=...` | cross-fade editor, không slide hướng |

`AppHeader` là persistent navigation, được đặt `viewTransitionName` riêng để nó
không trượt/nhấp nháy trên page transition có backdrop blur. Các page transition
chỉ đặt trong page component, không đặt ở root layout. Tên shared element có prefix
và item ID để tránh trùng. CSS sử dụng đủ recipes fade, slide, morph, persistent
isolation và reduced motion; ở `prefers-reduced-motion`, view transition có thời
gian bằng 0.

## Lỗi, bảo mật và hiệu năng

- Các lỗi read trả error page hiện hữu; route detail không có item trả 404.
- Action failure dùng thông điệp hiện có, thêm phản hồi cụ thể cho dữ liệu lời
  nhắn không hợp lệ; không log metadata hay credential.
- Không thay RLS hoặc dùng service/secret key trong UI. All mutations xác thực
  lại Owner trên server.
- Server page khởi tạo các promise độc lập song song. Client chỉ nhận dữ liệu cần
  cho grid/editor đang mở; ảnh chỉ fetch trên trang kết quả hiện tại.
- URL query được normalize/encode trước khi build link để tránh route hỏng và
  không nhận external redirect.

## Kiểm chứng

Theo yêu cầu hiện tại không bổ sung unit test. Sau khi code, kiểm tra thủ công:

1. `npx.cmd tsc --noEmit` và `npm.cmd run build` tại môi trường Windows Node 24.
2. Manual flow Owner: tạo/chọn/sửa item, thêm/sửa/xóa/sắp thứ tự các mảnh thư,
   thêm ảnh/link, reload và kiểm tra persistence.
3. Manual flow member: filter, URL page, đi tới trang detail, đọc lời nhắn và
   back về catalogue; member không vào admin.
4. Browser QA tại 320, 390, 768, 1024 và 1440 px: card/grid/pagination/editor,
   focus, text dài, hover, image fallback, các transition và reduced motion.
