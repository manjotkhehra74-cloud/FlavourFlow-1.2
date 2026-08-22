import { Router } from 'express';
import { db, employeeForUser, todayIst } from '../db/index.js';
import { authRequired, requirePerm } from '../middleware/auth.js';
import { audit } from '../helpers.js';

const router = Router();
router.use(authRequired);

const emptySummary = () => ({ present: 0, late: 0, half_day: 0, absent: 0 });

function attendanceStatus(now = new Date()) {
  const ist = new Date(now.getTime() + 330 * 60000);
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return minutes > (9 * 60 + 10) ? 'late' : 'present';
}

router.get('/me', requirePerm('attendance.view'), (req, res) => {
  const employee = employeeForUser(req.user.id);
  const month = /^\d{4}-\d{2}$/.test(req.query.month ?? '') ? req.query.month : todayIst().slice(0, 7);
  if (!employee) return res.json({ employee: null, month, records: [], summary: emptySummary(), today: null });

  const records = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND attendance_date LIKE ? ORDER BY attendance_date DESC').all(employee.id, `${month}%`);
  const summary = { ...emptySummary() };
  records.forEach((record) => { summary[record.status] = (summary[record.status] ?? 0) + 1; });
  res.json({
    employee,
    month,
    records,
    summary,
    today: records.find((record) => record.attendance_date === todayIst()) ?? null,
  });
});

router.get('/register', requirePerm('attendance.view'), (req, res) => {
  const month = req.query.month || todayIst().slice(0, 7);
  const records = db.prepare(`SELECT a.*, e.name, e.employee_code, e.department, e.shift_name
    FROM attendance a JOIN employees e ON e.id = a.employee_id
    WHERE a.attendance_date LIKE ? ORDER BY e.name, a.attendance_date`).all(`${month}%`);
  res.json({ month, records });
});

router.post('/punch-in', requirePerm('attendance.view'), audit({
  action: 'attendance.punch_in', entityType: 'attendance', entityId: () => null,
  title: 'Attendance punched in', body: 'An employee punched in.',
}, (req, res) => {
  const employee = employeeForUser(req.user.id);
  if (!employee) return res.status(400).json({ error: 'No employee profile is linked to this account' });
  const { latitude, longitude, selfieUrl } = req.body;
  const date = todayIst();
  const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?').get(employee.id, date);
  if (existing?.punch_in_at) return res.status(409).json({ error: 'Already punched in today', attendance: existing });
  const status = attendanceStatus();
  const now = new Date().toISOString();
  if (existing) {
    db.prepare(`UPDATE attendance SET status=?, punch_in_at=?, in_latitude=?, in_longitude=?, in_selfie_url=?, entry_source='mobile', updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(status, now, latitude ?? null, longitude ?? null, selfieUrl ?? null, existing.id);
  } else {
    db.prepare(`INSERT INTO attendance (employee_id,attendance_date,status,punch_in_at,in_latitude,in_longitude,in_selfie_url,created_by) VALUES (?,?,?,?,?,?,?,?)`)
      .run(employee.id, date, status, now, latitude ?? null, longitude ?? null, selfieUrl ?? null, req.user.id);
  }
  res.status(201).json({ attendance: db.prepare('SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?').get(employee.id, date) });
}));

router.post('/punch-out', requirePerm('attendance.view'), audit({
  action: 'attendance.punch_out', entityType: 'attendance', entityId: () => null,
  title: 'Attendance punched out', body: 'An employee punched out.',
}, (req, res) => {
  const employee = employeeForUser(req.user.id);
  const date = todayIst();
  const record = employee && db.prepare('SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?').get(employee.id, date);
  if (!record?.punch_in_at) return res.status(400).json({ error: 'Punch in before punching out' });
  if (record.punch_out_at) return res.status(409).json({ error: 'Already punched out today', attendance: record });
  const { latitude, longitude, selfieUrl } = req.body;
  db.prepare(`UPDATE attendance SET punch_out_at=?,out_latitude=?,out_longitude=?,out_selfie_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(new Date().toISOString(), latitude ?? null, longitude ?? null, selfieUrl ?? null, record.id);
  res.json({ attendance: db.prepare('SELECT * FROM attendance WHERE id=?').get(record.id) });
}));

router.post('/manual', requirePerm('attendance.manage'), audit({
  action: 'attendance.manual_entry', entityType: 'attendance', entityId: (req) => String(req.body.employeeId),
  title: 'Manual attendance updated', body: 'A supervisor updated attendance manually.',
}, (req, res) => {
  const { employeeId, attendanceDate, status, punchInAt, punchOutAt, reason } = req.body;
  if (!employeeId || !attendanceDate || !['present', 'late', 'half_day', 'absent'].includes(status)) return res.status(400).json({ error: 'Employee, date, and a valid status are required' });
  const employee = db.prepare('SELECT id FROM employees WHERE id=? AND active=1').get(employeeId);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  db.prepare(`INSERT INTO attendance (employee_id,attendance_date,status,punch_in_at,punch_out_at,entry_source,manual_note,created_by)
    VALUES (?,?,?,?,?,'manual',?,?) ON CONFLICT(employee_id,attendance_date) DO UPDATE SET
    status=excluded.status,punch_in_at=excluded.punch_in_at,punch_out_at=excluded.punch_out_at,entry_source='manual',manual_note=excluded.manual_note,created_by=excluded.created_by,updated_at=CURRENT_TIMESTAMP`)
    .run(employeeId, attendanceDate, status, punchInAt ?? null, punchOutAt ?? null, reason ?? null, req.user.id);
  res.json({ attendance: db.prepare('SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?').get(employeeId, attendanceDate) });
}));

export default router;
