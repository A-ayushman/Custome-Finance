-- 0010_instruments_payments.sql
-- Instrument types and financial instruments
CREATE TABLE IF NOT EXISTS instrument_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_instruments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type_id INTEGER,
  title TEXT NOT NULL,
  reference_no TEXT,
  vendor_id INTEGER,
  amount REAL NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','approved','rejected','expired')),
  issue_date TEXT,
  expiry_date TEXT,
  document_url TEXT,
  notes TEXT,
  created_by_level INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES instrument_types(id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);
CREATE INDEX IF NOT EXISTS idx_instruments_status ON financial_instruments(status);
CREATE INDEX IF NOT EXISTS idx_instruments_type ON financial_instruments(type_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_instruments_ref ON financial_instruments(reference_no) WHERE reference_no IS NOT NULL;
