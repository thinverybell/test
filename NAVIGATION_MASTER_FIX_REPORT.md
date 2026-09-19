# Master Navigation Fix

## Mục tiêu
Chuẩn hóa toàn bộ thanh điều hướng trên các trang chính, không để mỗi trang có một kiểu sidebar/header riêng, đồng thời luôn hiển thị mục hiện tại bằng hiệu ứng sáng giống mẫu Phòng thí nghiệm.

## Đã sửa
- Sidebar dùng chung một cấu trúc MENU duy nhất: Trang chủ → Thư viện → Tiện ích → Cá nhân & Hỗ trợ.
- Tất cả item dùng cùng chiều cao, padding, bo góc, icon box, màu chữ và hover.
- Mục hiện tại được gắn `active` + `gh-nav-current` và có nền lilac, viền, vạch tím bên trái và glow.
- Trang chủ không còn là item đặc biệt khác kiểu.
- Nút Thu gọn là một thanh riêng phía trên, không chồng lên Trang chủ.
- Hỗ trợ cả URL dạng `.html` và route sạch không có `.html` khi xác định item active.
- Top navigation cũng được chuẩn hóa cùng một ngôn ngữ giao diện và tự đánh dấu active.
- Có controller `gh-navigation-master.js` chạy sau shell/auth/platform để khôi phục navbar nếu code trang cũ thay đổi DOM.
- Giữ nguyên role filtering hiện tại; các mục staff/admin chỉ hiện khi session có quyền phù hợp.

## Kiểm tra
- Node syntax: PASS.
- Lab regression: 18/18 PASS.
