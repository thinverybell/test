# Sửa giao diện Phòng thí nghiệm Arduino / ESP32

## Đã sửa

- Đồng bộ nền phía sau với giao diện sáng của phòng thí nghiệm, không còn nền xanh đậm phía sau các panel trắng.
- Cho trang web trên màn hình lớn cuộn dọc bình thường; Console và Thư viện có vùng cuộn riêng để không giữ toàn bộ trang ở một chiều cao cố định.
- Giữ khu vực Bài thực hành và Mã nhúng nằm phía dưới workspace để có thể kéo trang xuống xem tiếp.
- Cho phép kéo di chuyển bo mạch, LED mẫu, Nút nhấn mẫu và các linh kiện được thêm vào màn hình bằng phần tiêu đề.
- Khi kéo module từ Thư viện vào Canvas, module được đặt tại đúng vị trí thả chuột thay vì luôn xuất hiện ở một tọa độ cố định.
- Sửa cơ chế bind lại port sau khi render lại board, tránh mất tương tác nối dây.
- Sửa Undo khi di chuyển linh kiện: snapshot được tạo trước khi di chuyển.
- Việt hóa các nhãn giao diện chính: điều khiển, trạng thái, bộ lọc, Console, chẩn đoán, giám sát nối tiếp, sự kiện, nút thao tác, trạng thái module và thông báo.
- Giữ nguyên mã lỗi, topology/netlist, contract 200 module và các chức năng lab hiện có.

## Kiểm tra

- `node --check js/lab.js`: PASS
- Regression lab: 18/18 PASS
- Catalog: 200 module
- 198 module vẫn `unverified`, 2 board vẫn `verified / behavioral` theo chính sách nguồn xác minh hiện tại.
