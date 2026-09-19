# Data người dùng

**Nguồn lưu chính:** MySQL (xem `data/sql/schema.sql` + `server/`).

Toàn bộ tài khoản (guest, student, teacher, manager, admin) và settings website được API ghi **một chiều** vào MySQL. Không xuất file data ra máy user.

- Schema: `data/sql/schema.sql`
- Backend: `server/` (Node + mysql2)
- Frontend bật API: `js/api-config.js` → `window.GIAHUY_API`
