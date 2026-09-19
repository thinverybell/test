# Phòng thí nghiệm Arduino / ESP32 — Implementation Notes

## Phạm vi đã tích hợp

Website giữ nguyên shell/sidebar hiện tại và thêm `lab.html` cho workspace thực hành Arduino/ESP32.

Các lớp chính được tách trong frontend:

- UI Shell / workspace / responsive Console
- Board Registry: `data/lab-board-profiles.json`
- Component/module Registry: `data/lab-modules.json`
- Contract/domain rules: `data/lab-contract.json`
- Netlist + wiring validation: `js/lab.js`
- Diagnostics + Console + Serial Monitor + Events: `js/lab.js`
- Compiler-lite + runtime behavioral simulation: `js/lab.js`
- Project persistence + JSON export/import + Undo/Redo: `js/lab.js`

## Catalog 200 module

Catalog chứa đủ 200 module theo master prompt, giữ `MODULE_001` → `MODULE_200` ổn định và đủ 41 trường contract.

Không gắn nhãn native một cách giả tạo. Hiện có 2 profile đã có nguồn xác minh kỹ thuật:

- `MODULE_001` — Arduino Uno R3 — `verified`, `behavioral`
- `MODULE_018` — ESP32 DevKitC V4 — `verified`, `behavioral`

198 module còn lại giữ `verificationStatus=unverified` và `supportLevel=unverified` cho tới khi có pinout/source/model đủ điều kiện.

## Netlist và wiring

Netlist dùng `componentId + portId` làm nguồn sự thật. `x/y`, route point và vị trí SVG chỉ phục vụ render.

Wiring có preview và chỉ commit khi release target port. Kết nối sai trong Strict mode tạo diagnostic + modal và không âm thầm sửa topology. Sandbox cho phép lưu fault để phục vụ bài học.

## Diagnostics / Console

Console có:

- Diagnostics / Serial Monitor / Events
- Error / Warning / Success
- Search và filter
- Exact source/target port
- Focus / Chân đúng / Why? / Cách sửa / Copy
- Active / Resolved và occurrence count
- Export diagnostic report
- Responsive drawer trên màn hình hẹp

## Compiler / Runtime

Đây là **browser compiler-lite**: kiểm tra cấu trúc code, board target và firmware resource map; không giả vờ là toolchain Arduino/ESP-IDF hoàn chỉnh và không tự sửa code học sinh.

Runtime là mô hình hành vi trong trình duyệt, có Serial Monitor và LED demo; chưa phải hardware-in-the-loop.

## Chạy frontend

Có thể serve thư mục gốc bằng static server, ví dụ:

```bash
cd giahuy_site
python -m http.server 8080
```

Mở `http://localhost:8080/lab.html`.

Backend MySQL hiện tại vẫn nằm ở `server/` và được giữ nguyên. `lab.html` không phụ thuộc MySQL để lưu project demo; project được persist bằng `localStorage` và có JSON export/import.

## Regression test

Chạy:

```bash
node tools/lab-regression.cjs
```

Ngoài test riêng của lab, đã kiểm tra cú pháp toàn bộ JS trong `js/`, `server/`, `server/routes/` và test sự tồn tại của các file asset/CSS/JS mà `lab.html` tham chiếu.

Browser smoke test tương tác đầy đủ không thực hiện được trong môi trường đóng gói này vì Chromium bị môi trường chặn loopback/file URL; đây là giới hạn của môi trường kiểm thử, không phải kết luận rằng mọi luồng UI trình duyệt đã được E2E xác nhận.
