# Service Level Agreement (SLA) - ODIC Finance

This SLA describes service commitments for the ODIC Finance production environment.

## 1. Scope
- API: https://api.odicinternational.com
- Dashboard: https://dashboard.odicinternational.com
- Business hours: 09:00–18:00 IST, Mon–Fri (default; adjust per contract)

## 2. Availability
- Target uptime: 99.9% monthly for API and Dashboard
- Maintenance windows: announced at least 24 hours in advance
- Exclusions: Cloudflare platform incidents, customer-controlled configuration changes, scheduled maintenance

## 3. Response & Resolution Targets
Severity | Example | Response (ack) | Workaround | Resolution
---|---|---|---|---
P1 (Critical) | Prod outage, data corruption | 30 min | 2 hrs | 8 hrs
P2 (High) | Core feature degraded | 2 hrs | 8 hrs | 2 business days
P3 (Medium) | Non-core bug | 1 business day | N/A | 5 business days
P4 (Low) | UI glitch, docs | 2 business days | N/A | Next planned release

## 4. Support Channels
- Email: support@odicinternational.com
- Ticketing: JIRA/Service Desk (if available)
- Emergency: On-call number (if contracted)

## 5. Backups & Recovery
- D1 data export procedures available; recommended daily snapshots
- Recovery: Point-in-time restore to last available snapshot; RPO <= 24h, RTO <= 8h (default; adjust per contract)

## 6. Change Management
- Versioned releases with Release Notes
- Staging environment for pre-prod verification
- Rollback via Cloudflare deployments if needed

## 7. Security
- Transport encryption (HTTPS)
- Role-based access control; unique emails for users
- Audit logging (planned extension)

## 8. Metrics & Reporting
- Deployment history via Cloudflare
- Optional uptime monitoring (Statuspage/Pingdom) per contract

## 9. Exceptions
- Third-party outages, misuse, configuration by customer that bypasses best practices

## 10. Review
- SLA reviewed semi-annually or upon significant changes
