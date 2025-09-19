-- 0006_unique_gstin.sql
-- Add a partial unique index on vendors.gstin (ignoring NULLs)
-- SQLite/D1 supports partial indexes with WHERE clause

CREATE UNIQUE INDEX IF NOT EXISTS ux_vendors_gstin ON vendors(gstin) WHERE gstin IS NOT NULL;
