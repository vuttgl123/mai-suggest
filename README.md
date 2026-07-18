# Điều Em Yêu

“Điều Em Yêu” là catalogue gợi ý quà mang phong cách romantic editorial. Website giúp người nhận chọn những món đồ, phong cách và trải nghiệm mình yêu thích; đây không phải cửa hàng và không có chức năng mua hàng.

Dự án chạy hoàn toàn trên frontend, không có backend, database, đăng nhập, API key hay biến môi trường bắt buộc.

## Công nghệ

- Next.js App Router, React và TypeScript strict.
- Tailwind CSS, Motion và Lucide React.
- `next/font/google`, `next/image`, ESLint và localStorage.

## Cài đặt và chạy

Yêu cầu Node.js 20.9 trở lên.

```bash
npm install
npm run dev
npm test
npm run test:watch
npm run lint
npm run build
```

## Cấu trúc dữ liệu

Route `/` đọc `preferences.json` trực tiếp ở server trong lúc render bằng
`getPreferenceData()`. Manifest này trỏ đến nội dung website và từng file danh mục:

```text
public/data/
  preferences.json
  site.json
  categories/
    gift-ideas.json
    dresses.json
    bags.json
    shoes.json
    jewelry.json
    flowers-decor.json
    dream-trips.json
```

`site.json` chứa tên website, lời nhắn hero, ảnh hero, tên người nhận và địa chỉ email nhận tổng kết.

Mỗi danh mục có `id`, `name`, `description`, `notePlaceholder` và mảng `items`. Mỗi item bắt buộc có:

- `id`, `name`, `description`.
- `imageUrl`, `imageAlt`.
- `tags` từ 2 đến 4 giá trị.
- `message`: lời nhắn hoặc bài thơ hiển thị khi mở card.

Các trường tùy chọn gồm `referencePrice`, `priceUpdatedAt`, `brand`, `sourceName` và `sourceUrl`. Giá và link chỉ mang tính tham khảo.

Ví dụ item:

```json
{
  "id": "gift-id-khong-trung",
  "name": "Tên món quà",
  "description": "Mô tả ngắn bằng tiếng Việt.",
  "imageUrl": "https://images.unsplash.com/photo-id?auto=format&fit=crop&w=1200&q=90",
  "imageAlt": "Mô tả nội dung ảnh",
  "message": "Một lời nhắn riêng\nCó thể viết thành thơ\nDành cho từng món quà\nVà từng điều em nhớ.",
  "tags": ["Kỷ niệm", "Tinh tế"]
}
```

Để thêm quà vào danh mục có sẵn, chỉ cần thêm item JSON. Để thêm danh mục, tạo file mới trong `public/data/categories` rồi thêm một đường dẫn vào `preferences.json`. Component không phụ thuộc vào tên hay thứ tự danh mục.

## Kiến trúc frontend

JSON trong `public/data` là nguồn nội dung duy nhất. Server component chỉ đọc và
validate JSON, sau đó truyền dữ liệu đã typed xuống catalogue. Không có client
fetch, API route hoặc backend song song.

Logic theo domain nằm trong feature folders:

```text
src/features/
  catalogue/
    hooks/       # controller và discovery state
    lib/         # query/filter thuần TypeScript
  selection/
    components/  # summary và các vùng nội dung
    hooks/       # React adapter cho selection
    lib/         # reducer, migration và storage adapter
```

`PreferenceCatalogue` điều phối màn hình, còn state machine và query có thể test
độc lập với React/DOM. Grid hiển thị theo batch và dùng nút “Xem thêm”; số item
được tính từ kết quả tìm kiếm/lọc hiện tại.

## Ảnh và nguồn tham khảo

Ảnh hiện dùng Unsplash độ phân giải lớn và CDN chính thức ở những nơi có URL ổn định. Khi dùng hostname ảnh mới, thêm hostname vào `images.remotePatterns` trong `next.config.ts` rồi chạy lại build.

Link nguồn mở ở tab mới để tham khảo. Website không có giỏ hàng, thanh toán hoặc nút mua ngay.

## Tổng kết và email

Nút “Sao chép kết quả” dùng Clipboard API và có fallback bằng textarea tạm. Nút “Gửi qua email” dùng `mailto:` để mở ứng dụng email mặc định với người nhận và nội dung đã điền sẵn.

Website không tự gửi email và không chứa mật khẩu Gmail. Gửi tự động sẽ cần backend hoặc dịch vụ gửi mail phía máy chủ.

## Dữ liệu trên trình duyệt

Lựa chọn được lưu bằng localStorage với key `dieu-em-yeu:preferences:v1`. Storage
adapter chấp nhận schema 1 cũ, migrate về schema 2 và giới hạn lời nhắn ở 500 ký
tự. Dữ liệu chỉ tồn tại trên trình duyệt và thiết bị hiện tại; hai thiết bị khác
nhau không tự động nhìn thấy cùng dữ liệu.

## Deploy Vercel

1. Đẩy repository lên GitHub.
2. Import repository trong Vercel.
3. Giữ framework preset là Next.js.
4. Không cần Environment Variables.
5. Chọn Deploy.

Trạng thái chức năng và điểm tiếp tục nằm tại `docs/IMPLEMENTATION_PLAN.md`.
