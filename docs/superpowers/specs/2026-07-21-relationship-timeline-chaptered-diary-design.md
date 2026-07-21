# Hành trình theo phong cách Cuốn sách chương hồi

## Mục tiêu

Refactor `/hanh-trinh` để các cột mốc được đọc như những chương của một cuốn
nhật ký chung: mốc đầu mở ra một trang nổi bật, các mốc tiếp theo nối thành
mạch ký ức có nhịp điệu. Trang vẫn thuộc hệ Bordeaux Diary, ưu tiên câu chuyện
và khoảng thở hơn hiệu ứng hoặc bố cục dạng mạng xã hội.

## Phạm vi

1. Không thay đổi route, page server, truy vấn Supabase, read model, Server
   Action, schema, migration, RLS, auth, role hay dữ liệu thật.
2. Chỉ refactor presentation của `RelationshipTimeline`: hero, mốc đầu nổi
   bật, danh sách chương và bề mặt section hồi đáp hiện có.
3. Giữ `TimelineResponsePanel` là client component duy nhất liên quan đến thao
   tác; mọi component mới chỉ nhận `TimelineEntry` và `ActiveActor` đã được
   server tải.
4. Giữ skip link, AppHeader, empty state, fallback ảnh, text dài, focus ring,
   touch target và reduced-motion hiện có. Không thêm dependency hoặc ảnh/font
   mới.

## Trải nghiệm và bố cục

### Lời mở đầu

Hero vẫn ngắn gọn và căn giữa, nhưng có một diary rule và nhịp spacing dẫn mắt
tới timeline. Copy, icon BookHeart và dữ liệu không đổi; thay đổi chỉ nằm ở
hierarchy/spacing để nó giống lời đề từ trước khi mở chương đầu.

### Chương đang mở

Khi có entries, phần tử đầu tiên là **“Chương đang mở”**. Trên desktop, nó là
một editorial spread: ảnh bên trái (khi có), title/story/bài học bên phải, ngày
tháng như bookmark. Trên mobile, ảnh đi trước nội dung, không khóa chiều cao
viewport hoặc buộc cuộn ngang.

Không coi mốc đầu là mốc mới nhất hay mốc quan trọng hơn ở tầng dữ liệu; đây chỉ
là cách trình bày dựa trên thứ tự entries do use case hiện có cung cấp. Mốc này
vẫn render đủ `TimelineResponsePanel` ngay sau story/bài học.

### Những chương đã viết

Các entries còn lại đặt sau heading **“Những chương đã viết”**, được nối bằng
timeline rail hiện có. Desktop giữ nhịp so le trái/phải, còn mobile là một dòng
đọc liền mạch ở một cột. Mỗi card có marker chương theo thứ tự, dateLabel,
occurredOn (khi có), title, ảnh (khi có), story và lesson (khi có).

Card là bề mặt giấy có divider/rule mảnh và số thứ tự độ tương phản thấp; không
thêm hover lift vào card vì nội dung chính là đọc và viết hồi đáp. Khi không có
ảnh hoặc lesson, card tự khép khoảng trống mà không để nhãn rỗng.

### Kết nối bằng hồi đáp

`TimelineResponsePanel` giữ hành vi và copy hiện có. Presentation outer wrapper
được nới khoảng cách và border để nó là phần “để lại dấu ấn” sau câu chuyện,
không cạnh tranh với date/title. Không đổi mutation, refresh, validation,
feedback, tác giả, quyền author/owner hoặc bất kỳ logic client nào.

## Kiến trúc component và luồng dữ liệu

`src/app/hanh-trinh/page.tsx` tiếp tục xác thực actor, gọi
`listVisibleTimeline` và truyền kết quả vào `RelationshipTimeline`. Không thêm
request hoặc serialization xuống client.

```
RelationshipTimeline (server-safe composition)
  ├─ TimelineIntro
  ├─ TimelineFeaturedChapter (entries[0])
  │    └─ TimelineResponsePanel (client, existing)
  └─ TimelineChapterRail (entries.slice(1))
       └─ TimelineChapterCard
            └─ TimelineResponsePanel (client, existing)
```

Các component mới/các hàm tách ra chỉ nhận `entry: TimelineEntry`, `actorId` và
`canManage`. `TimelineResponsePanel` tiếp tục nhận `entryId`, `responses`,
`actorId`, `canManage` đúng như hiện tại. Không có Supabase client, secret,
hook hay `"use client"` trong presentation mới.

## Motion, accessibility và hiệu năng

- Chỉ giữ PageTransition/navigation hiện có. Không thêm ViewTransition mới vì
  các chapter không có điều hướng hoặc state change mang quan hệ không gian cần
  diễn tả.
- Không thêm animation/stagger JavaScript. Nếu có CSS transition trên control,
  nó phải dùng token duration và `motion-reduce` hiện có.
- Mỗi heading giữ level tuần tự (`h1` của trang, `h2` cho featured/list
  sections, `h3` cho chapter). `timeline-heading` tiếp tục có tên accessible;
  số chương và trang trí được `aria-hidden`.
- `CatalogueItemImage` giữ alt do admin cung cấp, skeleton/error fallback và
  lazy loading. Ảnh không dùng URL hoặc component mới.
- Hồi đáp giữ focus flow, aria-live và target 44px trong client component đã có.

## Trạng thái lỗi và dữ liệu biên

- Access redirect/lỗi tải timeline tiếp tục do page hiện có xử lý.
- Không có entry: giữ empty state và CTA Owner hiện có; member khác không thấy
  CTA quản trị.
- Với entry thiếu `imageUrl`, `imageAltText`, `occurredOn` hoặc `lesson`, chỉ
  phần tương ứng bị ẩn; story và hồi đáp vẫn xuất hiện bình thường.
- Text title/story/lesson/response dài phải bọc dòng trong container; không
  dùng truncate hoặc clamp để che nội dung kỷ niệm.

## Kiểm chứng sau triển khai

Theo chỉ dẫn hiện tại của người dùng, không chạy automated test, lint, build
hoặc browser QA cho đợt refactor này. Khi người dùng yêu cầu kiểm chứng trở lại,
phạm vi cần gồm empty state, one-entry state và multi-entry state tại 320, 390,
768, 1024, 1440px; ảnh thiếu/ảnh lỗi, text dài, form hồi đáp, focus keyboard và
`prefers-reduced-motion`.

## Không thuộc phạm vi

- Tạo/sửa/xóa mốc trong user-facing timeline, reorder, filter/search, chapter
  navigation, map, gallery/carousel, share, reaction/rating mới, realtime hoặc
  thông báo.
- Bất kỳ thay đổi nào đến Supabase, Google OAuth, permissions, schema/RLS,
  Server Actions, mock data, dependencies, route hoặc nội dung admin.
