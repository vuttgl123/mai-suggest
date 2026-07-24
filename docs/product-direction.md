# Mai Suggest — định hướng sản phẩm

> Tài liệu sống ghi lại những quyết định sản phẩm đã thống nhất. Mục đích là
> giữ được mạch phát triển qua các lần làm việc, không phải là một cam kết phải
> xây hết mọi ý tưởng bên dưới.

## Bản sắc sản phẩm

Mai Suggest là một không gian riêng tư, lãng mạn và tinh tế dành cho hai người
(hoặc một nhóm thành viên đã được Owner cho phép) cùng lưu giữ tình cảm. Sản
phẩm không cố trở thành mạng xã hội hay ứng dụng chat; nó giống một cuốn nhật ký
đẹp, có những gợi ý để cùng tạo thêm kỷ niệm.

Các cảm xúc cần được ưu tiên là: ấm áp, chân thành, chậm rãi, có chiều sâu và
đủ riêng tư. Mỗi tính năng mới nên giúp người dùng **nhớ lại**, **nói ra** hoặc
**mong chờ** một điều cùng nhau.

## Nguyên tắc đã chốt

- Ngôn ngữ thiết kế là **Bordeaux Diary**: đỏ Bordeaux đậm là màu chủ đạo,
  nền giấy ngà, sắc đồng tiết chế và typography có chất biên tập. Không chuyển
  sang hồng ngọt hoặc phong cách thương mại đại trà.
- Giao diện gọn hơn khoảng 15–20% nhưng vẫn thoáng, chữ dễ đọc và nội dung tình
  cảm không bị dồn ép.
- Chuyển trang và tương tác nhẹ, mượt; tôn trọng `prefers-reduced-motion`.
- Không khí theo mùa hoặc sự kiện dùng preset Bordeaux đã kiểm duyệt, có lịch tự
  động và ghi đè thủ công của Owner; không có custom CSS hoặc theme riêng theo
  từng người dùng ở giai đoạn này.
- Google OAuth qua Supabase là phương thức đăng nhập duy nhất.
- Supabase là nguồn dữ liệu nghiệp vụ duy nhất. Không dùng mock/JSON cho dữ liệu
  thật và không quyết định quyền chỉ ở client.
- Tất cả active member dùng được các trải nghiệm chung. Owner chỉ giữ quyền quản
  lý nội dung và thành viên; không biến ứng dụng thành hệ thống phân quyền phức
  tạp.
- Tên và avatar hiển thị lấy từ profile Google đã đồng bộ, nhưng quyền truy cập
  luôn dựa vào user ID, role và RLS.

## Những phần đang có

### Catalogue kỷ niệm và gợi ý

- Danh mục và item lấy dữ liệu thật từ Supabase, có phân trang.
- Bộ sưu tập được mở theo các chương cảm xúc, với một điều nổi bật ở trang đầu
  mỗi chương để bắt đầu khám phá chậm rãi.
- Mỗi item có thể chứa lời nhắn, thơ, liên kết và các mẩu kỷ niệm chi tiết.
- Mỗi active member có một cảm nhận 1–5 sao, lời nhắn tùy chọn và các lời bình
  chung trên item. Nội dung hiển thị tên/ảnh Google đã đồng bộ; tác giả tự quản
  lý lời của mình, còn Owner chỉ có thể gỡ khi cần điều tiết.
- Thành viên đọc và tương tác theo quyền hiện có; Owner có khu vực quản lý nội
  dung riêng tại `/admin`.

### Dòng thời gian của hai đứa

- Trang `/hanh-trinh` kể các cột mốc trưởng thành của mối quan hệ.
- Owner tạo, sắp xếp, giữ nháp và công khai mốc tại `/admin/hanh-trinh`.
- Mọi active member đọc mốc đã công khai, thấy lời hồi đáp/kỷ niệm của nhau và
  có thể tạo, sửa, xóa hồi đáp của chính mình.
- Lời hồi đáp hiển thị tên Google/profile và avatar hiện tại; Owner chỉ có thể
  xóa để điều tiết nội dung, không sửa lời của người khác.

## Hướng phát triển đã thống nhất

Thứ tự dưới đây là thứ tự ưu tiên sản phẩm, không phải cam kết phải triển khai
ngay cùng lúc. Mỗi mục sẽ có design và migration/RLS riêng trước khi viết code.

### Nền tảng: Không khí giao diện theo mùa và sự kiện

Owner có thể đặt lịch cho các preset như Lời hẹn tháng Hai, Mùa xuân dịu dàng,
Đêm cuối năm và Chương kỷ niệm; khi không có lịch, Bordeaux Diary vẫn là mặc
định. Theme được quyết định ở server ngay từ lần vẽ đầu, hiển thị giống nhau cho
tất cả người xem và chỉ thay token/trang trí tiết chế, không làm đổi nội dung hay
bố cục nghiệp vụ. Đặc tả chi tiết nằm tại
`docs/superpowers/specs/2026-07-21-seasonal-theme-system-design.md`.

### 1. Hộp thư gửi đến tương lai — ưu tiên kế tiếp

Người dùng viết một lá thư, lời thơ hoặc lời hứa rồi đặt **ngày và giờ mở** theo
múi giờ Việt Nam (`Asia/Ho_Chi_Minh`). Lá thư được niêm phong thật sự trước thời
điểm đó; khi đến lịch, nó trở thành một kỷ niệm để mọi active member cùng đọc.
Có thể đi kèm tiêu đề, nội dung dài, một ảnh hoặc đường dẫn bài hát tùy chọn.

Giá trị: tạo cảm giác mong chờ, rất phù hợp với nhịp chậm của timeline và không
trùng vai trò với catalogue.

Mặc định đã chốt: trước giờ mở chỉ tác giả thấy và sửa/xóa được thư; sau giờ mở
mọi active member đều đọc được, Owner có thể gỡ thư khi cần điều tiết nội dung,
còn tác giả không thể sửa/xóa nữa. Khoảnh khắc mở dùng nghi thức phong bì
Bordeaux với chuyển động nhẹ, ánh sáng đồng và hạt trang trí rất tiết chế;
reduced motion mở thư tức thì.

### 2. Lịch những ngày của hai đứa

Một khu vực lịch/đếm ngược tối giản cho ngày quen nhau, sinh nhật, kỷ niệm và
những ngày nhỏ mà cả hai trân trọng. Mỗi ngày có thể gắn một lời nhắn và liên kết
đến mốc timeline hoặc item liên quan.

Giá trị: giúp không gian có nhịp sống hằng ngày mà không cần thông báo làm phiền.

### 3. Nghi thức cuối tháng

Một không gian phản chiếu ngắn theo tháng: “điều em biết ơn”, “kỷ niệm đẹp nhất”
và “điều em mong chờ”. Cả hai phần viết đều được lưu như một chương nhỏ, có thể
đọc lại theo thời gian.

Giá trị: biến nhật ký từ nơi lưu trữ thành một thói quen cùng nuôi dưỡng mối
quan hệ.

## Ý tưởng để sau khi ba nền tảng trên ổn định

- **Bản đồ ký ức:** các địa điểm hoặc chuyến đi hiện như scrapbook, liên kết với
  ảnh và mốc timeline; chỉ nên làm khi có nhu cầu nhập địa điểm thật.
- **Album âm thanh:** bài hát, voice note hoặc playlist gắn với mốc/lá thư. Cần
  thiết kế Supabase Storage, giới hạn file và chi phí trước khi triển khai.
- **Trang kỷ niệm năm:** một chương tự tạo từ các mốc, thư và hồi đáp của một
  năm, phù hợp để đọc/chia sẻ riêng tư chứ không phải feed công khai.

## Những thứ chủ động chưa làm

- Chat realtime, thông báo đẩy/email, reaction/like, leaderboard hay social
  feed.
- Bất kỳ dữ liệu mẫu nào để lấp giao diện khi chưa có nội dung thật.
- Thay đổi Google OAuth, role model hoặc cho member quyền quản lý nội dung chung.

Lý do: các phần này dễ làm trải nghiệm ồn, lệch khỏi cuốn nhật ký tình cảm và
tăng mạnh độ phức tạp về riêng tư, moderation hoặc vận hành.

## Cách dùng tài liệu này

Trước một tính năng mới, đối chiếu với ba câu hỏi:

1. Nó có giúp hai người nhớ lại, nói ra hoặc mong chờ điều gì không?
2. Nó có giữ được nhịp riêng tư, nhẹ nhàng và Bordeaux Diary không?
3. Quyền đọc/viết/xóa có thể bảo đảm bằng Supabase RLS, không phụ thuộc client
   không?

Nếu câu trả lời không rõ, ưu tiên làm sâu một phần đang có thay vì thêm một màn
hình mới.
