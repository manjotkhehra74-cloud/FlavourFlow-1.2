#!/usr/bin/env bash
# Runs an HRMate maintenance script exactly the way the service runs: the production
# environment file, the pinned Node 20 runtime, and the service account, so nothing in
# the data directory changes owner.
#
#   sudo /opt/hrmate/server/tools/hrmate-cli.sh tools/reset-credentials.js --list
#   sudo /opt/hrmate/server/tools/hrmate-cli.sh tools/reset-credentials.js --id 1 --password '...'
#
set -Eeuo pipefail
APP_DIR="${APP_DIR:-/opt/hrmate}"
ENV_FILE="${ENV_FILE:-/etc/hrmate.env}"
SERVICE_USER="${SERVICE_USER:-www-data}"
NODE_BIN="${NODE_BIN:-/opt/node20/bin}"

[ $# -ge 1 ] || { echo "Usage: $0 <script.js> [arguments...]"; exit 1; }
# The environment file is root-only on purpose, so re-run under sudo when needed.
[ "$(id -u)" -eq 0 ] || exec sudo -E "$0" "$@"
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE"; exit 1; }
[ -x "$NODE_BIN/node" ] || { echo "Node 20 not found at $NODE_BIN/node"; exit 1; }

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a
: "${DATABASE_PATH:?DATABASE_PATH is required in $ENV_FILE}"

cd "$APP_DIR/server"
script="$1"; shift
[ -f "$script" ] || { echo "No such script: $APP_DIR/server/$script"; exit 1; }

exec sudo -u "$SERVICE_USER" env \
  PATH="$NODE_BIN:$PATH" \
  DATABASE_PATH="$DATABASE_PATH" \
  JWT_SECRET="${JWT_SECRET:-}" \
  UPLOADS_ROOT="${UPLOADS_ROOT:-}" \
  NODE_ENV="${NODE_ENV:-production}" \
  node "$script" "$@"
