# Test Plan

## Scope
- UI smoke (navigation, login demo flow, charts render).
- API: /api/health, future CRUD.
- Integration: frontend -> Worker -> D1.
- PWA: SW registration, manifest validity.

## Environments
- Dev: wrangler pages dev + wrangler dev Worker.
- Prod: Pages + Workers on Cloudflare.

## Test Cases (abbrev)
- PAGES-001: Assets load with correct MIME.
- PWA-001: SW registers successfully.
- API-HEALTH-001: GET /api/health returns 200 and JSON with status healthy.
- UI-STATUS-001: Sidebar shows Backend API: healthy when reachable.
- D1-MIG-001: Migrations apply without error; required tables exist.

## Regression
- After each deploy: rerun smoke, clear SW cache if needed.

## Performance
- Initial load under 2s on broadband; JS bundle under control.
