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
  min_hours_full_day REAL NOT NULL DEFAULT 9,
  min_hours_half_day REAL NOT NULL DEFAULT 4.5,
  break_minutes INTEGER NOT NULL DEFAULT 30,
  ot_after_hours REAL NOT NULL DEFAULT 9,          -- s.59
  night_shift INTEGER NOT NULL DEFAULT 0,
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

### 4.2 G.D. Foods' actual shifts and the 12-hour season problem

Confirmed by the client: **Night = 19:00 → 07:00 next morning (12 h)**, and during the
season the **day shift also runs 12 h (07:00 → 19:00)**.

| code | name | start | end | gross | breaks (s.55) | net work | OT vs 9 h |
|---|---|---|---|---|---|---|---|
| G | General | 09:00 | 18:00 | 9 h | 1 × 30 min | 8.5 h | 0 |
| D | Day (season) | 07:00 | 19:00 | 12 h | 2 × 30 min | 11 h | 2 h |
| N | Night | 19:00 | 07:00 (+1) | 12 h | 2 × 30 min | 11 h | 2 h |

Two 30-minute breaks are not optional on a 12-hour shift: **s.55 forbids any work period
longer than 5 hours without a ≥30 min rest**, so a 12-hour shift must be broken as
5 h + 5 h + the remainder. HRMate stores the break minutes per shift and subtracts them.

**Statutory ceilings that a 12-hour roster hits immediately**

- 12 h/day is *above* the normal 9 h limit (s.54). It is only lawful under an exempting
  order for **exceptional pressure of work** (s.65(2)), whose hard conditions are:
  work ≤ **12 h/day**, spread-over ≤ **13 h/day**, ≤ **60 h/week including overtime**,
  no overtime **more than 7 days at a stretch**, and ≤ **75 overtime hours per quarter**.
  (Under the alternative route, state rules made under s.64(4), the caps are tighter:
  10 h/day, 12 h spread-over, 60 h/week, 50 OT hours per quarter.)
- 19:00 → 07:00 is a 12 h spread-over — inside the 13 h limit. Good.
- **6 × 12 h = 72 h/week, which is illegal even with the exemption.** At 12-hour shifts
  the roster can run at most **5 days = 60 h** in a week. The 6th day must be a weekly
  off; working it is both a comp-off credit *and* a breach of the 60 h cap.
- 2 h OT × 5 days = **10 OT h/week → the 75 h quarterly ceiling is reached in ~7.5
  weeks**. A long season needs a second relay, not more overtime.
- All hours beyond 9 h/day or 48 h/week are payable at **double wages** (s.59).

**What HRMate will therefore compute, per attendance row**

```
gross      = punch_out − punch_in            (correct across midnight)
net_hours  = gross − shift.break_minutes
ot_hours   = max(0, net_hours − 9)           -- daily OT
weekly_ot  = max(0, Σ net_hours in the week − 48)   -- whichever is greater is paid
status     : net ≥ min_hours_full_day (9)  → present
             net ≥ min_hours_half_day (4.5) → half_day
             otherwise                      → absent
late       = punch_in > expected_in + grace  (19:15 for N, 07:15 for D)
```

`ot_hours` is stored on the row, so the monthly register and the Excel/PDF export can
carry an **OT hours column** and a quarter-to-date OT total per worker — which is what
the Form-Ⅳ overtime register needs anyway.

**Live compliance warnings** (shown on the roster and register screens, not blocking):

| condition | warning |
|---|---|
| week's total > 60 h | over the s.65(3) weekly ceiling |
| 6 twelve-hour days rostered in a week | reduce to 5 or the week is illegal |
| OT on 8 consecutive days | s.65(3)(iv) — 7 days at a stretch is the limit |
| quarter OT > 75 h (or > 50 h on the s.64 route) | quarterly ceiling breached |
| 10 consecutive days without a whole holiday | s.52(2) |
| gap between two rostered shifts < 12 h | rotation too tight — double-shift risk |
| N → D turnaround on the same date | blocked: that is a 24-hour stretch |

**Season switching.** Moving a department from `G` to `D`/`N` for a date range is one
action on the roster screen: pick the department, pick the date range, pick the pattern.
When the season ends, roster the range back to `G`. Nothing is retyped per employee, and
because every attendance row snapshots its own `shift_id` and `expected_in`, the
off-season history keeps being judged against 09:00 while season rows use 07:00/19:00.

**Weekly off with a night shift.** The off applies to the *roster date*. If Sunday is a
worker's weekly off, there is simply no shift dated Sunday — his last shift is
Sat 19:00 → Sun 07:00 and the next is Mon 19:00, giving a genuine 36-hour rest. The
register marks Sunday **W**, never absent.

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
