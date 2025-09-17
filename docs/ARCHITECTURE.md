# ODIC Finance System – Architecture

## Overview
- Frontend: Cloudflare Pages, Vanilla HTML/CSS/JS, Chart.js, PWA (SW + Manifest).
- API: Cloudflare Workers (Hono).
- Database: Cloudflare D1 (SQLite).
- Infra as Code: Wrangler configs (wrangler.toml, wrangler-worker.toml).
- Environments: dev (permissive CORS), production (allowlist CORS).

## Components
- public/: SPA assets, service worker, manifest.
- workers-site/: Hono app with routes and CORS.
- migrations/: D1 schema and seeds.
- deploy.sh: validate -> migrate -> seed -> deploy.

## Request Flow
1) User loads Pages site.
2) SW registers; app.js initializes and calls /api/health on Worker.
3) Worker responds JSON; UI status updated.
4) Future: CRUD endpoints from frontend -> Worker -> D1.

## Security
- CORS: * in dev; allowlisted origins in prod.
- Sessions: planned table and middleware.
- Secrets: use Wrangler vars + bindings.

## Observability
- Console logs in frontend.
- Worker logs via Wrangler.

## PWA
- sw.js minimal today; future cache strategies (cache-first for static, network-first for API).
