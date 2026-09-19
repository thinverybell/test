# Sidebar Unified Final Fix

Đã đồng bộ thanh điều hướng bên trên các trang unlocked:

- Mọi mục dùng cùng chiều cao, bo góc, padding và cấu trúc icon + nhãn + mũi tên.
- Mục đang chọn dùng nền xanh/lilac nhạt, viền sáng, thanh nhấn bên trái và glow nhẹ giống mẫu đã yêu cầu.
- `Phòng thí nghiệm` dùng cùng kiểu active với `Trang chủ` và các mục khác.
- Nút `Thu gọn` được tách thành vùng riêng phía trên; menu có khoảng đệm cố định nên không đè lên `Trang chủ`.
- Chế độ thu gọn vẫn giữ active glow ở icon.
- CSS final được nạp sau các stylesheet sidebar cũ để tránh cascade cũ ghi đè.

## Kiểm tra
- Node syntax: PASS
- Lab regression: 18/18 PASS
