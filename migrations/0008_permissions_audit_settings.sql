-- 0008_permissions_audit_settings.sql
-- Adds audit log, settings, payments, and vendor draft column

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id INTEGER,
  actor_level INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- Settings key/value (editable by L4/L5 via API)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add is_draft flag to vendors for draft vendors
ALTER TABLE vendors ADD COLUMN is_draft INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_vendors_is_draft ON vendors(is_draft);

-- Minimal payments table scaffolding
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  invoice_ref TEXT,
  amount REAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','done')),
  proof_url TEXT,
  created_by_level INTEGER,
  approved_by_level INTEGER,
  marked_done_by_level INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);
CREATE INDEX IF NOT EXISTS idx_payments_vendor ON payments(vendor_id);
