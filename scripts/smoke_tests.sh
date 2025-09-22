#!/usr/bin/env bash
ODIC Finance System smoke tests
Usage: ./scripts/smoke_tests.sh https://api-staging.odicinternational.com
./scripts/smoke_tests.sh https://api.odicinternational.com
set -euo pipefail
BASE="${1:-https://api-staging.odicinternational.com}"

pass=0 fail=0
note() { printf "\n==> %s\n" "$*"; }
ok() { echo "PASS"; pass=$((pass+1)); }
no() { echo "FAIL"; fail=$((fail+1)); }

curl_json() { curl -sS "$@"; }
http_code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

expect_header() {
  local url="$1"; shift
  local hdr="$1"; shift
  if curl -i "$url" 2>/dev/null | grep -i "^$hdr:" >/dev/null; then ok; else no; fi
}

TEST_HEALTH() {
  note "Health and security headers ($BASE)"
  if [ "$(http_code "$BASE/api/health")" = "200" ]; then ok; else no; fi
  expect_header "$BASE/api/health" "Cache-Control"
  expect_header "$BASE/api/health" "X-Content-Type-Options"
  expect_header "$BASE/api/health" "Referrer-Policy"
  expect_header "$BASE/api/health" "X-Frame-Options"
  expect_header "$BASE/api/health" "Permissions-Policy"
}

TEST_CORS_BLOCK() {
  note "CORS early 403 for disallowed origin"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: https://evil.com" "$BASE/api/health")
  if [ "$code" = "403" ]; then ok; else no; fi
}

TEST_STATUS_NORMALIZATION() {
  note "Status normalization active->approved"
  local out
  out=$(curl_json -X POST "$BASE/api/vendors" -H "Content-Type: application/json" -H "x-user-level: 2" \
    --data '{"company_name":"Smoke Status Co","status":"active"}')
  echo "$out" | grep -q '"status":"approved"' && ok || no
}

TEST_VALIDATORS() {
  note "GSTIN/PAN availability validators"
  curl_json "$BASE/api/vendors/unique/gstin/22ABCDE1234F1Z5" | grep -q '"gstin"' && ok || no
  curl_json "$BASE/api/vendors/unique/pan/ABCDE1234F" | grep -q '"pan"' && ok || no
}

TEST_CSV() {
  note "CSV import/export with dry-run"
  local tmpcsv
  tmpcsv="$(mktemp -t vendors.XXXX).csv"
  cat > "$tmpcsv" << 'EOF2'
company_name,legal_name,gstin,pan,state,business_type,status,rating
Acme Traders Pvt Ltd,Acme Traders,22ABCDE1234F1Z5,ABCDE1234F,Karnataka,Trader,approved,4
Minimal Co,,,ABCDE1234F,Maharashtra,Service Provider,pending,2
EOF2

  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/vendors/import.csv" -H "x-user-level: 2" -H "x-dry-run: 1" --data-binary @"$tmpcsv")
  [ "$code" = "200" ] && ok || no

  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/vendors/import.csv" -H "x-user-level: 2" --data-binary @"$tmpcsv")
  [ "$code" = "200" ] && ok || no

  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/vendors/export.csv")
  [ "$code" = "200" ] && ok || no

  rm -f "$tmpcsv"
}

TEST_PAYMENTS() {
  note "Payments role enforcement"
  local out id code
  out=$(curl_json -X POST "$BASE/api/payments" -H "Content-Type: application/json" -H "x-user-level: 2" \
    --data '{"vendor_id":null,"invoice_ref":"SMOKE-PR-1","amount":1,"status":"pending"}')
  id=$(echo "$out" | sed -n 's/.*"id":\([0-9][0-9]*\).*/\1/p' | head -n1)
  if [ -z "$id" ]; then echo "Could not create payment"; no; return; fi

  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/payments/$id/proof" -H "Content-Type: application/json" -H "x-user-level: 2" \
    --data '{"proof_url":"https://example.com/proof.jpg"}')
  [ "$code" = "403" ] && ok || no

  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/payments/$id/proof" -H "Content-Type: application/json" -H "x-user-level: 1" \
    --data '{"proof_url":"https://example.com/proof.jpg"}')
  [ "$code" = "200" ] && ok || no

  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/payments/$id/mark-done" -H "x-user-level: 1")
  [ "$code" = "200" ] && ok || no
}

main() {
  echo "Running smoke tests against: $BASE"
  TEST_HEALTH
  TEST_CORS_BLOCK
  TEST_STATUS_NORMALIZATION
  TEST_VALIDATORS
  TEST_CSV
  TEST_PAYMENTS
  echo "\nSummary: PASS=$pass FAIL=$fail"
  [ "$fail" -eq 0 ]
}

main "$@"
