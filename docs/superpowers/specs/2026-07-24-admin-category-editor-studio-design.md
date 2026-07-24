# Form sửa danh mục dạng studio — thiết kế

**Trạng thái:** Đã được người dùng duyệt và triển khai theo đặc tả này.

## Mục tiêu

Đưa form Sửa danh mục về cùng chuẩn trình bày với form hẹn thư: dialog luôn
được căn giữa rõ ràng, header/body/footer có nhịp ổn định và các trường được
nhóm hợp lý cho thao tác quản trị.

## Căn giữa và khung form

- Dialog hiện thiếu quy tắc căn giữa tường minh như form thư trước khi refactor.
  Nó phải dùng `fixed inset-0 m-auto`, width và height theo viewport rõ ràng,
  không phụ thuộc style mặc định của browser.
- Form dùng grid ba hàng: header, body cuộn độc lập, footer. Nút đóng, Hủy và
  Lưu thay đổi luôn nằm trong vùng ổn định khi mô tả hoặc màn hình dài/ngắn.
- Giữ native `<dialog>`, `showModal`, `aria-labelledby`, focus và backdrop.

## Bố cục studio theo danh mục

- Header giữ kicker quản trị, tiêu đề “Sửa danh mục”, đường trang trí và nút
  đóng; diện mạo giấy Bordeaux đồng điệu với form thư.
- Note riêng tư hiện có trở thành ghi chú giấy nhẹ đầu body.
- Desktop từ `1024px` có hai cột: trái rộng hơn cho tên, slug, mô tả; phải cho
  biểu tượng, thứ tự hiển thị, URL ảnh bìa và checkbox trạng thái.
- Dưới `1024px`, giữ một cột theo cùng thứ tự đọc, không có sidebar hay cuộn
  ngang. Các trường biểu tượng/thứ tự có thể nằm cạnh nhau từ màn hình vừa để
  tiết kiệm chiều cao.
- Footer có border nhẹ, nút Hủy và Lưu thay đổi căn phải; thông báo lỗi giữ
  trong vùng body để không làm thay đổi vị trí hành động.

## Hành vi và dữ liệu giữ nguyên

- Không đổi props, draft, validation tên/slug/thứ tự, `optionalText`,
  `updateCatalogueCategoryAction`, refresh, feedback ra `onFeedback`, edit
  mode, text button hay pending state.
- Giữ toàn bộ input name/type/required/pattern/max/min/step/autoComplete và
  quy tắc `isActive` hiện tại.
- Không thêm state, request, preview ảnh, Server Action, dialog library hoặc
  thay đổi dữ liệu/Supabase.

## Khả năng truy cập và responsive

- Giữ form, fieldset, legend, label, dialog label và button thật hiện có.
- Body có `min-h-0` + overflow riêng để phần footer không bị đẩy ra khi bàn
  phím ảo xuất hiện hoặc mô tả dài.
- Không thêm animation hay JavaScript định vị cửa sổ.

## Thay đổi mã dự kiến

- `src/features/catalogue/presentation/admin-category-editor.tsx`: chuyển form
  sang semantic header/body/footer và nhóm field thành nội dung danh mục / diện
  mạo & hiển thị.
- `src/app/globals.css`: thêm style `admin-category-editor-*` cho surface,
  scroll body, note, hai vùng field và responsive spacing.
- Không đổi catalogue model, action, route, quyền, Supabase hay danh sách danh
  mục.

## Ngoài phạm vi

- Tạo/sắp xếp/xóa danh mục, thay đổi validation hay Slug generator, upload/preview
  ảnh bìa, item editor, layout danh sách admin, data/RLS/Supabase, animation,
  test, lint, build, browser QA, commit hoặc tạo nhánh.

## Xác minh dự kiến

Chỉ rà soát tĩnh: dialog có căn giữa tường minh; markup có header/body/footer;
hai cột desktop và một cột mobile; tất cả field/action/validation contract giữ
nguyên; body là vùng cuộn; diff chỉ chạm editor, CSS, tài liệu liên quan. Không
tuyên bố đã QA browser hay hình ảnh vì không chạy browser/test/build theo yêu
cầu.
