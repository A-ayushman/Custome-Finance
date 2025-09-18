-- 0005_seed_idempotent.sql
-- Purpose: Make seed data idempotent on remote by inserting roles and admin user only if missing
-- Safe to run multiple times

-- Roles
INSERT OR IGNORE INTO roles (name, level, permissions) VALUES 
('Payee', 1, '["payments_execute"]'),
('User', 2, '["vendors_create", "pos_create"]'),
('Admin', 3, '["vendors_approve", "pos_approve"]'),
('SuperAdmin', 4, '["all_approvals", "numbering_manage"]'),
('Owner', 5, '["all_permissions", "system_settings"]');

-- Default admin user (password: admin123)
INSERT OR IGNORE INTO users (email, password_hash, role_id, full_name) VALUES 
('admin@odicinternational.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'System Administrator');
