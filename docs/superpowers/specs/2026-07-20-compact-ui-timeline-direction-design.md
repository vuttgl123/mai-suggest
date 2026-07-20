# Compact UI refinement and relationship timeline direction

## Mục tiêu

Thu gọn giao diện hiện có khoảng 15–20% để người dùng đọc được nhiều nội dung
hơn trong mỗi viewport mà vẫn giữ nhịp điệu sang, ấm và lãng mạn của hệ
"Bordeaux diary". Đợt này chỉ refactor presentation; không thay schema,
Supabase query, RLS, quyền truy cập hoặc dữ liệu nghiệp vụ.

Đồng thời, thống nhất hướng phát triển tiếp theo: một không gian "Dòng thời
gian trưởng thành của hai đứa". Đây là định hướng thiết kế cho một đợt riêng,
không được triển khai trong refactor compact UI này.

## Phạm vi refactor UI

### Nguyên tắc mật độ

- Giảm font display lớn nhất, padding section, gap giữa các block và padding
  card/form khoảng 15–20% trên desktop; mobile giảm vừa đủ để touch target vẫn
  tối thiểu 44px.
- Không giảm body copy dưới 15px, line-height của đoạn văn dài, contrast,
  focus state hoặc kích thước ảnh đến mức làm trải nghiệm khó đọc.
- Nền giấy ngà, Bordeaux sâu và accent đồng ấm giữ nguyên semantic token; chỉ
  điều chỉnh tỷ lệ sử dụng và khoảng trắng, không chuyển tông sang hồng.
- Chuyển động vẫn dùng View Transitions đang có, nhưng duration/easing được
  tiết chế để navigation nhanh, mềm và không kéo dài cảm nhận tải trang.
- `prefers-reduced-motion` tiếp tục vô hiệu hóa các chuyển động không cần thiết.

### Trang bộ sưu tập

- Hero giảm chiều cao: title, lead, gap và khoảng top/bottom được hạ đồng đều;
  khối tổng số item nhỏ và gọn hơn.
- Thanh lọc danh mục và pagination gần grid hơn; chip giữ touch target và focus
  ring rõ.
- Grid/card giảm padding, title scale và khoảng cách metadata để ba cột desktop
  không có cảm giác nặng, đồng thời không thay đổi data loading/phân trang.

### Trang chi tiết

- Cân bằng hero ảnh/nội dung: title hạ một bậc, gap giữa summary, metadata,
  description và link ngắn lại nhưng không dồn chữ.
- Section "Những điều muốn nói" giảm chiều cao header và card; số thứ tự,
  typography thơ/lời nhắn vẫn là điểm nhấn nhưng không chiếm quá nhiều viewport.
- Empty state được thu gọn tương ứng và vẫn không tạo nội dung giả.

### Owner workspace

- Masthead ngắn hơn, statistics/chip giảm padding nhưng giữ khả năng quét nhanh.
- Khoảng đệm toàn trang, gap ba cột và spacing section trong editor được hạ có
  hệ thống.
- Nhóm field, image/link và keepsake editor giữ hierarchy hiện có; trên mobile
  thứ tự tiếp tục là danh mục → danh sách → editor.
- Không đổi route `/admin`, Server Actions, Owner guard hoặc contract domain.

## Hướng phát triển: Dòng thời gian trưởng thành

Đợt phát triển kế tiếp nên là một timeline kể về việc hai người đã cùng lớn lên,
không chỉ liệt kê các cột mốc. Một timeline gồm:

1. Mở đầu bằng một lời dẫn ngắn về hành trình chung.
2. Mỗi mốc có ngày/thời kỳ, tiêu đề, ảnh tùy chọn, câu chuyện ngắn và một lời
   nhắn riêng.
3. Các nhóm nội dung gợi ý: gặp nhau, lần đầu cùng vượt qua khó khăn, chuyến đi,
   điều đã học được từ nhau, và hiện tại.
4. Kết thúc bằng "hôm nay" hoặc một lời hứa mở, thay vì khẳng định một đích đến.

Timeline cần database model riêng khi bắt đầu triển khai, bởi các mốc cần thứ
tự, ngày, ảnh và khả năng quản trị độc lập. Khi đó sẽ thiết kế migration,
mapping, Server Actions và RLS trong một đặc tả được duyệt riêng; không nhét dữ
liệu timeline vào mock data hoặc metadata của catalogue.

## Kiến trúc và ranh giới

- Chỉ thay React/Tailwind presentation components và CSS tokens/recipes liên
  quan; các Server Components, reader/use case và Supabase client hiện hữu giữ
  nguyên.
- Tái sử dụng class semantic hiện có (`diary-shell`, `diary-kicker`, radius,
  color token) để giảm rủi ro lệch style giữa public và admin.
- Không thêm animation library, mock data, API mới hay state client mới.

## Xử lý lỗi và accessibility

- Không đổi luồng error/empty/loading hiện có.
- Các link, button, chip lọc và action quản trị tiếp tục giữ focus thấy rõ,
  keyboard navigation và touch target tối thiểu 44px.
- Dòng văn bản dài phải wrap tự nhiên ở 320px; không truncate lời nhắn, mô tả
  hay label quan trọng chỉ để giảm chiều cao.

## Kiểm chứng

Theo yêu cầu hiện tại, không bổ sung test mới. Sau khi triển khai, kiểm tra:

1. `npx.cmd tsc --noEmit` và `npm.cmd run build` trong Windows với Node 24.
2. Browser QA tại 320, 390, 768, 1024 và 1440px cho catalogue, item detail và
   `/admin`: text dài, responsive grid, form, focus, hover và pagination.
3. Kiểm tra View Transition khi chuyển trang/filter/chọn item; kiểm tra reduced
   motion không còn animation kéo dài.

## Không thuộc phạm vi

- Migration/table timeline, seed, RLS hay thay đổi Supabase dashboard.
- Thay đổi nội dung item, hình ảnh, role/permission và Google OAuth.
- Rebuild layout từ đầu hoặc thay hệ màu Bordeaux đã được duyệt.
