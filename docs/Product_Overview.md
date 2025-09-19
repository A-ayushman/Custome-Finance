# ODIC Finance - Product Overview

ODIC Finance is a finance management platform for vendor onboarding, POs, invoices, and payments with GST/TDS support.

## Key Capabilities
- Vendor onboarding with role-based approvals
- Purchase Order and Invoice workflows
- GST/TDS rates and thresholds
- CSV import/export
- Audit logging (planned)
- Cloudflare global scale and security

## Architecture at a Glance
- UI: Cloudflare Pages site (static web app)
- API: Cloudflare Worker (Hono) + D1 database
- Data: D1 SQL with migrations for schema and indexes

## Security
- JWT-based sessions (HttpOnly cookies)
- Role-based access control
- Input validation on critical fields (GSTIN, PAN)
- Strict CORS to allowed domains only
