# HRMate

A practical HRMS for manufacturing teams, beginning with **G.D. Foods Mfg (I) Pvt. Ltd.** in Khadur Sahib, Tarn Taran, Punjab.

HRMate will help teams manage employee records, GPS/selfie attendance, leave workflows, and monthly attendance reports. The product is being built as a Flutter client with a Node.js, Express, and SQLite backend.

## Phase 1

- Employee master: name, phone, role, department, shift, joining date, and photo
- Attendance: punch in/out with GPS and optional selfie, supervisor entries, automatic late / half-day / absent detection
- Leave: casual, sick, and earned leave with balances and approval workflow
- Monthly attendance register with PDF and Excel exports
- Role-based access for `super_admin`, `hr_manager`, `supervisor`, and `employee`
- Permission-gated navigation and audited broadcast notifications

## Planned stack

- **Mobile:** Flutter (Android first)
- **API:** Node.js + Express
- **Database:** SQLite via `better-sqlite3`
- **Deployment:** dedicated GCP VPS service and database

## Status

Fresh project setup in progress. The initial logo is the next approval milestone, followed by the Flutter and server foundations.

---

Built for shop-floor-friendly HR operations.
