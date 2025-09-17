# QA Checklist

- [ ] Assets served with correct MIME (CSS/JS/SW/manifest)
- [ ] SW registers and activates
- [ ] /api/health reachable from Pages
- [ ] Database IDs consistent in both wrangler files
- [ ] Migrations apply remotely without errors
- [ ] Seed data present (roles, admin user, GST rates, TDS sections)
- [ ] PWA manifest valid, icons present (when added)
- [ ] CORS: prod allowlist only
