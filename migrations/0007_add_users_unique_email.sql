-- 0007_add_users_unique_email.sql
-- Ensure unique email addresses for users
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users(email);
