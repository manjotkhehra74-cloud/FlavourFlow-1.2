#!/usr/bin/env bash
# Run from a release checkout on the HRMate GCP VPS. Idempotent by design.
set -Eeuo pipefail
APP_DIR="${APP_DIR:-/opt/hrmate}"; SERVICE="hrmate"; ENV_FILE="${ENV_FILE:-/etc/hrmate.env}"
cd "$APP_DIR/server"
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE"; exit 1; }
cp "$ENV_FILE" .env
node --check src/index.js
find src -name '*.js' -print0 | xargs -0 -n1 node --check
npm ci --omit=dev
sudo systemctl daemon-reload
sudo systemctl enable --now "$SERVICE"
sudo systemctl restart "$SERVICE"
sudo systemctl is-active --quiet "$SERVICE"
echo "HRMate deployment VERIFIED ✓"
