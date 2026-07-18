# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product-journeys.spec.ts >> compares two catalogue items and closes the comparison with Escape
- Location: tests/e2e/product-journeys.spec.ts:3:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('dialog').getByRole('button', { name: 'Đóng lời nhắn' })
    - locator resolved to <button type="button" title="Đóng lời nhắn" aria-label="Đóng lời nhắn" class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] border font-semibold transition duration-[var(--duration-fast)] disabled:cursor-not-allowed disabled:opacity-45 border-[var(--color-border)] bg-[var(--color-paper)] text-[var(--color-brand)] hover:border-[var(--color-accent)] hover:bg-white h-11 w-11 shrink-0 p-0 fixed right-3 top-3 z-10 bg-[var(--color-paper)] md:absolute">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" aria-pressed="false" class="flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold transition border-[var(--color-border)] bg-[var(--color-paper)] text-[var(--color-brand)] hover:border-[var(--color-accent)] hover:bg-white">…</button> from <div class="sticky top-14 z-30">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <button type="button" aria-pressed="false" class="flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold transition border-[var(--color-border)] bg-[var(--color-paper)] text-[var(--color-brand)] hover:border-[var(--color-accent)] hover:bg-white">…</button> from <div class="sticky top-14 z-30">…</div> subtree intercepts pointer events
  2 × retrying click action
      - waiting 100ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="hide-scrollbar mx-auto flex w-full min-w-0 max-w-[78rem] gap-2 overflow-x-auto px-4 py-3 sm:px-8">…</div> from <div class="sticky top-14 z-30">…</div> subtree intercepts pointer events
  27 × retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button type="button" aria-pressed="false" class="flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold transition border-[var(--color-border)] bg-[var(--color-paper)] text-[var(--color-brand)] hover:border-[var(--color-accent)] hover:bg-white">…</button> from <div class="sticky top-14 z-30">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button type="button" aria-pressed="false" class="flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold transition border-[var(--color-border)] bg-[var(--color-paper)] text-[var(--color-brand)] hover:border-[var(--color-accent)] hover:bg-white">…</button> from <div class="sticky top-14 z-30">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="hide-scrollbar mx-auto flex w-full min-w-0 max-w-[78rem] gap-2 overflow-x-auto px-4 py-3 sm:px-8">…</div> from <div class="sticky top-14 z-30">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="hide-scrollbar mx-auto flex w-full min-w-0 max-w-[78rem] gap-2 overflow-x-auto px-4 py-3 sm:px-8">…</div> from <div class="sticky top-14 z-30">…</div> subtree intercepts pointer events
  2 × retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" aria-pressed="false" class="flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold transition border-[var(--color-border)] bg-[var(--color-paper)] text-[var(--color-brand)] hover:border-[var(--color-accent)] hover:bg-white">…</button> from <div class="sticky top-14 z-30">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="hide-scrollbar mx-auto flex w-full min-w-0 max-w-[78rem] gap-2 overflow-x-auto px-4 py-3 sm:px-8">…</div> from <div class="sticky top-14 z-30">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - link "Bỏ qua để đến danh sách gợi ý" [ref=e3] [cursor=pointer]:
      - /url: "#catalogue-start"
    - region "Điều Em Yêu" [ref=e4]:
      - img "Không gian mở đầu cho Điều Em Yêu" [ref=e6]
      - generic [ref=e8]:
        - paragraph [ref=e9]: Những gợi ý nhỏ dành riêng cho em
        - heading "Điều Em Yêu" [level=1] [ref=e10]
        - paragraph [ref=e11]: Anh gom lại những món quà, phong cách và trải nghiệm có thể khiến em vui, để mỗi dịp đặc biệt đều có một gợi ý thật gần với điều em yêu.
        - button "Khám phá theo dịp" [ref=e13]:
          - text: Khám phá theo dịp
          - img [ref=e14]
    - banner [ref=e16]:
      - generic [ref=e17]:
        - link "Điều Em Yêu" [ref=e18] [cursor=pointer]:
          - /url: "#hero"
        - navigation "Điều hướng chính" [ref=e19]:
          - link "Bộ lọc" [ref=e20] [cursor=pointer]:
            - /url: "#discovery"
            - img [ref=e21]
            - text: Bộ lọc
          - link "Danh mục" [ref=e22] [cursor=pointer]:
            - /url: "#catalogue-start"
    - main [ref=e23]:
      - region "Tìm gợi ý phù hợp" [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e27]:
              - paragraph [ref=e28]: Tìm theo tình huống hoặc tiêu chí
              - heading "Tìm gợi ý phù hợp" [level=2] [ref=e29]
            - paragraph [ref=e30]: Chọn một bộ sưu tập có sẵn hoặc lọc theo dịp, phong cách, ngân sách và loại quà.
          - generic "Bộ sưu tập theo tình huống" [ref=e31]:
            - button "Bó hoa pastel được gói bằng giấy màu kem Nhỏ mà chạm Những điều tinh tế cho một ngày bình thường bỗng trở nên đáng nhớ. 5 gợi ý" [ref=e32]:
              - img "Bó hoa pastel được gói bằng giấy màu kem" [ref=e34]
              - generic [ref=e36]:
                - generic [ref=e37]: Nhỏ mà chạm
                - generic [ref=e38]: Những điều tinh tế cho một ngày bình thường bỗng trở nên đáng nhớ.
                - generic [ref=e39]: 5 gợi ý
            - button "Bánh sinh nhật trang trí hoa tinh tế Sinh nhật đúng gu Một tuyển tập vừa đủ bất ngờ, vừa thật gần với phong cách của em. 6 gợi ý" [ref=e40]:
              - img "Bánh sinh nhật trang trí hoa tinh tế" [ref=e42]
              - generic [ref=e44]:
                - generic [ref=e45]: Sinh nhật đúng gu
                - generic [ref=e46]: Một tuyển tập vừa đủ bất ngờ, vừa thật gần với phong cách của em.
                - generic [ref=e47]: 6 gợi ý
            - button "Bàn ăn tối tinh tế trong ánh sáng ấm Kỷ niệm của chúng mình Gợi lại câu chuyện đã có và mở ra thêm một kỷ niệm mới. 5 gợi ý" [ref=e48]:
              - img "Bàn ăn tối tinh tế trong ánh sáng ấm" [ref=e50]
              - generic [ref=e52]:
                - generic [ref=e53]: Kỷ niệm của chúng mình
                - generic [ref=e54]: Gợi lại câu chuyện đã có và mở ra thêm một kỷ niệm mới.
                - generic [ref=e55]: 5 gợi ý
            - button "Đôi khuyên tai vàng thanh lịch Valentine không rập khuôn Lãng mạn theo cách riêng, không cần giống bất kỳ ai. 5 gợi ý" [ref=e56]:
              - img "Đôi khuyên tai vàng thanh lịch" [ref=e58]
              - generic [ref=e60]:
                - generic [ref=e61]: Valentine không rập khuôn
                - generic [ref=e62]: Lãng mạn theo cách riêng, không cần giống bất kỳ ai.
                - generic [ref=e63]: 5 gợi ý
            - button "Váy midi sáng màu với thiết kế tối giản Một ngày dành cho em Những lựa chọn thanh lịch để em được chiều chuộng theo cách mình thích. 5 gợi ý" [ref=e64]:
              - img "Váy midi sáng màu với thiết kế tối giản" [ref=e66]
              - generic [ref=e68]:
                - generic [ref=e69]: Một ngày dành cho em
                - generic [ref=e70]: Những lựa chọn thanh lịch để em được chiều chuộng theo cách mình thích.
                - generic [ref=e71]: 5 gợi ý
            - button "Không gian tiệc cưới ánh nến sang trọng Làm hòa thật dịu dàng Một lời xin lỗi chân thành đi cùng khoảng thời gian để mình lắng nghe nhau. 4 gợi ý" [ref=e72]:
              - img "Không gian tiệc cưới ánh nến sang trọng" [ref=e74]
              - generic [ref=e76]:
                - generic [ref=e77]: Làm hòa thật dịu dàng
                - generic [ref=e78]: Một lời xin lỗi chân thành đi cùng khoảng thời gian để mình lắng nghe nhau.
                - generic [ref=e79]: 4 gợi ý
            - button "Tháp Eiffel nhìn từ con phố Paris Yêu xa & ngày gặp lại Giữ những điều gần gũi ở bên nhau, dù khoảng cách có dài đến đâu. 5 gợi ý" [ref=e80]:
              - img "Tháp Eiffel nhìn từ con phố Paris" [ref=e82]
              - generic [ref=e84]:
                - generic [ref=e85]: Yêu xa & ngày gặp lại
                - generic [ref=e86]: Giữ những điều gần gũi ở bên nhau, dù khoảng cách có dài đến đâu.
                - generic [ref=e87]: 5 gợi ý
            - button "Nhẫn vàng đính đá với thiết kế tinh xảo Một lời hứa lâu dài Những biểu tượng dành cho một cột mốc nghiêm túc và thật nhiều yêu thương. 5 gợi ý" [ref=e88]:
              - img "Nhẫn vàng đính đá với thiết kế tinh xảo" [ref=e90]
              - generic [ref=e92]:
                - generic [ref=e93]: Một lời hứa lâu dài
                - generic [ref=e94]: Những biểu tượng dành cho một cột mốc nghiêm túc và thật nhiều yêu thương.
                - generic [ref=e95]: 5 gợi ý
            - button "Bàn tiệc tối giản với sắc champagne Chúc mừng khởi đầu mới Tiếp thêm niềm vui cho công việc, mái ấm hoặc hành trình vừa bắt đầu. 5 gợi ý" [ref=e96]:
              - img "Bàn tiệc tối giản với sắc champagne" [ref=e98]
              - generic [ref=e100]:
                - generic [ref=e101]: Chúc mừng khởi đầu mới
                - generic [ref=e102]: Tiếp thêm niềm vui cho công việc, mái ấm hoặc hành trình vừa bắt đầu.
                - generic [ref=e103]: 5 gợi ý
          - generic [ref=e104]:
            - generic [ref=e105]:
              - generic [ref=e106]:
                - img
                - generic [ref=e107]: Tìm kiếm gợi ý quà
                - searchbox "Tìm kiếm gợi ý quà" [ref=e108]
              - generic [ref=e110]:
                - generic [ref=e111]: Sắp xếp
                - combobox "Sắp xếp" [ref=e112]:
                  - option "Đề xuất trước" [selected]
                  - option "Ngân sách thấp trước"
                  - option "Ngân sách cao trước"
                  - option "Tên A-Z"
            - generic [ref=e114]:
              - group "Dịp" [ref=e115]:
                - generic [ref=e116]: Dịp
                - generic [ref=e117]:
                  - button "Chỉ vì hôm nay" [ref=e118]
                  - button "Sinh nhật" [ref=e119]
                  - button "Kỷ niệm của hai đứa" [ref=e120]
                  - button "Valentine" [ref=e121]
                  - button "Quốc tế Phụ nữ 8/3" [ref=e122]
                  - button "Phụ nữ Việt Nam 20/10" [ref=e123]
                  - button "Giáng sinh" [ref=e124]
                  - button "Tết & năm mới" [ref=e125]
                  - button "Tốt nghiệp & công việc mới" [ref=e126]
                  - button "Xin lỗi & làm hòa" [ref=e127]
                  - button "Cổ vũ một ngày khó" [ref=e128]
                  - button "Cảm ơn vì có em" [ref=e129]
                  - button "Yêu xa & ngày gặp lại" [ref=e130]
                  - button "Lời hứa & cầu hôn" [ref=e131]
                  - button "Góc sống mới" [ref=e132]
              - generic [ref=e133]:
                - generic [ref=e134]:
                  - generic [ref=e135]: Phong cách
                  - combobox "Phong cách" [ref=e136]:
                    - option "Tất cả phong cách" [selected]
                    - option "Tối giản"
                    - option "Nữ tính"
                    - option "Thanh lịch"
                    - option "Lãng mạn"
                    - option "Cá tính"
                    - option "Cổ điển"
                    - option "Ấm áp"
                    - option "Thiết thực"
                    - option "Sang trọng"
                    - option "Nghệ thuật"
                    - option "Công nghệ"
                    - option "Thủ công"
                    - option "Trải nghiệm"
                    - option "Cá nhân hóa"
                - generic [ref=e137]:
                  - generic [ref=e138]: Ngân sách
                  - combobox "Ngân sách" [ref=e139]:
                    - option "Mọi mức ngân sách" [selected]
                    - option "Dưới 500 nghìn"
                    - option "500 nghìn – 1 triệu"
                    - option "1 – 3 triệu"
                    - option "3 – 10 triệu"
                    - option "Trên 10 triệu"
                    - option "Ngân sách linh hoạt"
                - generic [ref=e140]:
                  - generic [ref=e141]: Loại quà
                  - combobox "Loại quà" [ref=e142]:
                    - option "Tất cả loại quà" [selected]
                    - option "Món đồ"
                    - option "Trải nghiệm"
                    - option "Cá nhân hóa"
                    - option "Tự tay chuẩn bị"
            - paragraph [ref=e143]:
              - strong [ref=e144]: 42/42 gợi ý
              - text: phù hợp
      - generic [ref=e145]:
        - navigation "Chọn danh mục gợi ý" [ref=e146]:
          - generic [ref=e147]:
            - button "Quà và những bất ngờ 12" [pressed] [ref=e148]:
              - generic [ref=e149]: "01"
              - text: Quà và những bất ngờ
              - generic [ref=e150]: "12"
            - button "Váy và trang phục 5" [ref=e151]:
              - generic [ref=e152]: "02"
              - text: Váy và trang phục
              - generic [ref=e153]: "5"
            - button "Túi xách 5" [ref=e154]:
              - generic [ref=e155]: "03"
              - text: Túi xách
              - generic [ref=e156]: "5"
            - button "Giày dép 5" [ref=e157]:
              - generic [ref=e158]: "04"
              - text: Giày dép
              - generic [ref=e159]: "5"
            - button "Trang sức 5" [ref=e160]:
              - generic [ref=e161]: "05"
              - text: Trang sức
              - generic [ref=e162]: "5"
            - button "Hoa và phong cách trang trí 5" [ref=e163]:
              - generic [ref=e164]: "06"
              - text: Hoa và phong cách trang trí
              - generic [ref=e165]: "5"
            - button "Chuyến đi trong mơ 5" [ref=e166]:
              - generic [ref=e167]: "07"
              - text: Chuyến đi trong mơ
              - generic [ref=e168]: "5"
        - region "Công cụ danh mục" [ref=e169]:
          - generic [ref=e170]:
            - generic [ref=e171]:
              - paragraph [ref=e172]: Quà và những bất ngờ
              - paragraph [ref=e173]: 42 gợi ý
            - generic "Chế độ hiển thị" [ref=e174]:
              - button "Tất cả" [pressed] [ref=e175]
              - button "Đã chọn" [ref=e176]
            - button "Mở bộ lọc" [ref=e177]:
              - img [ref=e178]
              - text: Bộ lọc
            - button "Chưa có lựa chọn" [disabled] [ref=e179]:
              - img [ref=e180]
              - text: Lựa chọn
      - generic [ref=e183]:
        - generic [ref=e184]:
          - paragraph [ref=e185]: 42 gợi ý hiển thị
          - heading "Khám phá gợi ý" [level=2] [ref=e186]
          - paragraph [ref=e190]: Mở chi tiết từng gợi ý, sau đó lưu những lựa chọn phù hợp.
        - complementary [ref=e191]:
          - generic [ref=e192]:
            - generic [ref=e193]:
              - img [ref=e194]
              - paragraph [ref=e198]: Danh sách gợi ý của em
            - paragraph [ref=e199]: Bắt đầu với Quà và những bất ngờ
            - paragraph [ref=e200]: Chọn một gợi ý phù hợp trước; có thể xem tổng kết bất cứ lúc nào.
            - progressbar "Tiến độ khám phá danh mục" [ref=e201]
          - button "Khám phá danh mục" [ref=e202]:
            - text: Khám phá danh mục
            - img [ref=e203]
        - region "Quà và những bất ngờ" [ref=e206]:
          - generic [ref=e207]:
            - generic [ref=e208]: "01"
            - generic [ref=e209]:
              - heading "Quà và những bất ngờ" [level=2] [ref=e210]
              - paragraph [ref=e211]: Mười hai gợi ý quà cho sinh nhật, ngày kỷ niệm, dịp lễ hoặc đơn giản là một ngày muốn làm em vui.
          - generic [ref=e212]:
            - article [ref=e213]:
              - generic [ref=e214]:
                - button "Xem ảnh Hương nước hoa của riêng em" [ref=e215]:
                  - img "Chai nước hoa thanh lịch bên những cánh hoa" [ref=e217]
                - generic [ref=e218]:
                  - img [ref=e219]
                  - text: Tuyển chọn
                - button "Thích Hương nước hoa của riêng em" [ref=e222]:
                  - img [ref=e223]
              - button "Mở chi tiết Hương nước hoa của riêng em" [ref=e225]:
                - heading "Hương nước hoa của riêng em" [level=3] [ref=e226]
                - generic [ref=e227]:
                  - generic [ref=e228]: Jo Malone London
                  - generic [ref=e229]: ·
                  - generic [ref=e230]: 3 – 10 triệu
                - paragraph [ref=e231]: Peony & Blush Suede mang sắc hoa mẫu đơn, táo đỏ và da lộn mềm, phù hợp cho một dấu hương nữ tính nhưng không quá ngọt.
                - generic [ref=e232]:
                  - text: Xem chi tiết
                  - img [ref=e233]
            - article [ref=e236]:
              - generic [ref=e237]:
                - button "Xem ảnh Dây chuyền khắc ngày kỷ niệm" [ref=e238]:
                  - img "Dây chuyền vàng mảnh được đặt trong hộp quà" [ref=e240]
                - generic [ref=e241]:
                  - img [ref=e242]
                  - text: Tuyển chọn
                - button "Thích Dây chuyền khắc ngày kỷ niệm" [ref=e245]:
                  - img [ref=e246]
              - button "Mở chi tiết Dây chuyền khắc ngày kỷ niệm" [ref=e248]:
                - heading "Dây chuyền khắc ngày kỷ niệm" [level=3] [ref=e249]
                - generic [ref=e250]:
                  - generic [ref=e251]: Tiffany & Co.
                  - generic [ref=e252]: ·
                  - generic [ref=e253]: 1 – 3 triệu
                - paragraph [ref=e254]: Một thiết kế mảnh có thể khắc chữ cái, ngày đặc biệt hoặc lời nhắn nhỏ để trở thành món đồ chỉ riêng em có.
                - generic [ref=e255]:
                  - text: Xem chi tiết
                  - img [ref=e256]
            - article [ref=e259]:
              - generic [ref=e260]:
                - button "Xem ảnh Bó hoa theo mùa" [ref=e261]:
                  - img "Bó hoa pastel được gói bằng giấy màu kem" [ref=e263]
                - button "Thích Bó hoa theo mùa" [ref=e264]:
                  - img [ref=e265]
              - button "Mở chi tiết Bó hoa theo mùa" [ref=e267]:
                - heading "Bó hoa theo mùa" [level=3] [ref=e268]
                - generic [ref=e269]:
                  - generic [ref=e270]: Không ghi thương hiệu
                  - generic [ref=e271]: ·
                  - generic [ref=e272]: 500 nghìn – 1 triệu
                - paragraph [ref=e273]: Một bó hoa phối riêng theo màu em yêu, kèm tấm thiệp viết tay thay vì mẫu cắm sẵn đại trà.
                - generic [ref=e274]:
                  - text: Xem chi tiết
                  - img [ref=e275]
            - article [ref=e278]:
              - generic [ref=e279]:
                - button "Xem ảnh Máy ảnh Instax Mini 12" [ref=e280]:
                  - img "Máy ảnh nhỏ đặt cạnh những tấm ảnh in" [ref=e282]
                - button "Thích Máy ảnh Instax Mini 12" [ref=e283]:
                  - img [ref=e284]
              - button "Mở chi tiết Máy ảnh Instax Mini 12" [ref=e286]:
                - heading "Máy ảnh Instax Mini 12" [level=3] [ref=e287]
                - generic [ref=e288]:
                  - generic [ref=e289]: Fujifilm
                  - generic [ref=e290]: ·
                  - generic [ref=e291]: 3 – 10 triệu
                - paragraph [ref=e292]: Máy ảnh lấy liền nhỏ gọn với chế độ cận cảnh và phơi sáng tự động, dành cho những khoảnh khắc không muốn chỉ nằm trong điện thoại.
                - generic [ref=e293]:
                  - text: Xem chi tiết
                  - img [ref=e294]
            - article [ref=e297]:
              - generic [ref=e298]:
                - button "Xem ảnh Nến thơm Diptyque Baies" [ref=e299]:
                  - img "Nến thơm trong ly thủy tinh đang tỏa ánh sáng ấm" [ref=e301]
                - button "Thích Nến thơm Diptyque Baies" [ref=e302]:
                  - img [ref=e303]
              - button "Mở chi tiết Nến thơm Diptyque Baies" [ref=e305]:
                - heading "Nến thơm Diptyque Baies" [level=3] [ref=e306]
                - generic [ref=e307]:
                  - generic [ref=e308]: Diptyque Paris
                  - generic [ref=e309]: ·
                  - generic [ref=e310]: 1 – 3 triệu
                - paragraph [ref=e311]: Hương quả mọng và hoa hồng tạo bầu không khí ấm, sạch và trang nhã cho những buổi tối em muốn nghỉ ngơi.
                - generic [ref=e312]:
                  - text: Xem chi tiết
                  - img [ref=e313]
            - article [ref=e316]:
              - generic [ref=e317]:
                - button "Xem ảnh Bánh ngọt cho ngày đặc biệt" [ref=e318]:
                  - img "Bánh sinh nhật trang trí hoa tinh tế" [ref=e320]
                - button "Thích Bánh ngọt cho ngày đặc biệt" [ref=e321]:
                  - img [ref=e322]
              - button "Mở chi tiết Bánh ngọt cho ngày đặc biệt" [ref=e324]:
                - heading "Bánh ngọt cho ngày đặc biệt" [level=3] [ref=e325]
                - generic [ref=e326]:
                  - generic [ref=e327]: Không ghi thương hiệu
                  - generic [ref=e328]: ·
                  - generic [ref=e329]: 500 nghìn – 1 triệu
                - paragraph [ref=e330]: Một chiếc bánh nhỏ vừa đủ cho hai người, trang trí theo màu em thích và có một câu chúc không trùng với bất kỳ ai.
                - generic [ref=e331]:
                  - text: Xem chi tiết
                  - img [ref=e332]
            - article [ref=e335]:
              - generic [ref=e336]:
                - button "Xem ảnh Album “Chuyện của chúng mình”" [ref=e337]:
                  - img "Album ảnh mở trên bàn cùng những tấm hình kỷ niệm" [ref=e339]
                - button "Thích Album “Chuyện của chúng mình”" [ref=e340]:
                  - img [ref=e341]
              - button "Mở chi tiết Album “Chuyện của chúng mình”" [ref=e343]:
                - heading "Album “Chuyện của chúng mình”" [level=3] [ref=e344]
                - generic [ref=e345]:
                  - generic [ref=e346]: Không ghi thương hiệu
                  - generic [ref=e347]: ·
                  - generic [ref=e348]: 500 nghìn – 1 triệu
                - paragraph [ref=e349]: Một photobook sắp theo dòng thời gian, có chú thích viết riêng cho từng chuyến đi và những ngày bình thường đáng nhớ.
                - generic [ref=e350]:
                  - text: Xem chi tiết
                  - img [ref=e351]
            - article [ref=e354]:
              - generic [ref=e355]:
                - button "Xem ảnh LEGO Botanicals Tulip Bouquet" [ref=e356]:
                  - img "Những bông tulip nhiều màu trong bình hoa" [ref=e358]
                - button "Thích LEGO Botanicals Tulip Bouquet" [ref=e359]:
                  - img [ref=e360]
              - button "Mở chi tiết LEGO Botanicals Tulip Bouquet" [ref=e362]:
                - heading "LEGO Botanicals Tulip Bouquet" [level=3] [ref=e363]
                - generic [ref=e364]:
                  - generic [ref=e365]: LEGO Botanicals
                  - generic [ref=e366]: ·
                  - generic [ref=e367]: 500 nghìn – 1 triệu
                - paragraph [ref=e368]: Một bó tulip có thể cùng nhau lắp trong một buổi tối rảnh rồi giữ lại lâu dài như món trang trí nhỏ.
                - generic [ref=e369]:
                  - text: Xem chi tiết
                  - img [ref=e370]
          - generic [ref=e373]:
            - paragraph [ref=e374]:
              - text: Đang xem
              - strong [ref=e375]: 8/12
              - text: gợi ý trong mục này
            - button "Xem thêm 4 gợi ý" [ref=e376]
          - dialog "Hương nước hoa của riêng em" [ref=e378]:
            - button "Đóng lời nhắn" [ref=e379]:
              - img [ref=e380]
            - img "Chai nước hoa thanh lịch bên những cánh hoa" [ref=e384]
            - generic [ref=e385]:
              - paragraph [ref=e386]: Jo Malone London
              - heading "Hương nước hoa của riêng em" [level=2] [ref=e387]
              - paragraph [ref=e388]: Peony & Blush Suede mang sắc hoa mẫu đơn, táo đỏ và da lộn mềm, phù hợp cho một dấu hương nữ tính nhưng không quá ngọt.
              - generic [ref=e389]:
                - paragraph [ref=e390]: Vì sao gợi ý này phù hợp
                - paragraph [ref=e391]: Peony & Blush Suede mang sắc hoa mẫu đơn, táo đỏ và da lộn mềm, phù hợp cho một dấu hương nữ tính nhưng không quá ngọt.
              - generic [ref=e393]:
                - img [ref=e394]
                - paragraph [ref=e397]: Một lời nhắn cho em
                - blockquote [ref=e398]: Anh gửi vào hương thơm Một chiều hoa vừa nở Để mỗi lần em bước Cả ngày bỗng dịu hơn.
              - generic "Phong cách" [ref=e399]:
                - generic [ref=e400]: Nước hoa
                - generic [ref=e401]: Nữ tính
                - generic [ref=e402]: Cá nhân
              - paragraph [ref=e403]: Giá tham khảo:Từ 175 USD
              - 'link "Xem nơi tham khảo: Peony & Blush Suede Cologne" [ref=e404] [cursor=pointer]':
                - /url: https://www.jomalone.com/product/25946/27028/colognes/peony-blush-suede-cologne
                - text: "Xem nơi tham khảo: Peony & Blush Suede Cologne"
                - img [ref=e405]
              - generic [ref=e409]:
                - button "Em thích" [ref=e410]:
                  - img [ref=e411]
                  - text: Em thích
                - button "Thích nhất" [ref=e413]:
                  - img [ref=e414]
                  - text: Thích nhất
                - button "Bỏ khỏi so sánh" [active] [pressed] [ref=e416]:
                  - img [ref=e417]
                  - text: Bỏ khỏi so sánh
          - generic [ref=e421]:
            - generic [ref=e422]:
              - generic [ref=e423]:
                - img [ref=e424]
                - text: Điều em muốn nhắn thêm về quà và những bất ngờ
              - generic [ref=e426]: 0/500
            - textbox "Điều em muốn nhắn thêm về quà và những bất ngờ" [ref=e427]:
              - /placeholder: Em thích được tặng món đồ, trải nghiệm hay bất ngờ như thế nào?
            - status [ref=e428]: Đã lưu trên thiết bị này
        - generic [ref=e429]:
          - img [ref=e430]
          - heading "Xem lại lựa chọn đã lưu" [level=2] [ref=e432]
          - paragraph [ref=e433]: Tiếp tục chỉnh sửa, chia sẻ hoặc tải danh sách trên thiết bị này.
          - button "Xem những điều em yêu" [disabled] [ref=e434]:
            - text: Xem những điều em yêu
            - img [ref=e435]
    - contentinfo [ref=e437]:
      - paragraph [ref=e438]: Điều Em Yêu
      - paragraph [ref=e439]: Được lưu riêng trên thiết bị này, dành riêng cho em.
  - button "Open Next.js Dev Tools" [ref=e445] [cursor=pointer]:
    - img [ref=e446]
  - alert [ref=e449]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test("compares two catalogue items and closes the comparison with Escape", async ({
  4  |   page,
  5  | }) => {
  6  |   await page.goto("/");
  7  |   const detailButtons = page.getByRole("button", { name: /Mở chi tiết / });
  8  |   const firstDetailButton = detailButtons.first();
  9  | 
  10 |   await firstDetailButton.click();
  11 |   let productDialog = page.getByRole("dialog");
  12 |   await productDialog
  13 |     .getByRole("button", { name: "Thêm vào so sánh" })
  14 |     .click();
> 15 |   await productDialog.getByRole("button", { name: "Đóng lời nhắn" }).click();
     |                                                                      ^ Error: locator.click: Test timeout of 60000ms exceeded.
  16 | 
  17 |   await detailButtons.nth(1).click();
  18 |   productDialog = page.getByRole("dialog");
  19 |   await productDialog
  20 |     .getByRole("button", { name: "Thêm vào so sánh" })
  21 |     .click();
  22 |   await productDialog.getByRole("button", { name: "Đóng lời nhắn" }).click();
  23 | 
  24 |   const tray = page.getByLabel("Danh sách so sánh");
  25 |   await tray.getByRole("button", { name: "So sánh 2 món" }).click();
  26 | 
  27 |   const compareDialog = page.getByRole("dialog", { name: "So sánh gợi ý" });
  28 |   await expect(compareDialog).toBeVisible();
  29 |   await expect(compareDialog.locator("article")).toHaveCount(2);
  30 | 
  31 |   await page.keyboard.press("Escape");
  32 |   await expect(compareDialog).toBeHidden();
  33 |   await expect(tray.getByRole("button", { name: "So sánh 2 món" })).toBeFocused();
  34 | });
  35 | 
```