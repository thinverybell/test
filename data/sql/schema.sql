-- ============================================================
-- Thầy Gia Huy — MySQL schema (toàn bộ data tài khoản + settings)
-- Charset: utf8mb4
-- Chạy 1 lần trên MySQL 5.7+ / 8.x / MariaDB 10.3+
-- ============================================================

CREATE DATABASE IF NOT EXISTS giahuy_hub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE giahuy_hub;

-- ---------- Tài khoản khách ----------
CREATE TABLE IF NOT EXISTS guests (
  id            VARCHAR(32)  PRIMARY KEY,
  username      VARCHAR(64)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar        MEDIUMTEXT   NULL,
  muted         TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    BIGINT       NOT NULL,
  updated_at    BIGINT       NULL,
  UNIQUE KEY uq_guests_username (username)
) ENGINE=InnoDB;

-- ---------- Học sinh ----------
CREATE TABLE IF NOT EXISTS students (
  id            VARCHAR(32)  PRIMARY KEY,
  username      VARCHAR(64)  NOT NULL,
  invite_code   VARCHAR(32)  NOT NULL,
  owner_id      VARCHAR(32)  NULL,
  class_id      VARCHAR(32)  NULL,
  created_at    BIGINT       NOT NULL,
  UNIQUE KEY uq_students_username (username)
) ENGINE=InnoDB;

-- ---------- Giáo viên ----------
CREATE TABLE IF NOT EXISTS teachers (
  id            VARCHAR(32)  PRIMARY KEY,
  username      VARCHAR(64)  NOT NULL,
  invite_code   VARCHAR(32)  NOT NULL,
  avatar        MEDIUMTEXT   NULL,
  permissions   JSON         NULL,
  created_at    BIGINT       NOT NULL,
  UNIQUE KEY uq_teachers_username (username)
) ENGINE=InnoDB;

-- ---------- Quản lý ----------
CREATE TABLE IF NOT EXISTS managers (
  id            VARCHAR(32)  PRIMARY KEY,
  username      VARCHAR(64)  NOT NULL,
  invite_code   VARCHAR(32)  NOT NULL,
  permissions   JSON         NULL,
  created_at    BIGINT       NOT NULL,
  UNIQUE KEY uq_managers_username (username)
) ENGINE=InnoDB;

-- ---------- Hồ sơ admin (1 hàng) ----------
CREATE TABLE IF NOT EXISTS admin_profile (
  id            TINYINT      PRIMARY KEY DEFAULT 1,
  username      VARCHAR(64)  NOT NULL DEFAULT 'Admin',
  password_hash VARCHAR(255) NOT NULL,
  updated_at    BIGINT       NULL
) ENGINE=InnoDB;

-- Mật khẩu mặc định: giahuy-admin (bcrypt, sẽ được seed bởi server nếu trống)
INSERT IGNORE INTO admin_profile (id, username, password_hash, updated_at)
VALUES (1, 'Admin', '', UNIX_TIMESTAMP() * 1000);

-- ---------- Lớp học ----------
CREATE TABLE IF NOT EXISTS classes (
  id            VARCHAR(32)  PRIMARY KEY,
  name          VARCHAR(128) NOT NULL,
  teacher_id    VARCHAR(32)  NULL,
  created_at    BIGINT       NOT NULL
) ENGINE=InnoDB;

-- ---------- Lịch học / sự kiện ----------
CREATE TABLE IF NOT EXISTS schedule_events (
  id            VARCHAR(32)  PRIMARY KEY,
  event_date    DATE         NOT NULL,
  event_type    VARCHAR(32)  NOT NULL,
  title         VARCHAR(255) NULL,
  class_id      VARCHAR(32)  NULL,
  student_id    VARCHAR(32)  NULL,
  created_by    VARCHAR(64)  NULL,
  created_at    BIGINT       NOT NULL,
  KEY idx_schedule_date (event_date),
  KEY idx_schedule_class (class_id),
  KEY idx_schedule_student (student_id)
) ENGINE=InnoDB;

-- ---------- Settings website (key-value) ----------
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key   VARCHAR(64)  PRIMARY KEY,
  setting_value MEDIUMTEXT   NULL,
  updated_at    BIGINT       NULL
) ENGINE=InnoDB;

-- ---------- Thông báo hệ thống ----------
CREATE TABLE IF NOT EXISTS notifications (
  id            VARCHAR(32)  PRIMARY KEY,
  title         VARCHAR(255) NULL,
  body          TEXT         NULL,
  created_at    BIGINT       NOT NULL,
  created_by    VARCHAR(64)  NULL
) ENGINE=InnoDB;

-- ---------- Tickets ----------
CREATE TABLE IF NOT EXISTS tickets (
  id            VARCHAR(32)  PRIMARY KEY,
  code          VARCHAR(32)  NULL,
  title         VARCHAR(255) NULL,
  body          TEXT         NULL,
  status        VARCHAR(32)  NOT NULL DEFAULT 'open',
  priority      VARCHAR(16)  NULL,
  meta_json     JSON         NULL,
  created_at    BIGINT       NOT NULL,
  updated_at    BIGINT       NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ticket_seq (
  id            TINYINT      PRIMARY KEY DEFAULT 1,
  next_val      INT          NOT NULL DEFAULT 1
) ENGINE=InnoDB;

INSERT IGNORE INTO ticket_seq (id, next_val) VALUES (1, 1);

-- ---------- Session token (tuỳ chọn, server-side) ----------
CREATE TABLE IF NOT EXISTS sessions (
  token         VARCHAR(64)  PRIMARY KEY,
  role          VARCHAR(16)  NOT NULL,
  user_id       VARCHAR(32)  NULL,
  username      VARCHAR(64)  NOT NULL,
  permissions   JSON         NULL,
  created_at    BIGINT       NOT NULL,
  expires_at    BIGINT       NOT NULL,
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_exp (expires_at)
) ENGINE=InnoDB;
