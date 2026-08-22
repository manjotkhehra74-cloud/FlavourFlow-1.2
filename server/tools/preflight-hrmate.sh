#!/usr/bin/env bash
# Run on the GCP VPS from /opt/hrmate/server before deployment.
set -Eeuo pipefail
ENV_FILE="${ENV_FILE:-/etc/hrmate.env}"
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE"; exit 1; }
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] && [ "$NODE_MAJOR" -lt 22 ] || { echo "Node 20 LTS required; found $(node --version)"; exit 1; }
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
: "${JWT_SECRET:?JWT_SECRET is required in $ENV_FILE}"
: "${DATABASE_PATH:?DATABASE_PATH is required in $ENV_FILE}"
mkdir -p "$(dirname "$DATABASE_PATH")"
[ -w "$(dirname "$DATABASE_PATH")" ] || { echo "Database directory is not writable"; exit 1; }
node --check src/index.js
find src -name '*.js' -print0 | xargs -0 -n1 node --check
bash -n tools/deploy-hrmate.sh
bash -n tools/backup-hrmate.sh
bash -n tools/smoke-api.sh
bash -n tools/hrmate-cli.sh
WEB_ROOT="${WEB_ROOT:-$(cd .. && pwd)/web}"
[ -f "$WEB_ROOT/index.html" ] || { echo "Web console missing at $WEB_ROOT"; exit 1; }
[ -f "$WEB_ROOT/js/app.js" ] || { echo "Web console assets missing at $WEB_ROOT/js"; exit 1; }
echo "HRMate preflight VERIFIED ✓"
