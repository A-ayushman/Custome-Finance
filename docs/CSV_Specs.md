# CSV Import/Export Specifications

## Export: /api/vendors/export.csv
Columns:
- id, company_name, legal_name, gstin, pan, state, state_code, pin_code, business_type, status, rating, created_at

## Import: /api/vendors/import.csv
- Content-Type: text/csv or multipart/form-data with field name `file`
- Required columns: company_name
- Optional columns: legal_name, gstin, pan, state, state_code, pin_code, business_type, status, rating
- Status values: pending | approved | rejected | suspended (aliases: active→approved, inactive→suspended)
- Upsert by GSTIN when provided

Example:
company_name,legal_name,gstin,pan,state,state_code,pin_code,business_type,status,rating
Acme Corp,ACME INC,22AAAAA0000A1Z5,ABCDE1234F,Delhi,DL,110001,Manufacturer,approved,4
