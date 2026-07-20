# Bước 1 — Skill plan cho Next.js + Supabase

**Trạng thái:** đề xuất đã rà soát, chưa cài thêm skill.

## Phạm vi đã chốt

- Ứng dụng sẽ chuyển từ JSON/mock data sang Supabase Postgres; Next.js App Router giữ cả UI và server-side application logic.
- Xác thực chỉ qua Google OAuth của Supabase. Không tạo email/password, backend riêng, hay API key cho trình duyệt.
- Schema hiện tại trong `docs/database` đã có `allowed_users`, `profiles`, catalogue (`categories`, `items`, ảnh/liên kết), đánh giá/bình luận/trạng thái cá nhân; đồng thời đã có trigger tạo profile và RLS policies. Các thay đổi sau này phải tôn trọng các ràng buộc đó.

## Skill đã có — dùng theo tình huống

| Công việc | Skill |
| --- | --- |
| Bắt đầu mọi tác vụ | `superpowers:using-superpowers` |
| Làm rõ thay đổi UI/tính năng trước khi sửa | `superpowers:brainstorming` |
| Kế hoạch cho migration nhiều file | `superpowers:writing-plans` |
| Hành vi mới hoặc regression | `superpowers:test-driven-development` |
| Lỗi auth/data/build | `superpowers:systematic-debugging` |
| Component, App Router, data loading/rendering | `vercel-react-best-practices` |
| UI, responsive, focus, accessibility | `web-design-guidelines` |
| Kiểm chứng trước khi bàn giao | `superpowers:verification-before-completion` |

Các skill khác đang có chỉ kích hoạt khi đúng phạm vi: `imagegen` cho ảnh raster mới; `vercel-react-view-transitions` cho route/shared-element transition được yêu cầu; `vercel-composition-patterns` khi API component trở nên phức tạp. Không gọi tất cả trong mọi tác vụ.

## Skill nên cài ngay

Cài đúng hai skill chính chủ của Supabase, nguồn `supabase/agent-skills` (MIT, khoảng 2.2k GitHub stars; `supabase-postgres-best-practices` nằm trong top 100 trên skills.sh tại thời điểm rà soát):

1. `supabase` — dùng cho `@supabase/ssr`, `@supabase/supabase-js`, Google OAuth, callback/session cookie, Server Components/Server Actions, auth guard và Supabase CLI/MCP.
2. `supabase-postgres-best-practices` — dùng khi review/chỉnh schema, migration, index, truy vấn và đặc biệt RLS. Đây là lớp kiểm tra độc lập cần thiết vì dữ liệu người dùng sẽ không còn là mock data.

Lệnh cài đặt đề xuất (thực hiện ở bước tiếp theo):

```bash
npx skills add supabase/agent-skills --skill supabase -g -y
npx skills add supabase/agent-skills --skill supabase-postgres-best-practices -g -y
```

Không cài một skill Auth cộng đồng riêng: skill `supabase` chính chủ đã bao quát Auth + Next.js, giúp tránh chồng chéo chỉ dẫn. Chưa cần `@supabase/server`; với Next.js App Router, hướng tích hợp mặc định là `@supabase/ssr`.

## Quy tắc kích hoạt sau khi cài

- Google login/callback/session/route protection: `supabase` + skill quy trình phù hợp (brainstorming hoặc systematic-debugging).
- SQL migration, RLS policy, role `owner/member`, kiểm tra index: `supabase` + `supabase-postgres-best-practices`.
- Thay mock data bằng repository/data loader Supabase: thêm `vercel-react-best-practices`; dùng TDD cho logic có thể tự động kiểm thử.
- Thay đổi UI sau khi có dữ liệu thật: thêm `brainstorming`, và audit bằng `web-design-guidelines` nếu ảnh hưởng responsive, focus hay luồng chính.

## Rào chắn an toàn trước khi bắt đầu triển khai

- Chỉ `NEXT_PUBLIC_SUPABASE_URL` và publishable/anon key được xuất hiện ở client. Bất kỳ secret/service-role key nào chỉ được đọc trên server; không đưa vào `NEXT_PUBLIC_*`, JSON public, commit, log hay note.
- Google Client Secret được cấu hình trong Supabase Auth provider; không đặt vào component client.
- `docs/secret` hiện là file chưa được Git ignore và chưa được Git theo dõi. Nếu file này chứa credential thật, chuyển giá trị vào `.env.local`, thêm mẫu biến không có giá trị vào `.env.example`, thêm quy tắc ignore, và xoay khóa ngay nếu từng xuất hiện trong commit/chat/log.
- Không bỏ RLS để “cho chạy được”. Quyền truy cập phải được thực thi bởi policy và kiểm thử với ít nhất owner, member được phép, member không được phép và anonymous.

## Khi nào cần đánh giá thêm skill

Chỉ tìm/cài bổ sung khi phạm vi phát sinh thực tế: Supabase Storage upload, Realtime, CI/CD/deploy hoặc quản trị migration bằng CLI. Trước khi cài, ưu tiên nguồn chính chủ/uy tín, kiểm tra mục đích, lượt cài và giấy phép; không cài bộ skill lớn chỉ vì có trong danh sách awesome.

## Nguồn tham khảo

- [Supabase Agent Skills](https://github.com/supabase/agent-skills)
- [Supabase Postgres Best Practices trên skills.sh](https://www.skills.sh/supabase/agent-skills/supabase-postgres-best-practices)
