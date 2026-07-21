# Thiết kế: Không khí giao diện theo mùa và sự kiện

## Mục tiêu

Mai Suggest cần có thể thay đổi không khí theo mùa hoặc dịp đặc biệt mà vẫn giữ
bản sắc Bordeaux Diary và không phải sửa từng trang. Owner điều phối thời điểm
áp dụng; mọi người xem cùng một giao diện nhất quán.

Hệ thống ưu tiên các preset được duyệt trong mã nguồn thay vì cho nhập CSS hoặc
màu tùy ý. Cách này giữ được độ tương phản, chất lượng thị giác và sự ổn định
trong lúc ứng dụng tiếp tục phát triển.

## Quyết định đã chốt

- Mô hình được chọn là **preset có lịch tự động, kèm ghi đè thủ công của Owner**.
- Theme mặc định luôn là `bordeaux`; nếu chưa có cấu hình, cấu hình không hợp lệ
  hoặc không có lịch đang hiệu lực, ứng dụng dùng theme này an toàn.
- Toàn bộ active member, người đang đăng nhập và khách ở các trang công khai đều
  nhìn thấy theme hiệu lực giống nhau. Đây là không khí chung của không gian,
  không phải tuỳ chọn cá nhân.
- Owner là vai trò duy nhất được chỉnh ghi đè và lịch. Quyền này được bảo vệ ở
  Server Action, repository và Supabase RLS; không chỉ ẩn nút trên client.
- Màu, typography nền và trang trí chỉ thay đổi qua token đã kiểm duyệt. Không có
  custom CSS, ảnh nền tải lên, mã màu tự do hoặc trình dựng theme ở giai đoạn này.

## Preset ban đầu

| Key | Tên hiển thị | Cảm giác |
| --- | --- | --- |
| `bordeaux` | Bordeaux Diary | Đỏ Bordeaux, giấy ngà, đồng tiết chế; là mặc định. |
| `valentine` | Lời hẹn tháng Hai | Ruby sâu, ngà hồng rất nhẹ và ánh đồng ấm. |
| `spring` | Mùa xuân dịu dàng | Berry trầm, giấy sáng, xanh sage làm điểm nhấn kín đáo. |
| `noel` | Đêm cuối năm | Bordeaux, xanh evergreen và vàng champagne. |
| `anniversary` | Chương kỷ niệm | Wine đậm, vàng cổ và ánh sáng mang tính nghi thức. |

Các preset vẫn dùng nền giấy, sắc đỏ đậm và typography hiện có; không biến sản
phẩm thành giao diện hồng ngọt, nhiều sticker hoặc theo xu hướng thương mại.
Trang trí là các lớp màu, grain và họa tiết trừu tượng rất nhẹ, không dùng ảnh
minh họa hay biểu tượng lễ hội quá trực diện.

## Quy tắc xác định theme hiệu lực

1. Nếu `manual_theme_key` có giá trị hợp lệ, dùng preset này cho toàn bộ site.
2. Nếu Owner chọn chế độ tự động, tìm lịch đang bật có khoảng thời gian chứa thời
   điểm hiện tại.
3. Khi nhiều lịch cùng hiệu lực, chọn lịch có `priority` cao hơn; nếu bằng nhau,
   chọn lịch có `starts_at` mới hơn, sau đó dùng `id` để kết quả luôn xác định.
4. Nếu không có lịch hợp lệ, dùng `bordeaux`.

`starts_at` và `ends_at` lưu theo `timestamptz`. Giao diện quản lý nhận thời gian
theo `Asia/Ho_Chi_Minh`, chuyển thành thời điểm tuyệt đối trước khi lưu. Mỗi lịch
phải có `ends_at` muộn hơn `starts_at`.

## Kiến trúc và luồng dữ liệu

### Registry an toàn trong mã nguồn

`src/modules/site-theme` là bounded context mới. Registry của context định nghĩa
union type `SiteThemeKey`, tên hiển thị, mô tả ngắn và hàm kiểm tra key hợp lệ.
CSS là nơi duy nhất định nghĩa token màu cho từng key. Cơ sở dữ liệu chỉ lưu key,
không lưu raw CSS hay object style.

Nhờ registry, một key cũ hoặc dữ liệu bị sửa sai không thể làm hỏng trang: trình
resolver sẽ bỏ qua key lạ và rơi về `bordeaux`.

### Dữ liệu Supabase

Migration kế tiếp sẽ tạo hai bảng:

```text
site_theme_settings
  id                   singleton, luôn là bản ghi global
  manual_theme_key     nullable; null nghĩa là tự động
  updated_by           tham chiếu profiles, nullable khi cần giữ cấu hình
  created_at, updated_at

site_theme_schedules
  id
  theme_key
  starts_at, ends_at
  priority             số nguyên không âm, mặc định 0
  is_enabled           mặc định true
  created_by           tham chiếu profiles
  created_at, updated_at
```

Migration thêm constraint cho singleton, key nằm trong tập preset, `ends_at >
starts_at`, timestamp trigger hiện có và index phục vụ truy vấn lịch đang hiệu
lực. RLS được bật trên cả hai bảng:

- `anon` và `authenticated` chỉ được đọc cấu hình công khai tối thiểu cần để vẽ
  giao diện; không có nội dung cá nhân, email hay metadata Google trong các bảng.
- Chỉ authenticated Owner được thêm, sửa hoặc xóa setting và schedule.
- Member, inactive member và anonymous không có quyền ghi.

Không cần service-role key, và resolver dùng server Supabase client thường với
RLS thay vì bỏ qua mô hình quyền.

### Resolver ở server

Root layout trở thành async Server Component, đọc theme hiệu lực trước khi trả
HTML rồi gắn `data-theme="<key>"` lên `body`. Nhờ vậy first paint đã có đúng
theme; không có client query hoặc hiện tượng chớp Bordeaux trước khi đổi theme.

Reader Supabase trả về setting và lịch; application use case áp dụng thứ tự ưu
tiên ở trên và trả về `ResolvedSiteTheme`. Nếu request dữ liệu thất bại, root
layout vẫn render preset mặc định và không làm hỏng trang chỉ vì trang trí.

### Token và không khí trực quan

`globals.css` giữ semantic token chung như surface, ink, border, brand, focus,
success và danger. Các selector `[data-theme="…"]` chỉ ghi đè token màu và token
trang trí như nền, vầng sáng, grain, đường viền và ánh kim. Shared shell/header/
button sẽ dần dùng token semantic này thay cho mã màu Bordeaux viết trực tiếp.

Không dùng `ViewTransition` cho việc đổi theme vì đó không phải quan hệ không
gian giữa các màn hình. Khi route đã render, lớp trang trí nền có thể fade ngắn
bằng `opacity` và `transform`; mọi animation chỉ chạy trên compositor. Với
`prefers-reduced-motion: reduce`, các lớp vẫn hiện tĩnh và nghi thức không có
chuyển động liên tục.

## Trải nghiệm Owner

Owner có mục **Không khí giao diện** trong `/admin`. Màn hình gồm:

1. Thẻ “Đang hiển thị” ghi preset hiện tại và lý do: ghi đè thủ công, lịch nào
   đang áp dụng hoặc mặc định Bordeaux.
2. Nhóm chọn chế độ: **Tự động theo lịch** hoặc một preset thủ công. Chọn tự động
   đặt `manual_theme_key` về null nhưng không xóa lịch đã tạo.
3. Thư viện preset với preview nhỏ, tên và mô tả cảm xúc để Owner chọn tự tin.
4. Danh sách lịch có thời gian Việt Nam, priority, trạng thái bật/tắt, nút sửa và
   xóa.
5. Form tạo/sửa lịch: preset, ngày giờ bắt đầu, ngày giờ kết thúc, priority và
   trạng thái. Thông báo rõ nếu một lịch có thể bị lịch khác ưu tiên cao hơn che
   mất.

Trang quản lý không cung cấp preview riêng biệt cố định; sau khi lưu hợp lệ,
theme hiệu lực được hiển thị nhất quán khi Owner điều hướng hoặc tải lại. Không
cần realtime, thông báo lịch hoặc cron: resolver tự đổi ở request đầu tiên sau
thời điểm lịch bắt đầu/kết thúc.

## Ranh giới phạm vi

Bao gồm: 5 preset đầu, token CSS, shell decorator tiết chế, resolver server,
schema/RLS, Server Actions Owner, trang quản lý và refactor màu trực tiếp trong
shared UI cần thiết để theme có tác dụng đồng đều.

Không bao gồm: custom theme builder, ảnh nền/asset do người dùng tải lên, theme
riêng theo từng member, tự xác định mùa theo vị trí, notification, cron, thay đổi
nội dung catalogue/timeline/lá thư hay đổi Google OAuth/role model.

Khi cần theme mới trong tương lai, thêm một key vào registry và selector token
CSS, sau đó Owner có thể đặt lịch mà không phải sửa các page nghiệp vụ.

## Xác minh khi triển khai

- Theme mặc định hoạt động khi bảng trống, key lạ hoặc Supabase không phản hồi.
- Manual override thắng lịch và bỏ ghi đè trả lại đúng lịch/mặc định.
- Lịch tự đổi đúng ở ranh giới thời gian Việt Nam; overlap tuân theo priority,
  `starts_at`, rồi `id`.
- Anonymous và member chỉ đọc cấu hình; chỉ Owner ghi được qua action và RLS.
- Kiểm tra trên login, catalogue, timeline, thư hẹn ngày mở và admin ở 320, 390,
  768, 1024, 1440 px; không tràn chữ, không cản click, focus vẫn rõ.
- Kiểm tra reduced motion: không có chuyển động nền lặp nhưng các màu/pattern vẫn
  đủ đọc.
- Trước bàn giao, người dùng chạy `npx.cmd tsc --noEmit` và `npm.cmd run build`;
  migration chỉ được áp dụng sau khi người dùng chủ động duyệt SQL.
