-- 0013: Full GST invoice fields, URP state-code enforcement, TDS thresholds, and partial unique on (vendor_id, invoice_number)

-- Core additions
ALTER TABLE invoices ADD COLUMN invoice_date TEXT;
ALTER TABLE invoices ADD COLUMN currency TEXT DEFAULT 'INR';
ALTER TABLE invoices ADD COLUMN fx_rate REAL;
ALTER TABLE invoices ADD COLUMN taxable_value REAL NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN discount_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN freight_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN other_charges REAL NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN rounding_adjustment REAL NOT NULL DEFAULT 0;

-- GST fields and URP flags
ALTER TABLE invoices ADD COLUMN seller_gstin TEXT;
ALTER TABLE invoices ADD COLUMN buyer_gstin TEXT;
ALTER TABLE invoices ADD COLUMN gst_supply_type TEXT CHECK (gst_supply_type IN ('intra','inter'));
ALTER TABLE invoices ADD COLUMN place_of_supply TEXT;
ALTER TABLE invoices ADD COLUMN cgst_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN sgst_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN igst_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN cess_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN auto_calc_overridden INTEGER NOT NULL DEFAULT 0; -- 0/1
ALTER TABLE invoices ADD COLUMN override_reason TEXT;
ALTER TABLE invoices ADD COLUMN urp_applied INTEGER NOT NULL DEFAULT 1; -- 0/1

-- TDS/TCS/Retention
ALTER TABLE invoices ADD COLUMN tds_rate REAL;
ALTER TABLE invoices ADD COLUMN tds_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN tcs_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN retention_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN tds_threshold_applied INTEGER NOT NULL DEFAULT 0; -- 0/1

-- Matching and attachments
ALTER TABLE invoices ADD COLUMN po_number TEXT;
ALTER TABLE invoices ADD COLUMN dc_numbers TEXT; -- JSON array
ALTER TABLE invoices ADD COLUMN match_status TEXT CHECK (match_status IN ('na','partial','matched')) DEFAULT 'na';
ALTER TABLE invoices ADD COLUMN attachment_url TEXT;
ALTER TABLE invoices ADD COLUMN notes TEXT;

-- Payment linkage
ALTER TABLE invoices ADD COLUMN payment_id INTEGER;
ALTER TABLE invoices ADD COLUMN paid_at TEXT;

-- Partial unique per vendor+invoice_number (when invoice_number is present)
CREATE UNIQUE INDEX IF NOT EXISTS ux_invoices_vendor_invno
ON invoices(vendor_id, invoice_number)
WHERE invoice_number IS NOT NULL;

-- Settings for buyer GSTIN and thresholds
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
  ('canonical_buyer_gstin', NULL, CURRENT_TIMESTAMP),
  ('tds_threshold_single_invoice', '30000', CURRENT_TIMESTAMP),
  ('tds_threshold_cumulative_vendor', '100000', CURRENT_TIMESTAMP),
  ('default_tds_rate', '1', CURRENT_TIMESTAMP),
  ('gst_default_place_of_supply', 'KA', CURRENT_TIMESTAMP),
  ('tax_rounding_mode', 'nearest', CURRENT_TIMESTAMP);
