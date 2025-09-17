# Developer Guide

## Getting Started
- Requirements: Node 18+, Wrangler ^4.37, Cloudflare account.
- Install deps: npm ci
- Auth: wrangler login

## Dev
- Run Pages locally: npm run dev
- API local (Miniflare implicit): wrangler dev --config wrangler-worker.toml

## D1
- Create DB: npm run db:create
- Apply migrations: npm run db:migrate
- Seed: npm run db:seed

## Deploy
- ./deploy.sh (validates DB IDs, migrates, seeds, deploys Pages and Worker).

## Git Workflow (GenSpark)
- Branch: genspark_ai_developer.
- After EVERY change: commit (conventional).
- Rebase onto origin/main, squash if needed.
- Push and create/update PR; share link.

## Coding Standards
- Vanilla JS, modular methods, graceful error handling.
- Hono routes: typed JSON responses, consistent envelope.
- SQL migrations: idempotent, forward-only.
