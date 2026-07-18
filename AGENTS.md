# Định tuyến skill cho dự án FE

## Phạm vi hiện tại

- Đây là dự án frontend-only dùng Next.js App Router, React, TypeScript strict,
  Tailwind CSS, Motion và Lucide React.
- Dữ liệu đến từ các file JSON trong `public/data`; trạng thái người dùng được lưu
  bằng `localStorage`.
- Chưa có backend, database, đăng nhập, API key hay luồng gửi email phía server.
- Cho đến khi người dùng thay đổi phạm vi, không tự mở rộng sang backend, database,
  auth, OpenAI API hoặc hạ tầng không phục vụ trực tiếp cho FE.

## Nguyên tắc chọn skill

1. Đầu mỗi tác vụ, dùng `superpowers:using-superpowers` để kiểm tra skill có thể áp
   dụng, sau đó chỉ chọn bộ skill nhỏ nhất đủ để xử lý tác vụ.
2. Chọn skill theo loại công việc thực tế, không kích hoạt toàn bộ danh sách cho
   mọi yêu cầu.
3. Bất kỳ thay đổi sáng tạo nào về UI, component, tính năng hoặc hành vi đều phải
   qua `superpowers:brainstorming` và được người dùng duyệt trước khi sửa code.
4. Nếu tác vụ có nhiều bước hoặc ảnh hưởng nhiều component, sau khi duyệt thiết kế
   dùng `superpowers:writing-plans` trước khi triển khai.
5. Không tạo sub-agent hoặc ủy quyền công việc trừ khi người dùng yêu cầu rõ ràng.
6. Tôn trọng pattern hiện có, dữ liệu JSON và các thay đổi chưa commit của người
   dùng. Không refactor ngoài phạm vi.

## Định tuyến theo bước

### Bắt đầu mọi yêu cầu

- Dùng `superpowers:using-superpowers`.
- Mục đích: chọn đúng workflow và các skill tiếp theo.

### Làm rõ tính năng hoặc thay đổi giao diện

- Dùng `superpowers:brainstorming`.
- Bắt buộc trước khi tạo component, sửa UI, thêm tính năng hoặc thay đổi hành vi.

### Lập và thực thi kế hoạch

- Dùng `superpowers:writing-plans` sau khi thiết kế đã được duyệt và công việc có
  nhiều bước hoặc nhiều file.
- Chỉ dùng `superpowers:executing-plans` khi đã có plan rõ ràng và tác vụ hiện tại
  là thực thi plan đó.

### Viết tính năng hoặc sửa hành vi

- Dùng `superpowers:test-driven-development` để viết kiểm thử thất bại trước, sau
  đó viết code tối thiểu để pass.
- Với thay đổi thuần thị giác, xác định tiêu chí thị giác và viewport cần kiểm tra
  trước khi sửa; xác minh bằng browser QA thay cho việc ép một unit test vô nghĩa.

### Viết hoặc review React/Next.js

- Dùng `vercel-react-best-practices` khi sửa component, page, data loading, client
  state, bundle hoặc hiệu năng render.
- Chỉ dùng `vercel-composition-patterns` khi component có nhiều boolean prop,
  context phức tạp, compound component hoặc cần một API tái sử dụng linh hoạt.

### Animation và chuyển cảnh

- Chỉ dùng `vercel-react-view-transitions` khi người dùng yêu cầu view transition,
  route transition, shared element hoặc list reorder.
- Không trộn View Transitions với Motion nếu không có mục đích tương tác hoặc quan
  hệ không gian rõ ràng.

### Tạo hoặc chỉnh sửa hình ảnh

- Dùng `imagegen` cho hero, ảnh sản phẩm, texture hoặc ảnh minh họa raster tùy biến.
- Không dùng `imagegen` để thay Lucide icon, SVG hoặc hình có thể tạo bằng CSS.

### Audit UI/UX/accessibility

- Dùng `web-design-guidelines` khi người dùng yêu cầu review giao diện,
  accessibility hoặc UX.
- Cũng dùng sau thay đổi UI lớn có ảnh hưởng đến responsive, focus, form, dialog
  hoặc các luồng tương tác chính.

### Sửa lỗi hoặc hành vi bất thường

- Dùng `superpowers:systematic-debugging` khi có bug, test fail, build fail, lỗi
  hiệu năng hoặc UI hoạt động khác dự kiến.
- Phải tái hiện và tìm nguyên nhân gốc trước khi đề xuất bản sửa.
- Sau đó dùng TDD cho regression test nếu hành vi có thể kiểm thử tự động.

### Nhận code review

- Dùng `superpowers:receiving-code-review` trước khi áp dụng feedback.
- Xác minh feedback đúng về kỹ thuật, không sửa máy móc.

### Trước khi báo hoàn tất

- Bắt buộc dùng `superpowers:verification-before-completion`.
- Chạy lại các lệnh và kiểm tra liên quan trong chính lượt làm việc hiện tại.

### Tìm hoặc cài skill mới

- Chỉ dùng `find-skills` hoặc `skill-installer` khi bộ skill hiện tại không bao phủ
  nhu cầu và người dùng muốn mở rộng khả năng.

## Workflow mặc định

### Tính năng FE hoặc thay đổi UI mới

1. `superpowers:using-superpowers`.
2. Đọc code, dữ liệu và pattern liên quan.
3. `superpowers:brainstorming`; thống nhất phạm vi và tiêu chí chấp nhận.
4. Nếu công việc nhiều bước: `superpowers:writing-plans`.
5. Nếu có hành vi kiểm thử được: `superpowers:test-driven-development`.
6. Triển khai với `vercel-react-best-practices`.
7. Chỉ thêm `vercel-composition-patterns`, `imagegen` hoặc
   `vercel-react-view-transitions` khi đúng điều kiện ở trên.
8. Audit bằng `web-design-guidelines` nếu thay đổi ảnh hưởng lớn đến thị giác,
   tương tác hoặc accessibility.
9. `superpowers:verification-before-completion` trước khi báo kết quả.

### Sửa lỗi

1. `superpowers:using-superpowers`.
2. `superpowers:systematic-debugging`: tái hiện, đọc lỗi, xem thay đổi gần đây,
   truy vết data flow và xác định một giả thuyết nguyên nhân gốc.
3. `superpowers:test-driven-development`: tạo regression test thất bại nếu hành vi
   có thể kiểm thử tự động.
4. Sửa nguyên nhân gốc với thay đổi nhỏ nhất.
5. Chạy lại test liên quan, lint, build và browser QA cần thiết.
6. `superpowers:verification-before-completion`.

### Review giao diện mà chưa sửa code

1. `superpowers:using-superpowers`.
2. `web-design-guidelines`.
3. Báo cáo findings theo mức độ nghiêm trọng, kèm file/dòng và rủi ro còn lại.
4. Nếu người dùng yêu cầu sửa findings, quay lại workflow tính năng hoặc sửa lỗi.

### Tạo tài nguyên hình ảnh

1. Làm rõ vai trò của ảnh, tỉ lệ, nội dung, style, crop và ràng buộc text.
2. Dùng `imagegen` cho ảnh raster; lưu asset cuối vào workspace nếu dự án sẽ tham
   chiếu đến ảnh đó.
3. Kiểm tra bằng mắt ảnh sinh ra trước khi tích hợp.
4. Khi tích hợp, đảm bảo `alt`, kích thước ổn định, responsive crop, tối ưu tải và
   cấu hình `next/image` phù hợp.

## Skill chưa cần mặc định

- Không dùng `openai-docs`, `plugin-creator`, `skill-creator` hoặc skill backend cho
  công việc FE thông thường của dự án này.
- Không dùng `vercel-react-view-transitions` chỉ để thêm animation trang trí; dự án
  đang có Motion và mỗi animation phải phục vụ phản hồi hoặc quan hệ không gian.
- Không dùng `vercel-composition-patterns` cho component đơn giản, ổn định.
- Không dùng `imagegen` cho icon giao diện khi Lucide đã có icon phù hợp.
- Không dùng skill worktree, branch completion, code-review sub-agent hoặc parallel
  agent nếu người dùng chưa yêu cầu workflow git/delegation tương ứng.

## Xác minh trước khi hoàn tất

Chọn mức kiểm tra theo phạm vi thay đổi, nhưng không được bỏ qua bằng chứng mới:

- Đọc lại yêu cầu và đối chiếu từng tiêu chí chấp nhận.
- Chạy test liên quan nếu dự án hoặc tác vụ có test.
- Chạy `npm run lint` cho thay đổi code.
- Chạy `npm run build` khi thay đổi TypeScript, component, data, cấu hình hoặc trước
  khi bàn giao một mốc FE.
- Với thay đổi thị giác, chạy app và browser QA ở các rộng 320, 390, 768, 1024 và
  1440 px; kiểm tra text tràn, overlap, bố cục, ảnh, hover, focus và reduced motion.
- Với thay đổi tương tác, kiểm tra keyboard, focus trap, Escape,
  loading/error/empty state, localStorage và các luồng chính có liên quan.
- Không tuyệt đối hóa kết quả từ lint: lint không thay thế build, test hoặc browser
  QA.

