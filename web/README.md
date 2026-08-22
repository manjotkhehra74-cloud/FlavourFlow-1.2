# HRMate web console

The browser console for HRMate. It is a dependency-free ES-module app — no build step,
no bundler — served as static files by the HRMate API (`server/src/index.js`), so
`https://hrmate.duckdns.org` serves the console and `/api/v1/*` serves the API from the
same origin.

## Screens

| Route | Screen | Permission |
| --- | --- | --- |
| `#/dashboard` | Punch in/out, today's counts, 14-day trend, department split, audit feed | `dashboard.view` |
| `#/attendance` | Week strip, punch timeline, month summary, team register, manual entries | `attendance.view` (`attendance.manage` for manual) |
| `#/leave` | Gradient balance card, apply for leave, approvals with Pending/Approved/Rejected/Calendar tabs | `leave.view` (`leave.manage` to approve) |
| `#/employees` | Directory with search, department chips and today's status per person | `employees.view` (`employees.manage` to edit) |
| `#/employees?id=N` | Employee profile: gradient header, Overview / Attendance / Leave tabs, manual entry | `employees.view` |
| `#/reports` | Gradient month card with a trend line, insights, PDF/Excel/CSV export, department bars, per-employee rates | `reports.view` |
| `#/users` | Role tiles that double as filters, status chips, per-user actions sheet (edit, reset password, enable/disable) | `users.view` (`users.manage` to add) |
| `#/notifications` | Today / Earlier grouping, All / Unread / Announcements filters, send announcement | `notifications.view` (`settings.manage` to broadcast) |
| `#/settings` | Profile card, account rows, language / appearance / text size, sign out | `dashboard.view` |

**Users** also carries account recovery: edit any account, change a role, disable it, or set
a new password for a locked-out colleague. The API refuses to let anyone change their own
role, disable their own account, or remove the last active super admin.

Navigation comes from `GET /api/v1/meta/navigation` and is filtered by `js/rbac.js`, a
mirror of `server/src/rbac.js`. Hiding a control is only a convenience — the API is still
the authority and rejects anything the role may not do.

## Design language

The console follows the approved mobile designs in
[`design/ui-specification.md`](../design/ui-specification.md): gradient hero cards, pill
chips, segmented controls, week strips, punch timelines, status tiles and full-width
gradient calls to action. Those components live at the bottom of `css/styles.css` and are
shared by every screen, so a new page should reuse them rather than invent styles.

## Layout

```
web/
  index.html              app shell + boot screen
  manifest.webmanifest    installable PWA metadata
  css/styles.css          design tokens and every component style
  js/api.js               fetch wrapper, token storage, 401 handling
  js/rbac.js              permission mirror
  js/ui.js                DOM/format helpers, icons, toasts, modals
  js/app.js               shell, sidebar, hash router
  js/pages/*.js           one module per screen
  assets/                 logo and icons
```

## Local development

```bash
cd server
npm install
DATABASE_PATH=./data/demo.sqlite node tools/seed-demo.js     # optional demo data
DATABASE_PATH=./data/demo.sqlite JWT_SECRET=local-dev-secret npm run dev
```

Open http://localhost:3101. The demo seed prints its login. Static files are served with
no cache outside production, so a plain refresh picks up edits.

## Conventions

- Every value rendered into HTML goes through `esc()` from `js/ui.js`.
- Pages export `meta` (`key`, `title`, `subtitle`) and `render(outlet, context)`.
- `context` provides `user`, `reload()` and `refreshBadges()`.
- Colours, radii and shadows live in the `:root` block of `css/styles.css`; the palette
  matches the Flutter client (`#1E6FE0` blue, `#22C55E` green).

## Languages

`web/js/i18n.js` holds gettext-style dictionaries for Punjabi (`pa`, the default), Hindi
(`hi`) and English (`en`). The English sentence *is* the key, so an untranslated string
renders in English instead of showing a raw identifier. `t()` also interpolates `{name}`
placeholders and translates the known server error messages.

The dictionary is resolved at import time, so module-level `t()` calls are safe. Changing
the language from Settings (or from the language chips on the sign-in screen) reloads the
page so every module picks up the new dictionary.

## Display preferences

`web/js/prefs.js` stores language, appearance (System / Light / Dark) and text size per
device in `localStorage` under `hrmate.prefs`. Appearance sets `data-theme` on `<html>`;
text size sets the body font size.

## Offline behaviour

A red sticky bar appears when the browser goes offline and clears itself with a toast when
the connection returns. A failed `fetch` reports "Could not reach the server" rather than a
raw `TypeError`.

## Browser test harness

`web/tests/` boots the console inside JSDOM against a running dev server and drives it the
way a person would. JSDOM cannot execute `<script type="module">`, so `harness.mjs`
supplies the DOM, points relative `fetch` calls at the server and imports `js/app.js`
directly.

```sh
cd server && npm install --no-save --ignore-scripts jsdom
cd server && DATABASE_PATH=./data/demo.sqlite node tools/seed-demo.js
cd server && DATABASE_PATH=./data/demo.sqlite PORT=3101 node src/index.js &

node web/tests/sweep.mjs +919000000001 pa dark   # every route renders, no thrown errors
node web/tests/shell.mjs +919000000001 pa dark   # app bar, search, tab bar, filters
node web/tests/onboarding.mjs                    # first run: no employees -> working punch
```

`onboarding.mjs` needs a database with only a super admin:

```sh
cd server && DATABASE_PATH=./data/fresh.sqlite ADMIN_NAME="Manjot Singh" \
  ADMIN_PHONE="+919501606877" ADMIN_PASSWORD="fresh-password-123" \
  node tools/bootstrap-super-admin.js
```

Arguments are `<phone> <language> <appearance>`. Filter the noisy JSDOM warnings with
`| grep -v "Not implemented"`.
