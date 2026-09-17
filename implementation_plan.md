# Kế hoạch Refactor Toàn bộ Giao diện Dự án (SaaS-infused UI Overhaul)

## Mục tiêu
Biến đổi toàn bộ dự án từ phong cách "Nhật ký/Thiệp cưới" (Bordeaux editorial, gradient lớn, font chữ có chân, bóng đổ nổi) sang phong cách **"Modern SaaS-infused"**: tối giản, kính mờ (glassmorphism), viền mỏng (hairline borders), phẳng (flat), và font chữ không chân (sans-serif) sắc nét.

## User Review Required
Đây là một cuộc đại tu lớn về mặt thị giác. Vui lòng xem xét các thay đổi đề xuất bên dưới và bấm **Proceed** nếu bạn đồng ý hướng đi này.

## Chi tiết kế hoạch (Các bước sẽ thực thi)

### 1. Typography (Phông chữ)
- **[MODIFY] `src/app/layout.tsx`**: 
  - Gỡ bỏ phông chữ có chân `Playfair_Display`.
  - Thay thế bằng một hệ thống phông chữ SaaS chuẩn mực: `Inter` cho nội dung (body) và `Plus_Jakarta_Sans` (hoặc `Geist`) cho tiêu đề (display/heading).
- **[MODIFY] CSS & Components**:
  - Xóa bỏ toàn bộ các class `italic` và `font-serif` trên toàn dự án.
  - Thay thế các class `uppercase tracking-widest` (thường dùng ở các thẻ kicker/nhãn nhỏ) thành `font-semibold text-xs tracking-wide` để giảm độ gắt.

### 2. Colors & Tokens (Màu sắc và Biến CSS)
- **[MODIFY] `src/app/styles/tokens.css`**:
  - Gỡ bỏ **hoàn toàn** các biến gradient khổng lồ: `--theme-body-background`, `--theme-atmosphere`, `--theme-wash`, `--theme-header-pattern`.
  - Chuẩn hóa lại bảng màu: Đưa `--color-paper` về màu trắng sắc nét hoặc xám cực nhạt (`#ffffff` hoặc `#fcfcfc`), `--color-surface` về `#f7f9fc` (SaaS gray).
  - Khử các bóng đổ gắt: Thiết lập lại `--shadow-card`, `--shadow-soft`, `--elevation-raised` thành các giá trị siêu nhẹ (ví dụ: `0 4px 20px rgba(0,0,0,0.03)`).
  - Giữ lại hệ thống radius bo góc mềm mại.

### 3. Hiệu ứng và Chuyển động (Motion & Effects)
- **Gỡ bỏ `animate-pulse`**: Tìm và thay thế tất cả các trạng thái loading nhấp nháy lố bằng hiệu ứng mờ dần (opacity fade) hoặc skeleton.
- **Glassmorphism**: Áp dụng triệt để `backdrop-blur-md` kết hợp với `bg-paper/70` cho các thanh điều hướng (header), thanh công cụ (rail), và các thẻ nổi.
- **Micro-interactions**: Thay vì đổ bóng khi hover (`hover:shadow-lg`), sẽ sử dụng hiệu ứng dịch chuyển nhẹ (`-translate-y-0.5`) hoặc đổi màu nền/viền (`hover:border-brand/30 hover:bg-brand/5`).

### 4. Dọn dẹp Public UI Components
Quét và refactor các file Public UI (trước đó chỉ mới làm cho Admin), đặc biệt chú trọng:
- **[MODIFY] `catalogue-detail-hero.tsx` & `catalogue-item-card.tsx`**: Gỡ `shadow-sm`, bóng đổ gắt, thay bằng viền mỏng `ring-1 ring-border/50`.
- **[MODIFY] `timeline-chapter-reader.tsx`**: Chuyển các thẻ hiển thị nội dung sang dạng thẻ phẳng.
- **[MODIFY] `future-letter-opening-card.tsx`**: Gỡ bỏ thiết kế phong bì/thư tay nổi 3D, thay bằng thẻ UI hiện đại.
- **[MODIFY] `magical-background.tsx`**: Gỡ bỏ hiệu ứng background phức tạp, đổi thành nền lưới mờ (grid/dot pattern) tinh tế thường thấy ở các dashboard SaaS.

## Verification Plan
1. Chạy `npm run lint` và `npx tsc --noEmit` để đảm bảo refactor không phá vỡ bất kỳ component nào.
2. Build ứng dụng `npm run build` để kiểm tra.
3. Người dùng review giao diện thực tế trên trình duyệt để đánh giá độ "sạch" và "hiện đại".
