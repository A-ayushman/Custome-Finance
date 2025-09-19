# ODIC Finance - Release Notes

All notable changes to this project will be documented in this file.

## [1.0.0-beta.1] - 2025-09-19
### Added
- Vendors API with CRUD and filtering (Hono on Cloudflare Workers)
- D1 database with migrations and seed data
- Status normalization: active->approved, inactive->suspended
- Input validation for GSTIN/PAN
- CSV Export/Import (upsert by GSTIN)
- GSTIN availability endpoint
- UNIQUE constraints: vendors.gstin (partial), users.email
- Strict CORS allowlist; security headers for API responses

### Fixed
- D1_TYPE_ERROR by sanitizing undefined->null for all DB bindings
- Robust lastRowId handling after inserts

### Notes
- Apply migrations 0001..0007 on production via `npm run db:migrate`
- Configure CORS allowlist to include your UI and API domains
