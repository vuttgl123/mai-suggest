# Trang chi tiết Bộ sưu tập theo phong cách Editorial Diary

## Mục tiêu

Làm mới `/catalogue/[slug]` để khoảnh khắc mở một card có cảm giác như mở một
trang nhật ký đã được biên tập: ảnh dẫn nhịp, câu chuyện dễ đọc và các lời nhắn
trở thành vật kỷ niệm. Thiết kế kế thừa Bordeaux Diary và các theme theo mùa;
không biến trang thành catalogue thương mại hay thêm hiệu ứng phô trương.

## Phạm vi

1. Giữ route, Server Component, truy vấn Supabase, RLS và nội dung thật hiện
   có. Không tạo migration, seed, API route hay client-side query mới.
2. Tái cấu trúc phần trình bày của `CatalogueDetail` thành ba vùng rõ ràng:
   hero câu chuyện, lưu niệm và góc nhìn/engagement hiện có.
3. Giữ shared-image View Transition từ card sang ảnh hero và navigation
   forward/back hiện có; chỉ tinh chỉnh motion/CSS trong phạm vi trang này.
4. Bảo toàn back link, link ngoài, focus ring, touch target tối thiểu 44px và
   reduced motion. Không thay đổi copy hoặc quy tắc nghiệp vụ của đánh giá và
   bình luận.

## Trải nghiệm và bố cục

### 1. Hero: trang nhật ký được mở ra

- Back link đứng đầu như dấu trang quay lại Bộ sưu tập.
- Trên desktop, ảnh hero và phần chữ là một spread có tỷ lệ bất đối xứng: ảnh
  chiếm ưu thế nhưng không vượt quá chiều cao đọc thoải mái; nội dung căn dọc
  để tiêu đề là điểm dừng tự nhiên. Ảnh tiếp tục mang `ViewTransition` name
  theo item id để morph từ card sang hero.
- Trên mobile, ảnh đứng đầu, sau đó là kicker danh mục, tiêu đề, summary và
  metadata; không khóa chiều cao viewport hay yêu cầu cuộn ngang.
- Price, địa chỉ và external links thuộc lớp “thông tin bên lề”: price là dòng
  nhấn nhẹ; địa chỉ có icon; links là chip có viền và icon external. Mô tả dài
  nằm ở một vùng “Câu chuyện” được ngăn bằng diary rule/border mảnh, giúp đọc
  tuần tự thay vì cạnh tranh với metadata.
- Trường dữ liệu vắng mặt không để lại khoảng trống hoặc nhãn trống. Ảnh vắng
  mặt tiếp tục dùng placeholder trái tim hiện có, ở tỷ lệ và sắc độ của hero.

### 2. Những điều muốn nói: các mảnh lưu niệm

- Section vẫn giữ tên hiện có, nhưng heading theo đúng nhịp câu chuyện ở hero.
- Mỗi keepsake là tờ giấy gọn: số thứ tự lớn nhưng độ tương phản thấp, nhãn loại
  nội dung, title (khi có) và body whitespace-preserving. Card có khoảng thở,
  background paper và shadow mềm theo token theme hiện có.
- Một cột tại 320/390px; hai cột từ `md`. Card không dùng stagger JavaScript;
  điều này tránh hydration chỉ vì trang trí và không tạo motion khó chịu khi
  đọc.
- Empty state giữ thông điệp dịu hiện có, nhưng căn giữa và spacing tương ứng
  với hệ lưu niệm thay vì giống một error panel.

### 3. Để lại một dấu ấn

- `CatalogueEngagementPanel` tiếp tục được render sau keepsakes và nhận đúng
  props hiện có (`actorId`, `canManage`, `engagement`, `itemId`). Không đổi
  client/server boundary, Server Action, validation hay RLS.
- Khung section chuyển thành phần kết của câu chuyện: nền wash tinh tế, heading
  và khoảng cách đọc rõ ràng. UI nội bộ của panel chỉ được chỉnh khi cần để hòa
  với spacing và bề mặt xung quanh, không refactor nghiệp vụ hay copy.

## Kiến trúc component và luồng dữ liệu

`src/app/catalogue/[slug]/page.tsx` giữ nguyên vai trò server: xác thực actor,
tải item/category/engagement và xử lý `notFound`/error. Không có data fetch mới
trong client component.

`CatalogueDetail` được chia thành presentation unit nhỏ, cùng file nếu vẫn gọn
hoặc các file cạnh nhau nếu cần thiết:

```
CatalogueDetail (server-safe presentational composition)
  ├─ CatalogueDetailHero
  │    └─ CatalogueItemImage + shared ViewTransition
  ├─ CatalogueKeepsakeCollection
  │    └─ KeepsakeCard
  └─ CatalogueEngagementPanel (client, không đổi boundary)
```

Các unit chỉ nhận read model đã có (`CatalogueItemDetail`, `ItemKeepsake`,
`ItemEngagementView`) và semantic props. Không tạo boolean prop dàn trải, không
đưa Supabase client, secret hoặc state animation vào chúng.

## Motion, accessibility và performance

- Dùng React View Transition và biến CSS hiện có cho thao tác navigation; giữ
  ảnh morph và chỉ dùng fade/translate rất ngắn ở page level. Không đưa Motion
  hoặc `useEffect` vào trang nếu không có tương tác mới cần state.
- Tôn trọng `prefers-reduced-motion`: animation/transitions hiện có đã giảm về
  gần 0; mọi class animation mới phải cùng tuân thủ quy tắc đó.
- Ảnh có `alt` thật hoặc fallback title; icon trang trí `aria-hidden`; link ngoài
  dùng tên mô tả và `rel="noreferrer"`; focus luôn hiển thị rõ trên nền của mọi
  theme. Back link và chips giữ `min-h-11`.
- Tái dùng CSS token (`--color-*`, `--theme-*`, radius, shadow, duration), không
  hard-code bảng màu chỉ hoạt động với Bordeaux. Tránh ảnh nền mới, font mới,
  thư viện UI/animation mới, layout shift và bundle client tăng không cần thiết.

## Trạng thái lỗi và dữ liệu biên

- `NOT_FOUND`, access redirect, lỗi tải item/category/engagement vẫn do page
  hiện có xử lý; refactor presentation không nuốt hoặc thay đổi lỗi.
- Hero phải render tốt với mọi tổ hợp thiếu ảnh, summary, price, address,
  description, links hoặc keepsakes. URL link ngoài tiếp tục được encode/render
  từ dữ liệu đã xác thực bởi luồng hiện tại.
- Tất cả trạng thái mutation, lỗi và quyền trong engagement panel giữ nguyên.

## Kiểm chứng sau triển khai

1. Kiểm tra type/lint/build theo script dự án: `rtk tsc`, `rtk npm run lint`,
   `rtk next build` (hoặc lệnh tương đương nếu `rtk` không hỗ trợ script).
2. Browser QA trên `/` và item detail tại 320, 390, 768, 1024, 1440px: shared
   image transition, hero, text dài, thiếu dữ liệu, card keepsake, link ngoài,
   engagement, hover và focus.
3. Browser QA keyboard và `prefers-reduced-motion`: skip link/back link/chips
   truy cập được, không có focus bị che, navigation không còn transform/animation
   đáng kể khi giảm motion.
4. Đối chiếu diff: chỉ presentation/CSS/test liên quan; không có thay đổi schema,
   RLS, credential, `.env.local`, mock data hoặc mã ngoài phạm vi.

## Không thuộc phạm vi

- Modal/drawer thay cho route chi tiết, carousel/gallery, upload ảnh, map nhúng,
  favorite/reaction mới, realtime, rating/comment feature mới.
- Thay đổi Google OAuth, role, allowed user, Supabase schema/RLS/Dashboard,
  backend service tách riêng, mock/JSON data hay thư viện phụ thuộc mới.
