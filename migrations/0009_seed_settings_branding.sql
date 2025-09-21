-- 0009_seed_settings_branding.sql
-- Seed canonical domain, branding, and allowed origins
INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES
  ('canonical_domain', '"https://dashboard.odicinternational.com"', CURRENT_TIMESTAMP),
  ('brand_name', '"ODIC International"', CURRENT_TIMESTAMP),
  ('brand_tagline', '"Vendor Management System (VMS)"', CURRENT_TIMESTAMP),
  ('allowed_origins', '["https://dashboard.odicinternational.com","https://api.odicinternational.com","https://dashboard-staging.odicinternational.com","https://api-staging.odicinternational.com"]', CURRENT_TIMESTAMP);
