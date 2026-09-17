# Admin Cohesion Roadmap

Kế hoạch tái cấu trúc và chuẩn hóa giao diện cho phân hệ Quản trị (Admin) nhằm đồng bộ hóa với ngôn ngữ thiết kế tối giản, tinh tế (SaaS-infused).

## Phạm vi (Scope)
- Chuẩn hóa layout chung cho toàn bộ các trang Admin (`/admin`, `/admin/hanh-trinh`, `/admin/khong-khi`, `/admin/thu-hen-ngay-mo`).
- Dọn dẹp mã lặp lại (Boilerplate) bằng cách sử dụng Next.js Layout/Template.
- Áp dụng triệt để quy tắc UI mới: gỡ bỏ bóng đổ gắt (drop-shadow), gỡ chữ uppercase gắt, áp dụng kính mờ (glassmorphism) và đường viền (border) tinh tế.

## Mốc A: Tái cấu trúc Layout & Navigation (Phase 1)
- **Hành động 1:** Tạo `src/app/admin/layout.tsx` (hoặc cấu trúc lại bằng `template.tsx` để bảo toàn animation `PageTransition`). Di chuyển `<AppHeader activeSection="admin" />` vào Layout.
- **Hành động 2:** Chuyển `<AdminWorkspaceSwitcher>` vào Layout để cố định tab điều hướng mà không bị load lại mỗi khi chuyển trang trong admin.
- **Hành động 3:** Viết lại UI của `AdminWorkspaceSwitcher` theo hướng thẻ tab mềm mại (pill-shaped, kính mờ), loại bỏ `bg-brand` đậm màu, ưu tiên `bg-accent/10` cho active state.

## Mốc B: Giao diện Workspace Header (Phase 2)
- **Hành động 1:** Cập nhật `src/components/admin/admin-workspace-header.tsx`.
- **Hành động 2:** Loại bỏ `shadow-[var(--shadow-card)]` và lớp phủ `diary-wash` không cần thiết. Thay thế bằng nền `bg-paper/60 backdrop-blur-xl border border-border`.
- **Hành động 3:** Cập nhật các badge số lượng trong header sử dụng màu sắc dịu nhẹ.

## Mốc C: Tinh chỉnh Chi tiết Module (Phase 3)
- **Catalogue (`AdminCatalogue`)**: Gỡ box-shadow của Sidebar và List. Tinh giản đường viền phân tách.
- **Timeline (`AdminTimeline`)**: Gỡ các hiệu ứng `animate-pulse` nếu có ở phần chọn cột mốc.
- **Khôi khí (`AdminSiteTheme`)**: Thay đổi UI chọn theme từ dạng khối hộp 3D sang thẻ dẹt bo góc tròn, viền `ring-1`.
- **Thư hẹn (`AdminFutureLetters`)**: Cập nhật `ManagedLetterRow` để nhẹ nhàng hơn, thay nút xóa "Gỡ thư" thành variant `quiet` kết hợp màu text `danger` cho tinh tế, không làm khối nút đỏ chói.

## Mốc D: Kiểm chứng & Hoàn tất (Phase 4)
- Viết / cập nhật Unit Tests nếu có thay đổi logic lớn.
- Chạy E2E Tests, Typechecks (`tsc`) và ESLint.
- Xác nhận UI trên các kích thước màn hình (Mobile/Tablet/Desktop).
