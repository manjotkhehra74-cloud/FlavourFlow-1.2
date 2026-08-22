# HRMate API

## First account security

HRMate deliberately starts with **no public registration** and **no default password**. The first account is created only from the VPS shell after the API environment file is in place.

```bash
cd /opt/hrmate/server
set -a && source /etc/hrmate.env && set +a
ADMIN_NAME='Manjot Khehra' \
ADMIN_PHONE='+91XXXXXXXXXX' \
ADMIN_PASSWORD='use-a-unique-12-plus-character-password' \
npm run bootstrap:admin
```

The command is idempotent: once any user exists, it will not make another first account. The first account is always `super_admin`; it has every current and future HRMate permission. Add HR managers, supervisors, and employees later from **User Management**.

Never put real credentials in Git, screenshots, or chat.

## Web console

The API also serves the browser console from the repository's `web/` directory, so
`https://hrmate.duckdns.org` returns the app and `/api/v1/*` returns JSON from the same
origin. Override the location with `WEB_ROOT` if the console is deployed elsewhere; when
the directory is missing the API still starts and logs a warning.

Client-side routes fall back to `web/index.html`; `/api/*`, `/uploads/*` and `/health` are
never captured by that fallback.

## Demo data (local only)

```bash
DATABASE_PATH=./data/demo.sqlite node tools/seed-demo.js
```

Seeds eight employees, two weeks of attendance and a few leave requests. It refuses to run
with `NODE_ENV=production`.

## Node runtime

Production runs Node 20 with the native `better-sqlite3` driver. If that addon cannot be
loaded, `src/db/index.js` falls back to the built-in `node:sqlite` module through
`src/db/sqlite-fallback.js` so a sandbox without a compiler can still run the app. The
fallback is for development only — `tools/preflight-hrmate.sh` keeps deployments on Node 20.
