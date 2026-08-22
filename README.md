# HRMate

A practical HRMS for manufacturing teams, beginning with **G.D. Foods Mfg (I) Pvt. Ltd.** in Khadur Sahib, Tarn Taran, Punjab.

HRMate helps teams manage employee records, GPS/selfie attendance, leave workflows, and monthly attendance reports. It ships as a browser console plus a Flutter client, both on one Node.js, Express, and SQLite backend.

## Phase 1

- Employee master: name, phone, role, department, shift, joining date, and photo
- Attendance: punch in/out with GPS and optional selfie, supervisor entries, automatic late / half-day / absent detection
- Leave: casual, sick, and earned leave with balances and approval workflow
- Monthly attendance register with PDF and Excel exports
- Role-based access for `super_admin`, `hr_manager`, `supervisor`, and `employee`
- Permission-gated navigation and audited broadcast notifications

## Stack

- **Web console:** dependency-free ES modules served by the API — see [`web/`](web/README.md)
- **Mobile:** Flutter (Android first) — see [`mobile/`](mobile/README.md)
- **API:** Node.js 20 + Express — see [`server/`](server/README.md)
- **Database:** SQLite via `better-sqlite3`
- **Deployment:** dedicated GCP VPS behind Caddy at `https://hrmate.duckdns.org`

## Run it locally

```bash
cd server
npm install
DATABASE_PATH=./data/demo.sqlite node tools/seed-demo.js     # optional demo data
DATABASE_PATH=./data/demo.sqlite JWT_SECRET=local-dev-secret npm run dev
```

Then open http://localhost:3101 — the console and the API share one origin, so there is
no CORS or proxy setup in development.

## Status

- ✅ API, SQLite schema, RBAC, audit log and notifications
- ✅ Web console: dashboard, attendance, leave, employees, reports, users, notifications
- ✅ Live on the GCP VPS behind Caddy with TLS
- ⏳ Flutter client wiring against the live API

---

Built for shop-floor-friendly HR operations.
