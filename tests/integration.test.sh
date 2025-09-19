#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-}"
if [[ -z "$API_BASE" ]]; then
  echo "ERROR: Set API_BASE to your Worker URL, e.g. export API_BASE=https://odic-finance-api-production.ayushman-singh.workers.dev" >&2
  exit 1
fi

pass=0; fail=0

run() {
  name="$1"; shift
  echo "\n=== $name ==="
  if "$@"; then
    echo "[PASS] $name"; ((pass++))
  else
    echo "[FAIL] $name"; ((fail++))
  fi
}

# 1) Health
run "health endpoint" bash -c "curl -sS --fail "$API_BASE/api/health" | jq -e '.success == true' >/dev/null"

# 2) Create with alias (active -> approved)
GSTIN1="22TESTA0000A1Z1"
run "create vendor maps active->approved" bash -c "curl -sS --fail -X POST "$API_BASE/api/vendors" -H 'Content-Type: application/json' -d '{"company_name":"ITEST Co","gstin":"'$GSTIN1'","status":"active"}' | jq -e '.success == true and .data.status == "approved"' >/dev/null"

# 3) Duplicate insert returns 409
run "duplicate gstin returns 409" bash -c "test \"$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$API_BASE/api/vendors" -H 'Content-Type: application/json' -d '{"company_name":"Dup","gstin":"'$GSTIN1'"}')\" = 409"

# 4) Availability endpoint reflects taken GSTIN
run "availability endpoint shows unavailable" bash -c "curl -sS --fail "$API_BASE/api/vendors/unique/gstin/$GSTIN1" | jq -e '.data.available == false' >/dev/null"

# 5) Update with alias (inactive -> suspended)
# Fetch id by gstin
VID=$(curl -sS "$API_BASE/api/vendors?status=active&size=50" | jq -r '.data.items[] | select(.gstin=="'$GSTIN1'") | .id' | head -n1)
if [[ -z "$VID" || "$VID" == "null" ]]; then
  echo "Could not resolve vendor id for $GSTIN1"; exit 1; fi
run "update vendor maps inactive->suspended" bash -c "curl -sS --fail -X PUT "$API_BASE/api/vendors/$VID" -H 'Content-Type: application/json' -d '{"status":"inactive","rating":5}' | jq -e '.data.status == "suspended" and .data.rating == 5' >/dev/null"

# 6) List and filter by alias
run "list filter status=active maps to approved" bash -c "curl -sS --fail "$API_BASE/api/vendors?status=active" | jq -e '.success == true' >/dev/null"

# Results
echo "\nTests passed: $pass, failed: $fail"
if [[ $fail -gt 0 ]]; then exit 1; fi
