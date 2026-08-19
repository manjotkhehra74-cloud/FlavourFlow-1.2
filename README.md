# Pulse HR

A React Native (Expo) HR app inspired by HROne, with a Node/Express backend.
**Payroll / CTC screens have been intentionally excluded.** Everything else is in:

- ✅ Mark attendance with **geo-tagging** (Expo Location) — selfie/geo/web source
- ✅ Attendance history, late/absent/WFH statuses
- ✅ Attendance regularisation & mark-attendance requests
- ✅ **Bulk approvals** (multi-select, approve/reject) — HROne-style
- ✅ Leave management (casual / sick / earned / optional) with balances
- ✅ Team directory + **team actions**: Resignation, Transfer, On Duty, Assign shift, Restriction
- ✅ **Social wall**: posts, likes, comments, badges, rewards
- ✅ **Birthdays & work anniversaries**, one-tap "Send a wish"
- ✅ Helpdesk / tickets (IT, HR, facilities) with status flow
- ✅ Manager dashboard — team size, present today, pending approvals

## Project layout

```
server/    Node + Express REST API (JSON file store, zero native deps)
mobile/    Expo React Native app (iOS, Android, web)
```

## 1. Run the backend

```bash
cd server
npm install
npm run seed      # creates demo employees + sample data
npm start         # http://localhost:4000
```

Seed accounts (password: `password`):

| Role     | Email                            |
|----------|----------------------------------|
| Manager  | akshay@pulsehr.app           |
| Employee | deepak.c@pulsehr.app         |
| Employee | anuj@pulsehr.app             |
| Employee | (any other in `server/src/db/seed.js`) |

## 2. Run the mobile app

```bash
cd mobile
npm install
npm start
```

- Press **`w`** to open the web build (http://localhost:8081).
- Scan the QR with **Expo Go** on a phone for the native app.
- If running on a real device, point the app at your machine's IP:
  ```bash
  EXPO_PUBLIC_API_URL=http://192.168.x.x:4000/api npm start
  ```

## 3. One-command preview (web + API together)

The repo ships a tiny dev reverse-proxy used for browser previews.
It exposes one public port (8082) that forwards `/api/*` to the backend (4000)
and everything else to the Expo web dev server (8081), including HMR websockets.

```bash
# terminal 1
cd server && npm start
# terminal 2
cd mobile && npx expo start --web --port 8081
# terminal 3
cd mobile && node dev-proxy.js     # open http://localhost:8082
```

## API summary

| Method | Path                              | Purpose                        |
|--------|-----------------------------------|--------------------------------|
| POST   | `/api/auth/login`                 | Login, returns JWT             |
| GET    | `/api/dashboard/summary`          | Home tiles + manager stats     |
| POST   | `/api/attendance/clock`           | Clock in / out + geo coords    |
| GET    | `/api/attendance/history`         | Monthly attendance records     |
| POST   | `/api/attendance/requests`        | Raise regularisation request   |
| GET    | `/api/attendance/requests/pending`| Pending items for manager      |
| POST   | `/api/attendance/requests/bulk`   | Bulk approve/reject            |
| GET/POST | `/api/leaves/*`                 | Balances, apply, review        |
| GET    | `/api/employees`                  | Directory search               |
| GET    | `/api/employees/team`             | Manager's team                 |
| POST   | `/api/team/actions`               | Resignation/transfer/on-duty…  |
| GET/POST | `/api/social/posts`             | Social wall feed + create      |
| POST   | `/api/social/posts/:id/like`      | Like / unlike                  |
| GET    | `/api/employees/events/today`     | Birthdays & anniversaries      |
| POST   | `/api/social/wishes`              | Send birthday/anniv wish       |
| GET/POST | `/api/tickets`                  | Helpdesk tickets               |

## Tech notes

- Auth uses JWT + bcrypt. Token stored on-device via `AsyncStorage`.
- The backend ships with a tiny zero-dependency JSON document store (`server/src/db/index.js`).
  Swap it for SQLite/Postgres later by replacing the collection helpers — the route code is the same.
- Brand colour is HROne-style deep green (`#065f46`).
