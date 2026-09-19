# Thầy Gia Huy — Website học tập

- Multi-page navigation: index + 7 category pages.
- Admin upload library with categories.
- IndexedDB file storage in the current browser.
- Music playlist at the top of homepage + admin music upload.
- Avatar management, theme switch, search, clock/weather.

## Admin demo
Password: `giahuy-admin`

## Important
This is still a static frontend. Uploaded files are stored locally in the browser using IndexedDB. To make uploads shared for all visitors and persistent on a server, connect the admin functions to Firebase, Supabase, Cloudflare R2, S3, or a Node/PHP backend.

## V6 additions
- Ticket Center với tạo ticket, mã ticket tự động, hàng chờ theo ưu tiên, trạng thái và lịch sử.
- Admin Ticket Queue: tìm kiếm, lọc trạng thái, đổi trạng thái, xóa ticket và xuất JSON.
- Floating “Tạo ticket” CTA trên mọi trang.
- Image safety layer: lazy loading, decoding async, giới hạn kích thước và fallback khi ảnh lỗi.
- Responsive/mobile polish cho Ticket Center.

### Lưu ý dữ liệu
Project vẫn là static frontend. Ticket, lượt tải, yêu thích và dữ liệu admin demo vẫn lưu ở localStorage/IndexedDB của trình duyệt hiện tại. Muốn ticket dùng chung cho nhiều người truy cập, hãy nối phần Ticket API tới Firebase, Supabase hoặc backend Node/PHP.

## V7 premium polish
- Education line icons: Sách, Bút chì, Mũ tốt nghiệp, Bóng đèn, Compa.
- Refined navigation/buttons with smaller proportions, softer borders and cleaner hover states.
- Added subtle grid texture and calm indigo/gold visual language.
- Added floating "Ủng hộ Thầy" button + donation modal.
- Added `assets/donate-qr.png` as a clearly labeled demo QR. Replace it with the real payment QR to activate actual donations without changing the UI.

## V8 — Ticket panel: Duyệt / Trả lời + Discord
- Nút trạng thái admin được tách rõ và tô màu: ✅ Duyệt (resolved), 🔧 Nhận xử lý (progress), ✖ Từ chối (rejected), ↺ Đặt lại chờ (pending), 🗑️ Xóa.
- Thêm tính năng 💬 **Trả lời ticket**: admin bấm "Trả lời" để mở ô nhập phản hồi; phản hồi được lưu vào ticket và hiển thị dạng hội thoại ngay trong Hàng chờ / Lịch sử để người tạo ticket xem được (dữ liệu vẫn lưu ở localStorage trình duyệt, như các mục khác).
- Thêm banner "Tham gia nhóm Discord của lớp" trong panel Ticket Center + 1 icon Discord trong dải mạng xã hội ở trang chủ.
  - **Cần làm:** mở `js/ticket-center.js`, sửa hằng số `DISCORD_URL` ở đầu file thành link mời Discord thật của bạn, và sửa href tương ứng trong `index.html` (phần tử `.social-discord`).
- Làm mới giao diện panel: viền gradient trên cùng, thẻ thống kê có icon, hiệu ứng hover mượt hơn cho toàn bộ nút.

## V9 — Panel polish thêm
- Sửa lỗi panel không cuộn được khi danh sách ticket dài (do `overflow:hidden` chèn nhầm ở bản trước).
- Vạch màu trên đầu panel giờ dính lại khi cuộn, thêm hiệu ứng mở panel mượt, thêm con dấu "GH" cạnh tiêu đề, icon riêng cho từng tab, viền màu trái theo trạng thái ticket, thanh cuộn mảnh tuỳ chỉnh, nút "Tạo ticket" nhấp nháy nhẹ khi có ticket chờ.

## V10 — Nút Like + lượt xem/online ảo
- Mỗi tài nguyên (Plugin/Config/Mod/Asset/Tool/...) có thêm nút ❤ **Thích** cạnh các tag (file, lượt tải, ngày đăng). Số lượt thích có sẵn "hạt giống" ngẫu nhiên theo ID tài nguyên (trông như đã có người thích từ trước) + cộng thêm khi người dùng bấm thích, lưu theo trình duyệt (localStorage), giống cơ chế yêu thích (★) đã có.
- Trang chủ có thêm:
  - Ô **"Đang online"** trong dải thống kê hero (trước đây là chữ tĩnh) — số dao động ảo theo khung giờ trong ngày, cập nhật mỗi 5 giây, có chấm xanh nhấp nháy.
  - Dòng **"👁️ lượt truy cập hôm nay"** trong thẻ đồng hồ góc phải hero — tăng dần một lượng nhỏ ngẫu nhiên mỗi lần tải trang, lưu localStorage nên không bị reset về 0.
- Toàn bộ đều là số liệu **demo** phía client (không có backend thật), giống các số liệu mẫu khác của bản static này.

## V11 — Chuyển thành website học tập "Thầy Gia Huy"
- Đổi toàn bộ thương hiệu từ mrfuji sang **Thầy Gia Huy**, đổi mọi khóa localStorage/IndexedDB nội bộ sang tiền tố `giahuy-*`.
- Đổi bảng màu chủ đạo từ đỏ/vàng sang **chàm/tím (indigo)** kết hợp vàng đồng, áp dụng toàn bộ site (nút, viền, glow, thẻ danh mục).
- Thay bộ icon Nhật Bản (Phú Sĩ/Torii/Sakura/Tháp/Lâu đài) bằng bộ icon học tập nguyên bản: Sách, Bút chì, Mũ tốt nghiệp, Bóng đèn, Compa.
- Danh mục nội dung đổi thành: Bài giảng, Giáo án, Bài tập, Học liệu, Công cụ, Tài nguyên, Hướng dẫn.
- Avatar và favicon mới: biểu tượng mũ tốt nghiệp + sách mở, thiết kế gốc (không dùng ảnh/nhân vật có bản quyền).
- Xoá phụ thuộc ảnh Unsplash bên ngoài, thay bằng gradient/pattern CSS thuần để trang luôn hiển thị ổn định.
- Ticket Center đổi nhãn hiển thị thành "Hỏi đáp" cho phù hợp ngữ cảnh hỏi đáp giáo viên – học sinh.
- Thêm animation loading khi vào Admin Panel (spinner + progress bar) trước khi hiển thị bảng điều khiển.




## Game Center
The Game Center now includes 12 browser-playable canvas games with local high scores, lives, levels, pause/restart, keyboard/pointer/touch support and CoreUI Icons for new UI controls.

## Icon System
New UI icons use the locally bundled CoreUI Icons package.
