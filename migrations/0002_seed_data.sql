-- Insert Roles
INSERT INTO roles (name, level, permissions) VALUES 
('Payee', 1, '["payments_execute"]'),
('User', 2, '["vendors_create", "pos_create"]'),
('Admin', 3, '["vendors_approve", "pos_approve"]'),
('SuperAdmin', 4, '["all_approvals", "numbering_manage"]'),
('Owner', 5, '["all_permissions", "system_settings"]');

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, role_id, full_name) VALUES 
('admin@odic-international.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'System Administrator');

-- Insert GST Rates
INSERT INTO gst_rates (rate, description) VALUES 
(0, 'Exempt'), (5, 'Essential'), (12, 'Standard'), (18, 'Most goods'), (28, 'Luxury');

-- Insert TDS Sections
INSERT INTO tds_sections (section, description, rate_company, single_payment_threshold, aggregate_threshold) VALUES 
('194C', 'Contractor', 2.0, 30000, 100000),
('194J', 'Professional', 10.0, 30000, 30000);
