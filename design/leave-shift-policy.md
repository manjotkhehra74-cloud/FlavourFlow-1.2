# Leave, Weekly-Off, Comp-Off and Shift Policy — design note

Status: **proposal, awaiting sign-off from G.D. Foods before implementation.**
Scope: how HRMate should model leave balances, compensatory off, per-employee weekly
off, and rotating day/night shifts. Written against the Factories Act, 1948 and the
Punjab Industrial Establishments (National and Festival Holidays and Casual and Sick
Leave) Act, 1965, both of which apply to a factory in Khadur Sahib, Tarn Taran.

---

## 1. Statutory baseline (what the law gives, before company policy)

| Item | Statute | Entitlement |
|---|---|---|
| Casual leave | Punjab Act 1965, s.4 | **7 days** per calendar year |
| Sick leave | Punjab Act 1965, s.4 | **14 days** per calendar year (paid at ½ average daily wage if not covered by ESI; ESI-covered workers draw ESI sickness benefit instead) |
| National holidays | Punjab Act 1965, s.3(a) | 26 Jan, 15 Aug, 2 Oct — paid |
| Festival holidays | Punjab Act 1965, s.3(b) | 4–5 days from the Schedule, fixed by the employer at the start of the year |
| Earned / annual leave | Factories Act, s.79 | **1 day for every 20 days worked** in the previous calendar year (adults), after 240 days of work; carry-forward capped at **30 days** |
| Weekly holiday | Factories Act, s.52 | one full day per week; a substituted day must fall within the 3 days before or after, and **no worker may work more than 10 consecutive days** without a whole holiday |
| Compensatory holiday | Factories Act, s.53 | when a weekly holiday is lost, an equal number of compensatory holidays **within the same month or the two months immediately following** |
| Working on a festival/national holiday | Punjab Act 1965, s.5(2) | worker's option: **twice** average daily wage, **or** normal wage plus a substituted holiday within 90 days |
| Hours | Factories Act ss.51, 54, 55, 56 | 48 h/week, 9 h/day, ≥30 min break after 5 h, spread-over ≤ 10.5 h |
| Overtime | Factories Act, s.59 | double wages beyond 9 h/day or 48 h/week |

Company policy may be **more** generous than this, never less. HRMate therefore stores
the statutory numbers as defaults and lets G.D. Foods raise them in Settings.

---

## 2. Compensatory off (comp-off) — how HRMate will model it

**Key point: comp-off is not a yearly quota. It is a ledger.** CL / SL / EL are
*allocated* at the start of the year; comp-off is *earned* one day at a time and
*expires*. Modelling it as a number in `leave_balances` would be wrong, because each
credit has its own expiry date.

### 2.1 How a credit is created

| Trigger | Credit |
|---|---|
| Worked on own weekly off | 1.0 day (≥ half shift → 0.5 day) |
| Worked on a national / festival holiday | 1.0 day — *only if* the worker chose "holiday in lieu"; if he chose double wages, no credit |
| Extra full shift / double shift | 1.0 day, HR-approved, or paid as OT — one or the other, never both |
| Manual credit by HR | any value, reason mandatory, audited |

Auto-credit fires when attendance is marked `present` on a date that the roster says is
a weekly off or a holiday. It lands as **pending** and an HR manager approves it, so a
stray punch never inflates a balance.

### 2.2 Expiry

Default **60 days** from the earn date, which satisfies "within the month in which it
was due or the two months immediately following" (Factories Act s.53). For holiday
working the Punjab Act allows **90 days**. Both are configurable in Settings.

A nightly job (the existing `close-attendance-day` cron) lapses expired credits and
writes an audit row. Employees get a notification **7 days before** a credit lapses —
this is the single most useful thing the module can do for the worker.

### 2.3 Consumption

Applying for `comp_off` leave consumes credits **FIFO by earliest expiry**, so the
credit closest to lapsing is used first. A day of comp-off leave may be split into two
half-days. Balance shown to the employee = Σ (earned − consumed) over non-lapsed credits.

### 2.4 Data model

```sql
CREATE TABLE comp_off_credits (
  id INTEGER PRIMARY KEY,
  employee_id  INTEGER NOT NULL REFERENCES employees(id),
  earned_on    TEXT NOT NULL,          -- the date actually worked
  days         REAL NOT NULL,          -- 0.5 or 1.0
  reason       TEXT NOT NULL,          -- weekly_off | holiday | extra_shift | manual
  attendance_id INTEGER REFERENCES attendance(id),
  expires_on   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | lapsed | consumed
  consumed_days REAL NOT NULL DEFAULT 0,
  approved_by  INTEGER REFERENCES users(id),
  note         TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE comp_off_usage (
  id INTEGER PRIMARY KEY,
  credit_id INTEGER NOT NULL REFERENCES comp_off_credits(id),
  leave_id  INTEGER NOT NULL REFERENCES leaves(id),
  days      REAL NOT NULL
);
```

`leaves.leave_type` gains `comp_off`; the monthly register gains a **CO** mark.

---

## 3. Weekly off — per employee, and rotating

Today every employee shares an implicit Sunday. Real factory practice: maintenance is
off Monday, boiler staff Wednesday, and some rotate week by week.

**Three layers, checked in order:**

1. `employees.weekly_off` — the normal pattern, stored as weekday numbers,
   e.g. `"0"` = Sunday, `"0,6"` = Saturday + Sunday, `"3"` = Wednesday.
2. `holidays(date, name, type)` — one company-wide calendar per year
   (`national` / `festival` / `factory_shutdown`), published from Settings.
3. `day_overrides(employee_id, date, kind, note)` — the exception layer:
   `kind` ∈ `weekly_off | working | holiday`. This is how a **rotating** weekly off or a
   substituted holiday under s.52(1)(a) is recorded, and it always wins.

**Consequences in the attendance engine**

- The nightly close job no longer marks a weekly-off / holiday date as **absent**. The
  register shows **W** (weekly off) and **H** (holiday), which are not counted against
  the worker and are excluded from leave-day counting when a leave spans them.
- A punch on a weekly off ⇒ `present` **plus** a pending comp-off credit (§2.1).
- Attendance-rate maths uses *scheduled working days*, not calendar days, so the
  dashboard percentage finally means something.
- A **s.52(2) guard**: if a worker is scheduled 10 consecutive days without a whole
  holiday, HRMate warns the supervisor on the roster screen. This is a real compliance
  risk during peak season and is cheap to detect.

---

## 4. Shifts — day / night rotation

`employees.shift_name` is free text today and cannot drive late detection. Replace with
a proper master plus a roster.

```sql
CREATE TABLE shifts (
  id INTEGER PRIMARY KEY, code TEXT UNIQUE,      -- G, D, N
  name TEXT NOT NULL,                            -- General, Day, Night
  start_time TEXT NOT NULL, end_time TEXT NOT NULL,
  crosses_midnight INTEGER NOT NULL DEFAULT 0,
  grace_minutes INTEGER NOT NULL DEFAULT 15,
  half_day_after_minutes INTEGER NOT NULL DEFAULT 120,
  min_hours_full_day REAL NOT NULL DEFAULT 8,
  break_minutes INTEGER NOT NULL DEFAULT 30,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE shift_roster (
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  roster_date TEXT NOT NULL,
  shift_id INTEGER NOT NULL REFERENCES shifts(id),
  PRIMARY KEY (employee_id, roster_date)
);
```

`employees.default_shift_id` is the fallback; `shift_roster` overrides it for the dates
where the worker rotates. HR sets a rotation from one screen — pick employees, pick a
pattern (e.g. *7 days D → 7 days N*, or *weekly alternate*), pick a date range, and
HRMate fills the roster. Individual cells stay editable.

**Attendance stores the shift it was judged against.** `attendance` gains
`shift_id`, `expected_in`, `expected_out` as a snapshot, so changing the shift master
later never rewrites history, and the register can show a D / N / G column.

### 4.1 The night-shift midnight rule

A night shift starting 20:00 on the 5th and ending 08:00 on the 6th is **one attendance
row dated the 5th** — the date the shift *started*. This matches the Punjab Act 1965
s.2(a) definition ("in the case of a worker who works in a shift which extends beyond
midnight, such period of twenty-four hours shall begin when his shift ends") in effect,
and it is what every factory register does: one row per shift, not per calendar day.

Concrete rules for the punch engine:

- **Punch in** binds to the rostered shift whose start is nearest, within a window of
  −4 h to +6 h. A punch at 19:40 for a 20:00 night shift ⇒ the 5th, on time.
- **Punch out** first looks for an *open* row from the previous day; if it finds one, it
  closes that row. Only otherwise does it open a fresh day.
- **Late / half-day** are measured against `expected_in` of the rostered shift, never
  against a global 09:00. A night worker arriving at 20:20 with 15 min grace is late by
  5 min; the same person on the day shift next week is judged against 08:00.
- A row is auto-closed by the nightly job at `expected_out + 6 h` if no punch-out came,
  flagged `missing_punch_out` for HR to fix by manual entry.
- **Hours worked** = out − in, minus `break_minutes`, correct across midnight. Anything
  over 9 h in a day or 48 h in a week is flagged for the OT register (s.59).
- **Weekly off** for a night worker is counted on the shift-start date, so his "Sunday
  off" is really Sunday 20:00 → Monday 08:00 not worked.
- **Women on night shift** (Factories Act s.66, relaxed by state notification): HRMate
  will require a consent flag on the employee record and warn when a woman is rostered
  to N without it. Transport and security arrangements are the factory's duty.

---

## 5. Leave balances — one-time setup, then automatic every year

`leave_balances` is currently one row per employee with three fixed columns. It has no
year, so a rollover would destroy history. Replace it with a year-scoped ledger.

```sql
CREATE TABLE leave_policy (            -- one row per leave type, company-wide
  leave_type TEXT PRIMARY KEY,         -- casual | sick | earned | comp_off
  annual_days REAL NOT NULL,
  accrual TEXT NOT NULL,               -- yearly | monthly | earned_ratio | ledger
  earn_ratio INTEGER,                  -- 20 => 1 day per 20 days worked (s.79)
  carry_forward INTEGER NOT NULL DEFAULT 0,
  carry_cap REAL,                      -- 30 for EL (s.79)
  prorate_on_join INTEGER NOT NULL DEFAULT 1,
  expiry_days INTEGER,                 -- 60 for comp_off
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE leave_balances (
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  year INTEGER NOT NULL,
  leave_type TEXT NOT NULL,
  opening REAL NOT NULL DEFAULT 0,     -- carried forward from last year
  credited REAL NOT NULL DEFAULT 0,    -- this year's allocation / accrual
  used REAL NOT NULL DEFAULT 0,
  adjusted REAL NOT NULL DEFAULT 0,    -- HR correction, reason audited
  PRIMARY KEY (employee_id, year, leave_type)
);
```

Available = `opening + credited + adjusted − used`.

**One-time setup (HR does this once):**
1. *Settings → Leave policy* — quotas, accrual mode, carry-forward and caps, comp-off
   expiry. Pre-filled with the statutory numbers in §1.
2. *Settings → Holiday calendar* — the year's 3 national + 4–5 festival holidays.
3. *Employees → Opening balances* — a single grid for all staff, to type in what each
   worker already has as on the go-live date. Import from Excel too. Audited.

**After that it is automatic:**
- **New employee** → balances created from policy, pro-rated by join date.
- **Monthly accrual** (if chosen) → the nightly job credits e.g. 1.5 EL on the 1st.
- **Earned-leave ratio** → on 1 January the job counts last year's worked days and
  credits `floor(days / 20)` (s.79), only if ≥ 240 days were worked.
- **Year rollover on 1 January** → next year's rows are created:
  `opening = carry_forward ? min(previous closing, carry_cap) : 0`; EL carries up to 30
  days, CL and SL lapse. The job is **idempotent** and re-checks the last 400 days on
  every run, so a server that was down on 1 January self-heals.
- Every automatic movement writes an `audit_log` row and shows in the employee's
  *Leave ledger* tab, so a worker can always see why a number changed.

---

## 6. Profile photo

`employees.photo_url` already exists and `/uploads` already accepts images. The work is
UI: tapping the avatar (own profile, or any employee for HR) opens choose-photo /
camera, uploads, crops square, and the photo then replaces the initials everywhere —
dashboard greeting, employee list, attendance register, leave cards, app-bar. Removing
the photo falls back to initials. Max ~2 MB, resized server-side.

---

## 7. Suggested build order

1. Profile photo upload (small, visible, no schema change).
2. Shift master + per-employee default shift + roster + night-shift punch engine.
3. Weekly off per employee + holiday calendar + day overrides + register W/H marks.
4. Comp-off ledger (depends on 3, because a credit needs to know what a weekly off is).
5. Leave policy + year-scoped balances + opening-balance grid + rollover job.

Each step ships working UI — no placeholder controls.
