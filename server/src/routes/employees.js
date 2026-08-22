import { Router } from 'express';
import { db, todayIst } from '../db/index.js';
import { authRequired, requirePerm } from '../middleware/auth.js';
import { audit } from '../helpers.js';

const router = Router();
router.use(authRequired);

/** Directory with each person's status today: present, late, on leave, or not marked. */
router.get('/', requirePerm('employees.view'), (req, res) => {
  const today = todayIst();
  const employees = db.prepare(`SELECT e.*,
      a.status AS today_status, a.punch_in_at AS today_punch_in, a.punch_out_at AS today_punch_out,
      CASE WHEN l.id IS NULL THEN 0 ELSE 1 END AS on_leave, l.leave_type AS leave_type
    FROM employees e
    LEFT JOIN attendance a ON a.employee_id = e.id AND a.attendance_date = ?
    LEFT JOIN leaves l ON l.employee_id = e.id AND l.status = 'approved' AND l.start_date <= ? AND l.end_date >= ?
    WHERE e.active = 1
    ORDER BY e.name`).all(today, today, today);
  res.json({ employees, today });
});

router.get('/:id', requirePerm('employees.view'), (req, res) => {
  const employee = db.prepare('SELECT * FROM employees WHERE id=? AND active=1').get(req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  const attendance = db.prepare('SELECT * FROM attendance WHERE employee_id=? ORDER BY attendance_date DESC LIMIT 31').all(employee.id);
  const balance = db.prepare('SELECT * FROM leave_balances WHERE employee_id=?').get(employee.id);
  const leaves = db.prepare(`SELECT l.*, r.name AS reviewer_name FROM leaves l
    LEFT JOIN users r ON r.id = l.reviewer_id WHERE l.employee_id=? ORDER BY l.start_date DESC LIMIT 30`).all(employee.id);
  const account = employee.user_id
    ? db.prepare('SELECT id, name, phone, email, role, active FROM users WHERE id=?').get(employee.user_id)
    : null;
  const counts = { present: 0, late: 0, half_day: 0, absent: 0 };
  attendance.forEach((record) => { counts[record.status] = (counts[record.status] ?? 0) + 1; });
  res.json({ employee, attendance, balance, leaves, account, counts });
});

router.patch('/:id', requirePerm('employees.manage'), audit({
  action: 'employee.updated', entityType: 'employee', entityId: (req) => req.params.id,
  title: 'Employee updated', body: 'An employee profile was updated.',
}, (req, res) => {
  const current = db.prepare('SELECT * FROM employees WHERE id=? AND active=1').get(req.params.id);
  if (!current) return res.status(404).json({ error: 'Employee not found' });
  const values = { ...current, ...req.body };
  db.prepare('UPDATE employees SET name=?,phone=?,role_title=?,department=?,shift_name=?,join_date=?,photo_url=?,employee_code=? WHERE id=?')
    .run(values.name, values.phone, values.roleTitle ?? values.role_title, values.department, values.shiftName ?? values.shift_name,
      values.joinDate ?? values.join_date, values.photoUrl ?? values.photo_url, values.employeeCode ?? values.employee_code, current.id);
  res.json({ employee: db.prepare('SELECT * FROM employees WHERE id=?').get(current.id) });
}));

router.post('/', requirePerm('employees.manage'), audit({
  action: 'employee.created', entityType: 'employee', entityId: () => null,
  title: 'Employee added', body: 'A new employee was added to HRMate.',
}, (req, res) => {
  const { name, phone, roleTitle, department, shiftName, joinDate, photoUrl, employeeCode, userId } = req.body;
  if (!name) return res.status(400).json({ error: 'Employee name is required' });
  if (userId && !db.prepare('SELECT id FROM users WHERE id=?').get(userId)) return res.status(400).json({ error: 'Linked user not found' });
  if (userId && db.prepare('SELECT id FROM employees WHERE user_id=?').get(userId)) return res.status(409).json({ error: 'That login is already linked to another employee' });
  if (employeeCode && db.prepare('SELECT id FROM employees WHERE employee_code=?').get(employeeCode)) return res.status(409).json({ error: 'That employee code is already in use' });
  const result = db.prepare('INSERT INTO employees (user_id,name,phone,role_title,department,shift_name,join_date,photo_url,employee_code) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(userId ?? null, name, phone ?? null, roleTitle ?? null, department ?? null, shiftName ?? null, joinDate ?? null, photoUrl ?? null, employeeCode ?? null);
  db.prepare('INSERT OR IGNORE INTO leave_balances (employee_id) VALUES (?)').run(result.lastInsertRowid);
  res.status(201).json({ id: result.lastInsertRowid });
}));

export default router;
