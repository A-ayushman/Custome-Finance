# Operations Runbook - ODIC Finance

This runbook provides step-by-step procedures for routine operations and incident response.

## Deployments
- Production Deploy: `npm run deploy:worker` (API), `wrangler pages deploy public` (UI)
- Staging Deploy: `npm run deploy:worker:staging`
- Verify: Health endpoint, key workflows, logs via `wrangler tail`

## Database Migrations
- Production: `npm run db:migrate`
- Staging: `npm run db:migrate:staging`
- Rollback: Prepare compensating migration (D1 does not support automatic down)

## Rollback Procedure (API)
1. List deployments: `wrangler deployments list --config wrangler-worker.toml --env production`
2. Identify previous good version-id
3. Rollback: `wrangler deployments rollback <version-id>`
4. Validate health and key endpoints

## Secrets & Config
- JWT_SECRET, EMAIL_API_KEY, ADMIN_PASSWORD_HASH via `wrangler secret`
- Verify with: `wrangler deployments status` and functional tests

## Incident Response
1. Acknowledge alert/ticket and assign priority (P1–P4)
2. Collect evidence: logs, recent releases, DB state
3. Mitigate (rate limit, feature flag, or rollback)
4. Root cause analysis and corrective action
5. Post-incident report shared with stakeholders

## Performance & Rate Limiting
- Mutations limited per IP per minute; tune limits in workers-site/index.js
- Consider Cloudflare Rules for global rate limiting if needed

## Access Management
- Use GitHub CODEOWNERS (recommended) and review-based merges
- Rotate secrets periodically

## Backups & Data Export
- Export CSV endpoints; scheduled exports supported via cron Workers (future)

## Change Management
- Create PRs, squash merge, tag releases, update Release_Notes.md
- Use staging to validate before production
