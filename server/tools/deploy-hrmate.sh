#!/usr/bin/env bash
# Run from a release checkout on the HRMate GCP VPS. Idempotent by design.
set -Eeuo pipefail
APP_DIR="${APP_DIR:-/opt/hrmate}"; SERVICE="hrmate"; ENV_FILE="${ENV_FILE:-/etc/hrmate.env}"
export PATH="/opt/node20/bin:$PATH"
cd "$APP_DIR/server"
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE"; exit 1; }
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] && [ "$NODE_MAJOR" -lt 22 ] || { echo "HRMate requires Node.js 20 LTS (found $(node --version))"; exit 1; }
cp "$ENV_FILE" .env
ENV_FILE="$ENV_FILE" "$APP_DIR/server/tools/preflight-hrmate.sh"
node --check src/index.js
find src -name '*.js' -print0 | xargs -0 -n1 node --check
npm ci --omit=dev
sudo chmod 755 "$APP_DIR/server/tools/hrmate-cli.sh"
sudo install -m 644 "$APP_DIR/server/deploy/hrmate.service" /etc/systemd/system/hrmate.service
sudo install -m 644 "$APP_DIR/server/deploy/hrmate-attendance-close.service" /etc/systemd/system/hrmate-attendance-close.service
sudo install -m 644 "$APP_DIR/server/deploy/hrmate-attendance-close.timer" /etc/systemd/system/hrmate-attendance-close.timer
sudo install -m 644 "$APP_DIR/server/deploy/hrmate-backup.service" /etc/systemd/system/hrmate-backup.service
sudo install -m 644 "$APP_DIR/server/deploy/hrmate-backup.timer" /etc/systemd/system/hrmate-backup.timer
sudo systemctl daemon-reload
sudo systemctl enable --now "$SERVICE"
sudo systemctl enable --now hrmate-attendance-close.timer
sudo systemctl enable --now hrmate-backup.timer
sudo systemctl restart "$SERVICE"
sudo systemctl is-active --quiet "$SERVICE"
if [ -n "${SMOKE_ADMIN_PHONE:-}" ] && [ -n "${SMOKE_ADMIN_PASSWORD:-}" ]; then
  API_URL="${API_URL:-http://127.0.0.1:${PORT:-3101}/api/v1}" "$APP_DIR/server/tools/smoke-api.sh"
fi
echo "HRMate deployment VERIFIED ✓"
