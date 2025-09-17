-- Vendors table aligned to sample PDFs and UI fields
CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    legal_name TEXT,
    gstin TEXT,
    pan TEXT,
    address_lines TEXT, -- JSON array of address lines
    state TEXT,
    state_code TEXT,
    pin_code TEXT,
    contact_person TEXT,
    contact_number TEXT,
    email TEXT,
    business_type TEXT CHECK (business_type IN ('Service Provider','Distributor','Trader','OEM','Manufacturer') OR business_type IS NULL),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
    rating REAL DEFAULT 0,
    tags TEXT, -- JSON array of tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vendors_company_name ON vendors(company_name);
CREATE INDEX IF NOT EXISTS idx_vendors_gstin ON vendors(gstin);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
