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

## Changing or recovering credentials

The phone number is the login id, so both it and the password can be changed without a
redeploy.

**From the console (normal case).** Every signed-in user has **Settings**, where they can
change their name, phone, email and password. A super admin or HR manager can also open
**Users** to edit any account or set a new password for someone who is locked out.

Two rules are enforced by the API and cannot be clicked around:

- you cannot change your own role or disable your own account;
- HRMate always keeps at least one active `super_admin`.

**From the VPS (everyone is locked out).** `tools/reset-credentials.js` works directly on
the database, so it needs no password. Always launch it through `tools/hrmate-cli.sh`:

```bash
cli=/opt/hrmate/server/tools/hrmate-cli.sh

sudo $cli tools/reset-credentials.js --list
sudo $cli tools/reset-credentials.js --id 1 --password 'a-new-long-password'
sudo $cli tools/reset-credentials.js --id 1 --new-phone '+91XXXXXXXXXX'
sudo $cli tools/reset-credentials.js --id 1 --activate
```

The wrapper exists because three things go wrong when these scripts are run by hand:
`/etc/hrmate.env` is root-only so `source` fails, a login shell usually finds Node 24
instead of the pinned Node 20, and writing as root leaves the SQLite files owned by root.
`hrmate-cli.sh` loads the environment as root, pins `/opt/node20/bin`, then drops to the
service account, so the database keeps its owner. Run any maintenance script through it:

```bash
sudo $cli tools/close-attendance-day.js
```

Sign in afterwards and change the password again from **Settings**, so the one typed on a
shell line does not stay in use. Passwords are never printed by the tool, and the audit log
redacts every password field.

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
