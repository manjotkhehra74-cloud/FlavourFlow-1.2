#!/usr/bin/env bash
# Run on the HRMate VPS after deploy. It does not mutate records.
set -Eeuo pipefail
API_URL="${API_URL:-http://127.0.0.1:3101/api/v1}"
: "${SMOKE_ADMIN_PHONE:?Set SMOKE_ADMIN_PHONE in the shell}"
: "${SMOKE_ADMIN_PASSWORD:?Set SMOKE_ADMIN_PASSWORD in the shell}"

health="$(curl --fail --silent --show-error "${API_URL%/api/v1}/health")"
printf '%s' "$health" | grep -q '"status":"ok"'
token="$(curl --fail --silent --show-error -X POST "$API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  --data "{\"phone\":\"$SMOKE_ADMIN_PHONE\",\"password\":\"$SMOKE_ADMIN_PASSWORD\"}" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).token))')"
[ -n "$token" ]
curl --fail --silent --show-error "$API_URL/auth/me" -H "Authorization: Bearer $token" >/dev/null
curl --fail --silent --show-error "$API_URL/meta/navigation" >/dev/null
curl --fail --silent --show-error "$API_URL/dashboard" -H "Authorization: Bearer $token" >/dev/null

# Account recovery paths must stay reachable: a wrong current password is rejected, not accepted.
code="$(curl --silent --output /dev/null --write-out '%{http_code}' -X POST "$API_URL/auth/change-password" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $token" \
  --data '{"currentPassword":"deliberately-wrong","newPassword":"deliberately-wrong-too"}')"
[ "$code" = "403" ] || { echo "change-password guard returned $code, expected 403"; exit 1; }

# Web console: the SPA shell and its entry script must be served by the same origin.
console="$(curl --fail --silent --show-error "${API_URL%/api/v1}/")"
printf '%s' "$console" | grep -q 'id="app"'
curl --fail --silent --show-error --output /dev/null "${API_URL%/api/v1}/js/app.js"
echo "HRMate API + web console smoke test VERIFIED ✓"
