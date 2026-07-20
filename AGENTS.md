# Quy ước agent cho Next.js + Supabase

## Phạm vi hiện hành

- Ứng dụng dùng Next.js App Router, React, TypeScript strict, Tailwind CSS,
  Motion và Lucide React.
- Next.js là lớp UI **và** server-side application logic: Server Components,
  Server Actions và Route Handlers. Không tạo backend service riêng nếu người dùng
  không yêu cầu.
- Supabase là nguồn dữ liệu chuẩn: Postgres, Auth, RLS và Storage khi cần. Không
  tiếp tục thêm hoặc duy trì mock/JSON trong `public/data` cho dữ liệu nghiệp vụ.
- Xác thực chỉ bằng Google OAuth qua Supabase. Không thêm email/password hoặc nhà
  cung cấp đăng nhập khác nếu chưa có yêu cầu mới.
- Trạng thái nghiệp vụ theo người dùng (yêu thích, đánh giá, bình luận, ghi chú,
  quyền truy cập) phải đi qua database/RLS. Chỉ dùng `localStorage` cho trạng thái
  UI tạm thời khi có lý do rõ ràng.
- Tôn trọng schema, migration, trigger và RLS hiện có. Không tắt RLS để xử lý lỗi
  tạm thời và không lọc quyền chỉ ở client.

## Secrets và quyền truy cập

- Dùng `.env.local` cho giá trị môi trường cục bộ và `.env.example` chỉ chứa tên
  biến. Không commit, in ra log hay chép credential vào tài liệu/mã nguồn.
- Chỉ URL và publishable/anon key của Supabase được xuất hiện ở client.
  Secret/service-role key chỉ tồn tại trong server runtime khi thực sự cần; tuyệt
  đối không đặt dưới `NEXT_PUBLIC_*`.
- Google Client Secret được cấu hình trong Supabase Auth provider, không trong
  component client.
- Không thực hiện migration, thay đổi RLS, seed production hay chỉnh dashboard
  Supabase nếu người dùng chưa yêu cầu hành động đó một cách rõ ràng.

## Chuẩn bị môi trường và kiểm tra kết nối Supabase

- Dùng `.env.local` cho credential cục bộ; duy trì `.env.example` chỉ với tên biến
  và giá trị trống. Xác nhận `.env.local` không xuất hiện trong Git status/diff.
- Với client/browser Supabase, chuẩn hóa tên biến
  `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Mỗi lần cấu hình mới hoặc đổi project Supabase, chạy script kiểm tra kết nối
  read-only trước khi tích hợp UI/data. Script phải fail rõ ràng khi thiếu biến,
  không in URL đầy đủ, key, token hoặc record trả về.
- Kiểm tra kết nối với publishable key chỉ chứng minh request tới Supabase API hợp
  lệ; không dùng nó làm bằng chứng RLS, role hay Google OAuth đã đúng. Kiểm thử
  các quyền đó riêng theo từng vai trò.
- Không dùng `POSTGRES_URL`, `SUPABASE_SECRET_KEY`, service-role key hay JWT secret
  cho client hoặc kiểm tra kết nối thông thường. Chỉ dùng server-only khi một yêu
  cầu chức năng cụ thể thực sự cần và đã được người dùng duyệt.

## Đọc mã và lệnh terminal với `rtk`

Ưu tiên `rtk` để giảm token và làm gọn output:

- Khám phá/đọc: `rtk ls`, `rtk tree -L <depth>`, `rtk read`, `rtk smart`,
  `rtk json`, `rtk grep`, `rtk git`, `rtk diff`.
- Kiểm tra dự án: `rtk npm run lint`, `rtk next build`, `rtk test`,
  `rtk playwright`, `rtk tsc` và `rtk err` khi cần xem lỗi tập trung.
- Dùng `rg` hoặc lệnh native khi `rtk` không hỗ trợ cú pháp/trường hợp cần thiết;
  không làm vòng qua kiểm soát quyền hoặc in secret để đổi lấy output ngắn hơn.
- Dùng `apply_patch` để sửa file. Không dùng shell redirect hay script ghi file
  thay cho `apply_patch`.

## Chọn skill theo tác vụ

1. Mỗi tác vụ bắt đầu bằng `superpowers:using-superpowers`, rồi chỉ kích hoạt bộ
   skill nhỏ nhất phù hợp.
2. Thay đổi UI, component, tính năng hay hành vi phải qua
   `superpowers:brainstorming` và nhận được người dùng duyệt trước khi sửa code.
3. Nếu thiết kế đã duyệt và tác vụ có nhiều bước/nhiều file, dùng
   `superpowers:writing-plans` trước khi triển khai.
4. Không tạo sub-agent hoặc ủy quyền nếu người dùng không yêu cầu rõ ràng.
5. Tôn trọng pattern hiện có và thay đổi chưa commit; không refactor ngoài phạm vi.

### Supabase và backend trong Next.js

- Dùng `supabase` cho mọi công việc với Supabase: `@supabase/ssr`,
  `@supabase/supabase-js`, Google OAuth, callback/session cookie, auth guard,
  Server Components, Server Actions, Route Handlers, Storage, CLI hoặc MCP.
- Dùng thêm `supabase-postgres-best-practices` khi thiết kế/review schema,
  migration, index, truy vấn, connection management, RLS hoặc phân quyền
  `owner/member`.
- Khi thay mock data, thiết kế lớp truy cập dữ liệu typed và mapping từ schema trước
  khi sửa component. Không để query Supabase server-only lọt vào Client Component.
- Với OAuth, kiểm tra redirect/callback, session refresh, route protection và bốn
  vai trò truy cập tối thiểu: anonymous, member không được phép, member được phép,
  owner.

### React, Next.js và UI

- Dùng `vercel-react-best-practices` khi sửa component, page, data loading,
  server/client boundary, state, bundle hoặc hiệu năng render.
- Chỉ dùng `vercel-composition-patterns` khi component có boolean props tăng nhiều,
  context phức tạp, compound component hoặc cần API tái sử dụng linh hoạt.
- Dùng `vercel-react-view-transitions` chỉ khi người dùng yêu cầu route/shared
  element/list reorder transition; không trộn nó với Motion nếu không có mục đích
  tương tác hoặc quan hệ không gian rõ ràng.
- Dùng `imagegen` cho ảnh raster tùy biến; không dùng cho icon/SVG khi CSS hoặc
  Lucide React phù hợp.
- Dùng `web-design-guidelines` khi được yêu cầu audit UI/UX/accessibility, hoặc sau
  thay đổi lớn ảnh hưởng responsive, focus, form, dialog hay luồng chính.

### Tính năng, lỗi và review

- Tính năng/hành vi có thể kiểm thử: dùng
  `superpowers:test-driven-development` để tạo test thất bại trước, sau đó viết mã
  tối thiểu để pass. Thay đổi thuần thị giác phải có tiêu chí thị giác và browser
  QA thay vì unit test hình thức.
- Bug, test/build fail, hiệu năng hay hành vi bất thường: dùng
  `superpowers:systematic-debugging` để tái hiện và xác định nguyên nhân gốc trước
  khi sửa; thêm regression test khi khả thi.
- Nhận feedback review: dùng `superpowers:receiving-code-review` trước khi áp dụng
  và xác minh nhận xét bằng kỹ thuật, không sửa máy móc.
- Chỉ dùng `find-skills` hoặc `skill-installer` nếu bộ skill hiện có thiếu khả năng
  thực sự và người dùng muốn mở rộng. Ưu tiên nguồn chính chủ/uy tín và không cài
  bộ skill lớn chỉ vì có trong danh sách awesome.

## Xác minh trước khi bàn giao

Trước khi báo hoàn tất, bắt buộc dùng
`superpowers:verification-before-completion` và đưa bằng chứng mới phù hợp phạm vi:

- Đọc lại yêu cầu, đối chiếu từng tiêu chí chấp nhận, và kiểm tra diff chỉ chứa thay
  đổi trong phạm vi.
- Với thay đổi code: chạy test liên quan, `rtk npm run lint` và `rtk next build`.
- Với database/RLS: kiểm tra migration, type/data mapping và từng vai trò truy cập;
  không coi UI render được là bằng chứng dữ liệu đã an toàn.
- Với Google OAuth: kiểm tra đăng nhập, callback, session, logout, trang bảo vệ và
  trạng thái lỗi; dùng môi trường thử nghiệm, không in token.
- Với thay đổi thị giác: browser QA ở 320, 390, 768, 1024 và 1440 px; kiểm tra text
  tràn, overlap, ảnh, hover, focus và reduced motion.
- Lint không thay thế build, test, kiểm thử RLS hay browser QA.
