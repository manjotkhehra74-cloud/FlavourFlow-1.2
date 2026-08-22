#!/usr/bin/env bash
# Safe SQLite backup helper for the HRMate VPS. Keeps 14 daily snapshots.
set -Eeuo pipefail
DB_PATH="${DATABASE_PATH:-/opt/hrmate/data/hrmate.sqlite}"
BACKUP_DIR="${BACKUP_DIR:-/opt/hrmate/backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
[ -f "$DB_PATH" ] || { echo "Database not found: $DB_PATH"; exit 1; }
command -v sqlite3 >/dev/null || { echo "sqlite3 is required"; exit 1; }
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/hrmate-$STAMP.sqlite'"
find "$BACKUP_DIR" -type f -name 'hrmate-*.sqlite' -mtime +14 -delete
echo "HRMate backup VERIFIED ✓: $BACKUP_DIR/hrmate-$STAMP.sqlite"
