#!/usr/bin/env bash
set -euo pipefail

# One-command staging setup for ODIC Finance
# - Creates staging D1 if missing
# - Updates wrangler-worker.toml with D1 database_id
# - Applies migrations & seeds
# - Deploys Worker to staging

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v wrangler >/dev/null 2>&1; then
  echo "Wrangler not found. Please run: npm ci (wrangler is a devDependency)" >&2
  exit 1
fi

# Ensure login
if ! wrangler whoami >/dev/null 2>&1; then
  echo "Cloudflare login required..." >&2
  wrangler login || { echo "Login failed" >&2; exit 1; }
fi

echo "[1/5] Ensure staging D1 exists..."
CREATE_OUT=$(wrangler d1 create odic-finance-staging 2>&1 || true)
# Parse UUID from output if created, else fetch existing via list
STAGING_ID="$(echo "$CREATE_OUT" | sed -n 's/.*"uuid"\s*:\s*"\([a-f0-9-]\+\)".*/\1/p' | head -n1)"
if [ -z "$STAGING_ID" ]; then
  echo "D1 may already exist; fetching id via list..."
  LIST_OUT=$(wrangler d1 list 2>/dev/null || true)
  STAGING_ID="$(echo "$LIST_OUT" | grep -i 'odic-finance-staging' -A2 | sed -n 's/.*"uuid"\s*:\s*"\([a-f0-9-]\+\)".*/\1/p' | head -n1)"
fi
if [ -z "$STAGING_ID" ]; then
  echo "Could not determine staging D1 database_id. Please create manually and update wrangler-worker.toml." >&2
  exit 1
fi

echo "Staging D1 ID: $STAGING_ID"

echo "[2/5] Update wrangler-worker.toml with staging database_id..."
TOML_FILE="$ROOT_DIR/wrangler-worker.toml"
if [ ! -f "$TOML_FILE" ]; then
  echo "Missing $TOML_FILE" >&2
  exit 1
fi
# Replace placeholder only if present
if grep -q 'REPLACE_WITH_STAGING_D1_ID' "$TOML_FILE"; then
  sed -i.bak "s/REPLACE_WITH_STAGING_D1_ID/$STAGING_ID/g" "$TOML_FILE"
  echo "Updated staging database_id in wrangler-worker.toml"
else
  echo "wrangler-worker.toml already has a staging database_id; skipping replace"
fi

echo "[3/5] Apply migrations to staging..."
npm run -s db:migrate:staging

echo "[4/5] Seed staging (idempotent seed)..."
npm run -s db:seed:staging

echo "[5/5] Deploy Worker to staging..."
npm run -s deploy:worker:staging

echo "Done. Next steps: map domain api-staging.odicinternational.com in Cloudflare Dashboard > Workers > Custom Domains."
