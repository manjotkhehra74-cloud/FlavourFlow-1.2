# HRMate UI specification

Approved mobile designs, translated to the web console. Every screen below is the source
of truth for layout and copy; the palette is `#1E6FE0` blue → `#22C55E` green.

## Shared language

- **Hero card** — blue→green gradient, white text, used for leave balance, employee
  profile header, and the monthly attendance figure.
- **Cards** — white, 18–20px radius, hairline `#E2E8F0` border, soft shadow.
- **Chips** — pill filters (`All`, `Production`, `Quality`, …), active chip is solid blue.
- **Segmented control** — Present / Half day / Absent, active segment solid blue.
- **Status tiles** — 2×2 or 4-up counters (Pending 3, Approved 12, Rejected 2).
- **Gradient CTA** — full-width blue→green button for the primary action on a screen.
- **Bottom-sheet feel** — modals keep the same radius and spacing as cards.

## Screens

### Dashboard
Greeting with the user's first name, punch hero (date, headline, GPS/selfie badges,
circular fingerprint button), three counters (Present / Leave / Late) each with a
week-on-week delta, "Your workspace" quick links.

### Attendance
Week strip (Sun–Sat, dot under each day: green present, amber late, red absent, grey
future), selected day highlighted solid blue. Punch timeline: punched-in time and punch-out
time joined by a connector, GPS line with site name and selfie thumbnail, gradient
Punch Out button. "This month" summary: Present / Late / Half day / Absent.

### Leave (employee)
Gradient balance card with three inner tiles (Casual, Sick, Earned). Gradient
"Apply for leave" CTA. "Recent requests" list with type icon, dates and a status pill.

### Leave approvals (manager)
Four status tiles — Pending, Approved, Rejected, Calendar — the selected one is filled.
Request cards show the employee, leave type, date range with day count, remaining balance
badge, and Reject / Approve buttons side by side.

### Employees
Search field, department chips, employee cards: photo, name, code on the right,
department, shift, and today's status dot (Present / On leave / Absent).

### Employee profile
Gradient header with photo, name, employee code badge, department · shift, Active pill.
Tabs: Overview / Attendance / Leave. Overview lists phone, joining date and department as
tappable rows. Footer actions: View attendance, Add manual entry.

### Manual attendance
Date picker, employee search with a selected-employee card, segmented status control,
in/out time pickers, reason field, gradient Save button, and the note
"This entry will be recorded in audit history".

### Notifications
Grouped into Today / Earlier. Each row has a coloured icon tile, title, body, relative
time, and an unread dot. "Mark all read" in the header.

### Reports
Gradient card with the monthly attendance percentage, the change against the previous
month, and a line chart across the month. Export register as PDF or Excel. Insights row:
average late minutes, on-time rate, leave days.

### Profile / settings
Profile card with initials avatar, name, role · company. Rows: My profile, Biometric login
(toggle), Language (Punjabi), Appearance (System), Text size, Two-factor authentication,
Sign out.

### User management
Four role counters (Super admins, HR managers, Supervisors, Employees), search, user cards
with an initials avatar, role pill, active status and an overflow menu. "Add user" CTA.

## Deferred

Biometric login and two-factor authentication are shown as rows with a "Coming soon" tag
until the mobile client lands.

## Implementation notes

Batch 1 shipped the dashboard, attendance and leave screens; batch 2 the employee
directory, employee profile and user management; batch 3 reports, notifications and
settings.

Display preferences (language, appearance, text size) live in `web/js/prefs.js` and are
stored per device in `localStorage` under `hrmate.prefs`. Appearance drives a
`data-theme="dark"` attribute on `<html>`; the dark palette is a variable override at the
bottom of `web/css/styles.css`.

Exports are generated server-side with no third-party dependencies, because the production
VM cannot reliably build native npm modules:

- `server/src/lib/zip.js` — a small deflate ZIP writer.
- `server/src/lib/xlsx.js` — a single-sheet .xlsx writer (inline strings, bold header, frozen top row).
- `server/src/lib/pdf.js` — a paginated base-14 Helvetica table PDF with an HRMate-blue banner.
