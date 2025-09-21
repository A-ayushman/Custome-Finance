-- 0012_instruments_details.sql
-- Extend financial_instruments with details JSON and key identifiers
ALTER TABLE financial_instruments ADD COLUMN details TEXT; -- JSON
ALTER TABLE financial_instruments ADD COLUMN bg_number TEXT;
ALTER TABLE financial_instruments ADD COLUMN lc_number TEXT;
ALTER TABLE financial_instruments ADD COLUMN utr TEXT;
ALTER TABLE financial_instruments ADD COLUMN pfms_id TEXT;
ALTER TABLE financial_instruments ADD COLUMN gem_order_no TEXT;
ALTER TABLE financial_instruments ADD COLUMN signer_id TEXT;

-- Partial unique indexes for identifiers when provided
CREATE UNIQUE INDEX IF NOT EXISTS ux_instr_bg_number ON financial_instruments(bg_number) WHERE bg_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_instr_lc_number ON financial_instruments(lc_number) WHERE lc_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_instr_utr ON financial_instruments(utr) WHERE utr IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_instr_pfms ON financial_instruments(pfms_id) WHERE pfms_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_instr_gem ON financial_instruments(gem_order_no) WHERE gem_order_no IS NOT NULL;

-- Seed standard instrument types
INSERT OR IGNORE INTO instrument_types (name) VALUES
  ('Bank Guarantee'),
  ('Letter of Credit'),
  ('RTGS'),
  ('NEFT'),
  ('UPI_B2B'),
  ('e-Kuber'),
  ('GeM Payment'),
  ('Digital Signature'),
  ('PFMS');
