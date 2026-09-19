# Gia Huy Hub API — MySQL backend

Lưu **toàn bộ data tài khoản** (guest, student, teacher, manager, admin, settings…) **một chiều vào MySQL**.  
Không export file ra máy user.

## 1. Cài MySQL & import schema

```bash
mysql -u root -p < ../data/sql/schema.sql
```

## 2. Cấu hình

```bash
cd server
cp .env.example .env
# Sửa MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
```

## 3. Chạy API

```bash
npm install
npm start
# → http://localhost:3001
```

Kiểm tra: mở `http://localhost:3001/api/auth/health`

## 4. Frontend

Trong `js/api-config.js`:

```js
window.GIAHUY_API = 'http://localhost:3001';
// Production:
// window.GIAHUY_API = 'https://api.ten-mien-cua-ban.com';
```

Khi `GIAHUY_API` có giá trị, Auth gọi API → data ghi vào MySQL.  
Session token giữ trên trình duyệt; **danh sách tài khoản nằm trên server**.

## 5. API chính

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/api/auth/register-guest` | Đăng ký khách |
| POST | `/api/auth/login-guest` | Đăng nhập khách |
| POST | `/api/auth/login-student` | Đăng nhập HS |
| POST | `/api/auth/login-teacher` | Đăng nhập GV |
| POST | `/api/auth/login-manager` | Đăng nhập QL |
| POST | `/api/auth/login-admin` | Đăng nhập admin |
| GET | `/api/auth/session` | Session hiện tại |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/accounts/guests/:id` | Chi tiết guest |
| PUT | `/api/accounts/guests/:id` | Cập nhật hồ sơ guest |
| GET/PUT | `/api/settings/...` | Settings website |

Header: `Authorization: Bearer <token>`

## 6. Hosting

- VPS / máy chủ có Node 18+ và MySQL
- Hoặc Railway / Render / Fly.io + MySQL managed
- **Không** chạy được trên Vercel static thuần (cần process Node riêng)

Mật khẩu admin mặc định lần đầu: `giahuy-admin` (đã hash bcrypt trong DB).
