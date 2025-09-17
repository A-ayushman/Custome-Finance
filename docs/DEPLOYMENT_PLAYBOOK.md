# Deployment Playbook

## One-time Setup
1) wrangler login
2) npm ci
3) npm run db:create -> copy database_id into both wrangler files.

## Deploy
- ./deploy.sh (does validate -> migrate -> seed -> deploy)

## Post-Deploy
- Open site URL, verify SW registered.
- Sidebar should show Backend API: healthy.
- If stale, use incognito or unregister SW.

## Rollback
- Re-deploy previous commit; D1 migrations are forward-only, so use backups for data.
