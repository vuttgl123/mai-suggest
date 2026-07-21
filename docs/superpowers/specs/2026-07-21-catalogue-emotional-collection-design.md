# Bộ sưu tập theo nhịp cảm xúc và góc nhìn chung

## Mục tiêu

Biến trang Bộ sưu tập từ một lưới gợi ý thuần túy thành một hành trình biên
tập, ngắn gọn và giàu cảm xúc hơn: chọn một chương, mở một điều nổi bật, rồi
đọc những điều còn lại. Trên từng item, hai người có thể lưu lại mức độ yêu
thích và lời nhận xét thật của mình.

Giao diện tiếp tục thuộc hệ **Bordeaux Diary**: đỏ Bordeaux sâu, nền giấy ngà,
điểm nhấn đồng tiết chế. Không dùng nội dung giả, không biến sản phẩm thành
trang thương mại hoặc mạng xã hội.

## Phạm vi

### Trang Bộ sưu tập (`/`)

1. Hero được rút gọn thành lời dẫn biên tập và số lượng điều đang được lưu.
   Nó dẫn vào bộ sưu tập thay vì chiếm gần hết viewport đầu tiên.
2. Phần danh mục đổi thành **“Chọn một chương hôm nay”**. Danh mục dùng dữ liệu
   thật (`name`, `description`, `coverImageUrl`, `icon`) và link lọc hiện có;
   cover trống dùng nền Bordeaux có texture, không tạo ảnh hay tên danh mục giả.
3. Ở trang 1 của mọi lựa chọn danh mục, item đầu tiên trở thành khối editorial
   **“Điều muốn mở ra trước”**: ảnh lớn hơn, nhãn danh mục, tóm tắt và CTA
   “Mở câu chuyện”. Các item còn lại là card nhỏ gọn hơn. Từ trang 2 trở đi,
   chỉ hiển thị lưới thông thường để không nhắc lại item nổi bật.
4. Pagination giữ query string và URL hiện có, với copy dịu hơn: **“Xem thêm
   những điều đã lưu”**. Không thêm lọc, tìm kiếm, sắp xếp hoặc mock data trong
   đợt này.
5. Link, focus ring, touch target tối thiểu 44px, shared image View Transition,
   `prefers-reduced-motion` và responsive hiện có phải được giữ lại.

### Góc nhìn của chúng mình (`/catalogue/[slug]`)

1. Giữ phần thông tin item và **“Những điều muốn nói”** hiện có. Bổ sung một
   section độc lập ngay sau đó là **“Góc nhìn của chúng mình”**.
2. Mỗi active member có chính xác một đánh giá riêng cho mỗi item: 1–5 sao và
   một lời nhận xét tùy chọn tối đa 1.000 ký tự. Đây là dữ liệu từ bảng
   `ratings`, không phải `external_rating` của địa điểm/sản phẩm.
3. Danh sách đánh giá hiển thị tên Google đã được đồng bộ vào
   `profiles.display_name`, avatar khi có, số sao, lời nhận xét và thời điểm
   chỉnh sửa. Không tính hay quảng bá một “điểm trung bình”; mục đích là nhìn
   thấy góc nhìn của từng người.
4. Bên dưới là các lời bình từ bảng `comments`: tất cả active member đọc được,
   tác giả sửa/xóa lời của mình, Owner có thể gỡ lời của người khác. Mỗi lời
   bình giới hạn 1–2.000 ký tự và dùng cùng cách hiển thị tên Google/avatar.
5. Form chấm sao và viết lời bình chỉ được hydrate ở section này. Server
   Component tải toàn bộ dữ liệu ban đầu; sau Server Action thành công, client
   gọi `router.refresh()` để nhận lại dữ liệu được RLS kiểm soát.

## Dữ liệu, quyền và kiến trúc

- Không tạo migration, bảng, RLS hay seed mới. Dùng `ratings`, `comments`,
  `profiles` và policies hiện có.
- RLS hiện có cho phép active member đọc ratings/comments/profiles, ghi dữ liệu
  mang `user_id = auth.uid()`, sửa dữ liệu của mình; Owner được gỡ rating hoặc
  comment. UI chỉ phản ánh quyền này, không tự quyết định quyền.
- Bổ sung read model dành cho presentation: `ItemEngagementView` có state của
  người đang xem cùng rating/comment đã được gắn `EngagementAuthor`
  (`displayName`, `avatarUrl`). Query ratings/comments chạy song song; profiles
  được đọc một lần theo tập `user_id` duy nhất rồi map bằng `Map`.
- `ManageItemEngagement` và các Server Action mutation hiện có tiếp tục là
  boundary ghi dữ liệu. Validation domain và giới hạn database giữ nguyên.
- Reader Supabase chỉ chạy ở server. Client component chỉ nhận item id, actor
  id, quyền Owner và read model đã tuần tự hóa; không nhận Supabase client,
  secret hay query database trực tiếp.

## Component và luồng dữ liệu

```
Server page /catalogue/[slug]
  ├─ getVisibleItemDetail + listVisibleCategories (song song)
  └─ getItemEngagementView sau khi đã có item.id
       ├─ ratings + comments + viewer state (song song)
       └─ profiles của các tác giả (một query)
             ↓
CatalogueDetail
  └─ ItemEngagementPanel (client)
       ├─ setMyItemRatingAction / deleteMyItemRatingAction
       └─ create/update/deleteItemCommentAction → router.refresh()
```

`CatalogueHome` chỉ dùng `CatalogueCategory` và `CatalogueItemPage` có sẵn.
Không tải ratings/comments cho từng card trong lưới, tránh N+1 request và không
đưa cảm xúc riêng tư lên card một cách gây nhiễu.

## Trạng thái và thông báo

- Nếu chưa ai chấm, section khuyến khích nhẹ nhàng để lại góc nhìn đầu tiên.
- Nếu người đang xem chưa chấm, form sao ở trạng thái tạo mới; nếu đã chấm,
  form hiển thị giá trị hiện tại và cho phép cập nhật hoặc xóa.
- Bất kỳ lỗi `ACCESS_DENIED`, `NOT_FOUND`, `VALIDATION_FAILED` hoặc lỗi bất ngờ
  từ Server Action đều có thông báo tiếng Việt, `aria-live` và không xóa nội
  dung người dùng đang nhập khi thao tác thất bại.
- Nút hủy/sửa/xóa comment dùng confirmation nội tuyến, trạng thái pending không
  cho gửi trùng. Không dùng `window.confirm`.

## Chất lượng giao diện và accessibility

- Trên 320/390px, chapter cards và featured item xếp dọc; form rating/comment
  không tràn ngang. Từ tablet trở lên, category rail và lưới dùng space hiệu
  quả nhưng không làm body copy nhỏ hơn 15px.
- Sao là button có `aria-label` rõ “Chấm N sao”, có trạng thái được chọn bằng
  text/screen-reader ngoài màu sắc. Avatar là trang trí nếu tên đã đọc; fallback
  chữ cái đầu tên chỉ mang tính hỗ trợ thị giác.
- Không thêm thư viện UI/animation. Tái dùng Tailwind, Lucide, Button, CSS
  semantic theme tokens và React View Transition hiện có.
- Bảo toàn motion mềm hiện có; không dùng client state hoặc effect chỉ để tạo
  animation trang.

## Không thuộc phạm vi

- Aggregate/average rating, reaction/like, thông báo, realtime chat, tìm kiếm,
  sort/filter mới hoặc public sharing.
- Upload ảnh qua comment, thay đổi Google OAuth, role/allowed users, schema,
  migration, Supabase Dashboard hoặc RLS.
- Mock data, data trong `public/data`, API backend tách riêng, test mới hoặc
  Git commit/push.

## Kiểm chứng sau triển khai

Theo yêu cầu hiện tại không thêm hoặc chạy test unit mới. Người dùng sẽ chạy
trên Windows/Node 24:

```bat
npx.cmd tsc --noEmit
npm.cmd run build
```

Sau đó browser QA thủ công ở 320, 390, 768, 1024 và 1440px cho `/` và một
`/catalogue/[slug]`: category, phân trang, featured card, chấm/sửa/xóa rating,
tạo/sửa/xóa comment, hiển thị tên Google, focus, text dài và reduced motion.
