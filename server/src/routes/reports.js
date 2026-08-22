import { Router } from 'express';
import { db } from '../db/index.js';
import { authRequired, requirePerm } from '../middleware/auth.js';
import { buildXlsx } from '../lib/xlsx.js';
import { buildTablePdf } from '../lib/pdf.js';

const router = Router();
router.use(authRequired, requirePerm('reports.view'));

const COMPANY = 'G.D. Foods Mfg (I) Pvt. Ltd.';
/* Shift starts at 09:00 with ten minutes of grace — the same rule punch-in uses. */
const SHIFT_START_MINUTES = 9 * 60;
const STATUS_LABEL = { present: 'Present', late: 'Late', half_day: 'Half day', absent: 'Absent' };

const currentMonth = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 7);
const monthParam = (value) => (/^\d{4}-\d{2}$/.test(String(value || '')) ? value : currentMonth());
const monthLabel = (month) => new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const daysInMonth = (month) => new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
const shiftMonth = (month, delta) => {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + delta);
  return date.toISOString().slice(0, 7);
};
/** Punches are stored as UTC instants; exports and late maths are all in IST. */
const timeOnly = (value) => {
  if (!value) return '';
  const parsed = new Date(String(value).includes('T') ? value : `${String(value).replace(' ', 'T')}Z`);
  if (Number.isNaN(parsed.getTime())) return String(value).slice(11, 16);
  return new Date(parsed.getTime() + 330 * 60000).toISOString().slice(11, 16);
};
const minutesInto = (value) => {
  const time = timeOnly(value);
  if (!time) return null;
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
};
const rate = (present, total) => (total ? Number(((present * 100) / total).toFixed(1)) : 0);

function statusCounts(month) {
  const rows = db.prepare('SELECT status, COUNT(*) AS count FROM attendance WHERE attendance_date LIKE ? GROUP BY status').all(`${month}%`);
  const counts = { present: 0, late: 0, half_day: 0, absent: 0 };
  rows.forEach((row) => { counts[row.status] = row.count; });
  return counts;
}

function monthRate(month) {
  const counts = statusCounts(month);
  const total = counts.present + counts.late + counts.half_day + counts.absent;
  return { counts, total, value: rate(counts.present + counts.late + counts.half_day * 0.5, total) };
}

function registerRows(month) {
  return db.prepare(`
    SELECT e.employee_code, e.name, e.department, e.shift_name,
           a.attendance_date, a.status, a.punch_in_at, a.punch_out_at, a.entry_source, a.manual_note
      FROM attendance a JOIN employees e ON e.id = a.employee_id
     WHERE a.attendance_date LIKE ?
     ORDER BY e.name, a.attendance_date`).all(`${month}%`);
}

function buildSummary(month) {
  const current = monthRate(month);
  const previous = monthRate(shiftMonth(month, -1));

  const daily = [];
  const byDate = new Map();
  db.prepare('SELECT attendance_date, status, COUNT(*) AS count FROM attendance WHERE attendance_date LIKE ? GROUP BY attendance_date, status')
    .all(`${month}%`)
    .forEach((row) => {
      if (!byDate.has(row.attendance_date)) byDate.set(row.attendance_date, { present: 0, late: 0, half_day: 0, absent: 0 });
      byDate.get(row.attendance_date)[row.status] = row.count;
    });
  for (let day = 1; day <= daysInMonth(month); day += 1) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    const counts = byDate.get(date);
    if (!counts) { daily.push({ date, total: 0, rate: null, ...{ present: 0, late: 0, half_day: 0, absent: 0 } }); continue; }
    const total = counts.present + counts.late + counts.half_day + counts.absent;
    daily.push({ date, ...counts, total, rate: rate(counts.present + counts.late + counts.half_day * 0.5, total) });
  }

  const lateRows = db.prepare("SELECT punch_in_at FROM attendance WHERE attendance_date LIKE ? AND status='late' AND punch_in_at IS NOT NULL").all(`${month}%`);
  const lateMinutes = lateRows
    .map((row) => (minutesInto(row.punch_in_at) ?? SHIFT_START_MINUTES) - SHIFT_START_MINUTES)
    .filter((minutes) => minutes > 0);
  const averageLateMinutes = lateMinutes.length ? Math.round(lateMinutes.reduce((a, b) => a + b, 0) / lateMinutes.length) : 0;

  const marked = current.counts.present + current.counts.late + current.counts.half_day;
  const employees = db.prepare(`
    SELECT e.id, e.name, e.employee_code, e.department,
           SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) AS present,
           SUM(CASE WHEN a.status='late' THEN 1 ELSE 0 END) AS late,
           SUM(CASE WHEN a.status='half_day' THEN 1 ELSE 0 END) AS half_day,
           SUM(CASE WHEN a.status='absent' THEN 1 ELSE 0 END) AS absent,
           COUNT(a.id) AS total
      FROM employees e LEFT JOIN attendance a ON a.employee_id = e.id AND a.attendance_date LIKE ?
     WHERE e.active = 1
     GROUP BY e.id ORDER BY e.name`).all(`${month}%`)
    .map((row) => ({ ...row, rate: rate(row.present + row.late + row.half_day * 0.5, row.total) }));

  const departments = db.prepare(`
    SELECT COALESCE(e.department,'Unassigned') AS department,
           SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) AS present,
           SUM(CASE WHEN a.status='half_day' THEN 1 ELSE 0 END) AS half_day,
           COUNT(a.id) AS total
      FROM attendance a JOIN employees e ON e.id = a.employee_id
     WHERE a.attendance_date LIKE ?
     GROUP BY COALESCE(e.department,'Unassigned') ORDER BY total DESC`).all(`${month}%`)
    .map((row) => ({ ...row, rate: rate(row.present + row.half_day * 0.5, row.total) }));

  const leaveDays = db.prepare("SELECT COALESCE(SUM(days),0) AS days FROM leaves WHERE status='approved' AND start_date LIKE ?").get(`${month}%`).days;

  return {
    month,
    monthLabel: monthLabel(month),
    counts: current.counts,
    total: current.total,
    attendanceRate: current.value,
    previousMonth: shiftMonth(month, -1),
    previousRate: previous.value,
    previousTotal: previous.total,
    change: Number((current.value - previous.value).toFixed(1)),
    daily,
    insights: {
      averageLateMinutes,
      onTimeRate: rate(current.counts.present, marked),
      leaveDays,
      workingDays: daily.filter((day) => day.total > 0).length,
    },
    employees,
    departments,
    leaveDays,
  };
}

router.get('/attendance-summary', (req, res) => res.json(buildSummary(monthParam(req.query.month))));

router.get('/attendance-register.csv', (req, res) => {
  const month = monthParam(req.query.month);
  const rows = registerRows(month);
  const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [
    'Employee code,Name,Department,Date,Status,Punch in,Punch out,Source',
    ...rows.map((row) => [row.employee_code, row.name, row.department, row.attendance_date,
      STATUS_LABEL[row.status] || row.status, timeOnly(row.punch_in_at), timeOnly(row.punch_out_at), row.entry_source].map(quote).join(',')),
  ].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="hrmate-attendance-${month}.csv"`);
  res.send(csv);
});

router.get('/attendance-register.xlsx', (req, res) => {
  const month = monthParam(req.query.month);
  const rows = registerRows(month);
  const file = buildXlsx({
    name: monthLabel(month),
    header: ['Employee code', 'Name', 'Department', 'Shift', 'Date', 'Status', 'Punch in', 'Punch out', 'Source', 'Note'],
    widths: [15, 24, 16, 16, 12, 11, 10, 10, 10, 30],
    rows: rows.map((row) => [row.employee_code, row.name, row.department, row.shift_name, row.attendance_date,
      STATUS_LABEL[row.status] || row.status, timeOnly(row.punch_in_at), timeOnly(row.punch_out_at), row.entry_source, row.manual_note]),
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="hrmate-attendance-${month}.xlsx"`);
  res.send(file);
});

router.get('/attendance-register.pdf', (req, res) => {
  const month = monthParam(req.query.month);
  const summary = buildSummary(month);
  const rows = registerRows(month);
  const file = buildTablePdf({
    title: `Attendance register — ${monthLabel(month)}`,
    subtitle: COMPANY,
    stats: [
      { label: 'Attendance', value: `${summary.attendanceRate}%` },
      { label: 'Present', value: summary.counts.present },
      { label: 'Late', value: summary.counts.late },
      { label: 'Half day', value: summary.counts.half_day },
      { label: 'Absent', value: summary.counts.absent },
      { label: 'Approved leave', value: `${summary.leaveDays} days` },
    ],
    header: ['Code', 'Employee', 'Department', 'Date', 'Status', 'In', 'Out', 'Source'],
    widths: [1.1, 2.4, 1.7, 1.2, 1, 0.8, 0.8, 0.9],
    rows: rows.map((row) => [row.employee_code || '—', row.name, row.department || '—', row.attendance_date,
      STATUS_LABEL[row.status] || row.status, timeOnly(row.punch_in_at) || '—', timeOnly(row.punch_out_at) || '—', row.entry_source]),
    footer: `HRMate · generated ${new Date(Date.now() + 330 * 60000).toISOString().slice(0, 16).replace('T', ' ')} IST`,
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="hrmate-attendance-${month}.pdf"`);
  res.send(file);
});

router.get('/summary.pdf', (req, res) => {
  const month = monthParam(req.query.month);
  const summary = buildSummary(month);
  const file = buildTablePdf({
    title: `Attendance summary — ${monthLabel(month)}`,
    subtitle: COMPANY,
    stats: [
      { label: 'Attendance', value: `${summary.attendanceRate}%` },
      { label: 'vs last month', value: `${summary.change >= 0 ? '+' : ''}${summary.change}%` },
      { label: 'On time', value: `${summary.insights.onTimeRate}%` },
      { label: 'Avg late', value: `${summary.insights.averageLateMinutes} min` },
      { label: 'Leave days', value: summary.insights.leaveDays },
    ],
    header: ['Code', 'Employee', 'Department', 'Present', 'Late', 'Half day', 'Absent', 'Attendance %'],
    widths: [1.1, 2.4, 1.8, 1, 0.9, 1, 1, 1.3],
    rows: summary.employees.map((row) => [row.employee_code || '—', row.name, row.department || '—',
      String(row.present), String(row.late), String(row.half_day), String(row.absent), `${row.rate}%`]),
    footer: `HRMate · generated ${new Date(Date.now() + 330 * 60000).toISOString().slice(0, 16).replace('T', ' ')} IST`,
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="hrmate-summary-${month}.pdf"`);
  res.send(file);
});

export default router;
