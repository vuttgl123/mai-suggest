# Dòng thời gian trưởng thành của hai đứa

## Mục tiêu

Tạo một không gian chung tại `/hanh-trinh` để các thành viên active cùng đọc lại
những cột mốc của hai người: không chỉ là ngày tháng đã đi qua, mà là những điều
đã cùng học được, đã cùng vượt qua và đang tiếp tục chọn nhau mỗi ngày.

Owner là người duy nhất tạo, sửa, xóa và sắp xếp các mốc. Mọi thành viên active
đọc được các mốc đã công khai, đồng thời có thể để lại hồi đáp/kỷ niệm của riêng
mình; hồi đáp hiển thị cho toàn bộ thành viên. Mỗi người chỉ sửa hoặc xóa hồi
đáp của chính mình; Owner có thể xóa hồi đáp để quản trị nội dung.

Phạm vi này thêm schema/RLS và module DDD `timeline` độc lập. Không thay đổi
Google OAuth, catalogue, engagement hiện có, role hiện hành hoặc dùng mock data.

## Trải nghiệm

### Public `/hanh-trinh`

Trang dùng nền giấy ngà và Bordeaux sâu như catalogue, nhưng mang nhịp chậm,
riêng tư hơn:

1. **Lời mở đầu** — hero gọn, một eyebrow nhỏ và title về hành trình trưởng
   thành; không có số liệu hoặc CTA thương mại.
2. **Đường chỉ thời gian** — đường dọc mảnh màu Bordeaux/đồng. Trên desktop,
   mốc nội dung xen kẽ hai bên đường; mobile thu về một cột, đường chỉ ở lề trái
   để đọc tự nhiên.
3. **Mốc kỷ niệm** — nhãn thời kỳ/ngày, title, ảnh tùy chọn, câu chuyện dài và
   một đoạn "điều mình đã học được" nếu Owner chọn viết. Card có số thứ tự rất
   mờ, hiệu ứng hover/fade nhẹ và không dùng chuyển động làm người đọc mất tập
   trung.
4. **Góc hồi đáp** — mỗi mốc có danh sách lời nhắn theo thời gian, avatar tròn,
   tên Google lấy từ `profiles.display_name`, thời điểm viết và nội dung. Tên
   không phải field người dùng truyền từ browser. Member thấy form "Viết một
   điều mình muốn giữ lại"; người đã viết thấy controls Sửa/Xóa của chính họ.
5. **Empty state** — chỉ báo rằng hành trình đang chờ mốc đầu tiên, không tạo
   nội dung hay ảnh giả.

Header thêm link `Hành trình` cho active member. Link này có transition nhẹ như
những navigation hiện có; `prefers-reduced-motion` vẫn tắt animation.

### Owner workspace `/admin/hanh-trinh`

Owner có một workspace riêng, không làm editor catalogue hiện có phình thêm:

- Masthead ngắn, link về public timeline và tổng số mốc công khai/bản nháp.
- Desktop: list mốc bên trái, editor ở bên phải; mobile: list trước, editor sau.
- Mỗi row list hiển thị nhãn thời kỳ, title, trạng thái và số hồi đáp.
- Editor chia ba cụm: **thời điểm & câu chuyện**, **ảnh & hiển thị**, **hồi đáp**.
  Cụm hồi đáp chỉ để Owner đọc và xóa moderation; Owner không sửa nội dung mang
  tên người khác.
- Mốc mới mặc định draft. Chỉ mốc `is_published = true` mới có mặt ở public
  timeline và nhận hồi đáp.

UI tiếp tục hệ compact đã được duyệt: display type vừa phải, controls tối thiểu
44px, body copy dễ đọc, form grouping rõ và khoảng trắng đủ để nội dung tình cảm
không bị nặng nề.

## Dữ liệu

### `public.timeline_entries`

| Cột | Kiểu | Quy tắc |
| --- | --- | --- |
| `id` | `uuid` | Primary key, mặc định `gen_random_uuid()` |
| `date_label` | `text` | Bắt buộc, tối đa 80 ký tự; ví dụ “Mùa thu 2024” |
| `occurred_on` | `date` | Tùy chọn cho mốc có ngày chính xác |
| `title` | `text` | Bắt buộc, tối đa 160 ký tự |
| `story` | `text` | Bắt buộc, tối đa 8.000 ký tự |
| `lesson` | `text` | Tùy chọn, tối đa 1.000 ký tự; suy ngẫm của mốc |
| `image_url` | `text` | Tùy chọn; URL ảnh đã được Owner cung cấp |
| `image_alt_text` | `text` | Tùy chọn; bắt buộc tại application layer khi có `image_url` |
| `sort_order` | `integer` | Không âm; quyết định thứ tự kể chuyện |
| `is_published` | `boolean` | Mặc định `false` |
| `created_by` | `uuid` | FK `profiles.id`, `on delete set null` |
| `created_at`, `updated_at` | `timestamptz` | Mặc định `now()`, trigger cập nhật `updated_at` |

Index `timeline_entries_visible_order_idx` trên `(is_published, sort_order,
occurred_on)` cho public ordered reads. Không dùng JSON cho mốc vì mốc cần query,
sắp xếp, RLS và quản lý độc lập.

### `public.timeline_responses`

| Cột | Kiểu | Quy tắc |
| --- | --- | --- |
| `id` | `uuid` | Primary key, mặc định `gen_random_uuid()` |
| `timeline_entry_id` | `uuid` | FK `timeline_entries.id`, `on delete cascade` |
| `user_id` | `uuid` | FK `profiles.id`, `on delete cascade` |
| `content` | `text` | Bắt buộc, 1–2.000 ký tự |
| `created_at`, `updated_at` | `timestamptz` | Mặc định `now()`, trigger cập nhật `updated_at` |

Index `timeline_responses_entry_created_idx` trên `(timeline_entry_id,
created_at)` cho danh sách lời hồi đáp theo mốc và index
`timeline_responses_user_idx` trên `user_id` cho ownership policy. Không lưu
tên/ảnh ở response: public reader lấy `display_name` và `avatar_url` hiện tại từ
`profiles`, vốn được trigger Google OAuth hiện có đồng bộ.

## RLS và phân quyền

Migration phải grant `select, insert, update, delete` cho `authenticated`, bật
RLS cho hai bảng và revoke toàn bộ quyền của `anon`.

| Tài nguyên | Active member | Owner |
| --- | --- | --- |
| Published timeline entry | Select | Select |
| Draft timeline entry | Không thấy | Full manage |
| Timeline response trên published entry | Select | Select |
| Tạo response | Chỉ `user_id = auth.uid()` | Có thể tạo như member |
| Sửa response | Chỉ row có `user_id = auth.uid()`; `WITH CHECK` giữ user ID | Không sửa nội dung của người khác |
| Xóa response | Chỉ row có `user_id = auth.uid()` | Có thể xóa moderation |

Tất cả policy dùng `TO authenticated` cùng `private.is_active_member()` hoặc
`private.is_owner()` hiện hữu, và gọi helper thông qua `(select ...)`. Không dùng
`raw_user_meta_data`, Google name hay UI check để ra quyết định quyền. Policy
update có cả `USING` và `WITH CHECK`; response insert phải xác nhận parent entry
đang published. Mô hình này phù hợp với khuyến nghị RLS hiện tại của Supabase về
table exposed, policy ownership và index policy columns.

## DDD và luồng dữ liệu

Thêm bounded context `src/modules/timeline`:

- `domain`: read/admin models, input validation và author model nhận từ profile.
- `application`: public reader, owner admin reader, repositories và use cases
  `ManageTimelineEntry`, `ManageTimelineResponse`.
- `infrastructure`: Supabase reader/repository, mapper typed từ
  `Database["public"]["Tables"]`; query profiles theo tập `user_id`, không gọi
  query cho từng response.
- `presentation`: Server Actions gọi qua `runServerAction`; action kiểm tra
  active actor/Owner use case lại trên server.

`create-server-backend.ts` được mở rộng để compose timeline context. Public page
là Server Component, tải actor và timeline data song song khi độc lập. Hồi đáp
là một Client Component nhỏ dùng `useTransition`, sau mutation gọi Server Action
và `router.refresh`; không query Supabase server-only từ browser component.

Database type hand-written hiện tại được mở rộng với hai table row/insert/update
types; không tạo `any` để né TypeScript strict.

## Xử lý lỗi và accessibility

- Invalid/too-long input trả lỗi validation rõ, không log nội dung hồi đáp hoặc
  credential.
- Member cố truy cập admin nhận luồng access denied hiện có; response đến draft
  hoặc không tồn tại trả `NOT_FOUND`/`ACCESS_DENIED`, không rò title/nội dung.
- Form dùng `aria-live` cho save/error, label thật, focus sau thao tác và submit
button pending state. Avatar thiếu URL có monogram từ chữ đầu của display name.
- Nội dung dài `whitespace-pre-line`; không clamp câu chuyện, lesson hay reply.

## Không thuộc phạm vi

- Reaction/like, notification, realtime, upload Storage, emoji picker, mention
  hoặc export timeline.
- Member tạo/sửa timeline entry, Owner chỉnh nội dung reply của người khác,
  profile self-edit hoặc thay đổi role/access list.
- Seed mock entry/response, thay đổi catalogue hoặc Google OAuth.

## Kiểm chứng

Không thêm test mới theo yêu cầu hiện tại. Sau khi triển khai và migration được
user áp dụng, kiểm tra:

1. Active member đọc mốc published, không đọc draft; inactive/anonymous bị chặn.
2. Owner tạo draft, publish, sắp xếp, cập nhật và xóa mốc; response cascade khi
   xóa mốc.
3. Hai member: mỗi người tạo reply, thấy tên Google/profile, chỉ sửa/xóa reply
   của mình; Owner xóa moderation được nhưng không có action sửa nội dung đó.
4. `npx.cmd tsc --noEmit`, `npm.cmd run build`, và browser QA ở 320, 390, 768,
   1024, 1440px, gồm keyboard focus và reduced motion.
