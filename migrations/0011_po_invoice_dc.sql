-- 0011_po_invoice_dc.sql

CREATE TABLE IF NOT EXISTS purchase_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  po_number TEXT NOT NULL UNIQUE,
  items TEXT, -- JSON array
  amount REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_by_level INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);
CREATE INDEX IF NOT EXISTS idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  invoice_number TEXT NOT NULL UNIQUE,
  amount REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  due_date TEXT,
  created_by_level INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);
CREATE INDEX IF NOT EXISTS idx_inv_vendor ON invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inv_status ON invoices(status);

CREATE TABLE IF NOT EXISTS delivery_challans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  dc_number TEXT NOT NULL UNIQUE,
  items TEXT, -- JSON array
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','delivered')),
  created_by_level INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);
CREATE INDEX IF NOT EXISTS idx_dc_vendor ON delivery_challans(vendor_id);
CREATE INDEX IF NOT EXISTS idx_dc_status ON delivery_challans(status);
