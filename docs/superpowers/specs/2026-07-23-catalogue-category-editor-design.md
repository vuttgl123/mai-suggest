# Catalogue Category Editor Design

## Mục tiêu

Cho Owner chỉnh sửa đầy đủ một danh mục hiện có ngay tại trang quản trị mà không
làm sidebar danh mục chật hoặc thay đổi luồng chỉnh item hiện tại.

## Bối cảnh

Luồng cập nhật danh mục đã hoàn chỉnh ở Server Action, application service và
Supabase repository. Sidebar hiện chỉ gọi tạo và xóa danh mục, nên không có cách
để gọi action cập nhật từ giao diện.

## Thiết kế giao diện

Mỗi danh mục đang được chọn trong sidebar có thêm nút `Sửa danh mục`. Nút mở một
native modal dialog theo pattern `FutureLetterComposer`, đủ rộng trên desktop và
có khoảng lề an toàn trên mobile. Dialog không thay panel chỉnh item bên phải và
không làm danh sách danh mục thay đổi chiều cao.

Dialog gồm các trường:

- tên danh mục;
- slug;
- mô tả;
- biểu tượng dạng text tùy chọn;
- URL ảnh bìa tùy chọn;
- thứ tự hiển thị là số nguyên không âm;
- checkbox Live/Ẩn.

Nút đóng, Hủy và Lưu thay đổi bị vô hiệu khi đang lưu. Dialog đóng sau khi cập
nhật thành công và gửi phản hồi thành công tới vùng feedback chung của
workspace. Lỗi validation hoặc cập nhật hiện ngay trong dialog để không bị lớp
modal che khuất.

## Luồng dữ liệu và quyền

Một Client Component `AdminCategoryEditor` nhận danh mục đang chọn, trạng thái
mở, callback đóng và callback feedback. Khi dialog mở, component tạo draft mới
từ dữ liệu danh mục để không giữ lại giá trị của lần mở trước. Khi submit, nó
gọi `updateCatalogueCategoryAction(category.id, input)` với `CatalogueCategoryInput`.

Server Action hiện có tiếp tục gọi `ManageCatalogue.updateCategory`, xác minh
Owner từ actor server-side, chuẩn hóa dữ liệu rồi cập nhật qua Supabase RLS. Sau
khi action trả kết quả thành công, client đóng dialog và `router.refresh()` để
dữ liệu sidebar đồng bộ lại. Không có client-side authorization, cache mới, thay
đổi schema hay thay đổi RLS.

## Xử lý lỗi và khả năng truy cập

- Tên là bắt buộc; slug giữ pattern hiện hành; URL ảnh bìa dùng `type="url"`.
- Validation server vẫn là nguồn quyết định cuối cùng cho slug, URL, thứ tự và
  quyền Owner. Lỗi được chuyển qua `feedbackForFailure` hiện có và hiển thị
  trong dialog.
- Dialog dùng `aria-labelledby`, native focus management, `onClose` và nút đóng
  có nhãn truy cập được.
- `dialog` chỉ hiện một form chỉnh sửa mỗi lần; không tạo listener toàn cục hay
  tải thêm thư viện.

## Phạm vi và xác minh

- Chỉ sửa sidebar danh mục và thêm component dialog; dùng lại domain model và
  Server Action hiện có.
- Không thay đổi item editor, tạo/xóa danh mục, component public, Supabase
  schema/RLS, animation toàn trang, cache, branch hoặc commit.
- Theo yêu cầu hiện hành, xác minh bằng source/diff review; không chạy test,
  lint, typecheck, build hoặc browser QA.
