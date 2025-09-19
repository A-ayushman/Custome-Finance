-- 0006_unique_gstin.sql
-- Goal: Enforce unique GSTINs while preserving existing data
-- Strategy: Deduplicate rows by GSTIN (keep earliest id), then add partial UNIQUE index

-- 1) Remove duplicate GSTIN rows (keep the earliest id per GSTIN)
WITH ranked AS (
  SELECT id, gstin,
         ROW_NUMBER() OVER (PARTITION BY gstin ORDER BY id) AS rn
  FROM vendors
  WHERE gstin IS NOT NULL
)
DELETE FROM vendors
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 2) Create partial UNIQUE index on GSTIN (ignores NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS ux_vendors_gstin
ON vendors(gstin)
WHERE gstin IS NOT NULL;
