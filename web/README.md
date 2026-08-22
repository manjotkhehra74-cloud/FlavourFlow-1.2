# HRMate web console

The browser console for HRMate. It is a dependency-free ES-module app — no build step,
no bundler — served as static files by the HRMate API (`server/src/index.js`), so
`https://hrmate.duckdns.org` serves the console and `/api/v1/*` serves the API from the
same origin.

## Screens

| Route | Screen | Permission |
| --- | --- | --- |
| `#/dashboard` | Punch in/out, today's counts, 14-day trend, department split, audit feed | `dashboard.view` |
| `#/attendance` | Monthly register, my attendance, manual entries | `attendance.view` (`attendance.manage` for manual) |
| `#/leave` | Balances, apply for leave, approvals queue | `leave.view` (`leave.manage` to approve) |
| `#/employees` | Directory, search, profile drawer, add/edit | `employees.view` (`employees.manage` to edit) |
| `#/reports` | Monthly summary, per-employee rates, CSV export | `reports.view` |
| `#/users` | Login accounts and roles | `users.view` (`users.manage` to add) |
| `#/notifications` | Broadcasts and audit alerts | `notifications.view` |
| `#/settings` | Change your own name, phone (login id) and password | `dashboard.view` |

**Users** also carries account recovery: edit any account, change a role, disable it, or set
a new password for a locked-out colleague. The API refuses to let anyone change their own
role, disable their own account, or remove the last active super admin.

Navigation comes from `GET /api/v1/meta/navigation` and is filtered by `js/rbac.js`, a
mirror of `server/src/rbac.js`. Hiding a control is only a convenience — the API is still
the authority and rejects anything the role may not do.

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
