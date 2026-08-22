import { Router } from 'express';
import { db, employeeForUser } from '../db/index.js';
import { authRequired, requirePerm } from '../middleware/auth.js';
import { audit } from '../helpers.js';

const router = Router();
router.use(authRequired);
const daysBetween = (start, end) => Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;

router.get('/me', requirePerm('leave.view'), (req, res) => {
  const employee = employeeForUser(req.user.id);
  if (!employee) return res.json({ balance: null, requests: [] });
  const balance = db.prepare('SELECT * FROM leave_balances WHERE employee_id=?').get(employee.id) ?? { casual: 7, sick: 5, earned: 12 };
  const requests = db.prepare('SELECT * FROM leaves WHERE employee_id=? ORDER BY created_at DESC').all(employee.id);
  res.json({ balance, requests });
});

router.post('/', requirePerm('leave.view'), audit({
  action: 'leave.applied', entityType: 'leave', entityId: () => null,
  title: 'New leave request', body: 'An employee applied for leave.',
}, (req, res) => {
  const employee = employeeForUser(req.user.id);
  const { leaveType, startDate, endDate, reason } = req.body;
  if (!employee || !['casual', 'sick', 'earned'].includes(leaveType) || !startDate || !endDate || endDate < startDate) return res.status(400).json({ error: 'Valid leave type and date range are required' });
  const days = daysBetween(startDate, endDate);
  const balance = db.prepare('SELECT * FROM leave_balances WHERE employee_id=?').get(employee.id) ?? { [leaveType]: 0 };
  if ((balance[leaveType] ?? 0) < days) return res.status(400).json({ error: 'Insufficient leave balance' });
  const result = db.prepare('INSERT INTO leaves (employee_id,leave_type,start_date,end_date,days,reason) VALUES (?,?,?,?,?,?)').run(employee.id, leaveType, startDate, endDate, days, reason ?? null);
  res.status(201).json({ leave: db.prepare('SELECT * FROM leaves WHERE id=?').get(result.lastInsertRowid) });
}));

router.get('/pending', requirePerm('leave.manage'), (req, res) => res.json(db.prepare(`SELECT l.*, e.name, e.employee_code, e.department FROM leaves l JOIN employees e ON e.id=l.employee_id WHERE l.status='pending' ORDER BY l.created_at`).all()));

router.post('/:id/review', requirePerm('leave.manage'), audit({
  action: 'leave.reviewed', entityType: 'leave', entityId: (req) => req.params.id,
  title: 'Leave request reviewed', body: 'A leave request was reviewed.',
}, (req, res) => {
  const { decision, note } = req.body;
  if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ error: 'Decision must be approved or rejected' });
  const leave = db.prepare('SELECT * FROM leaves WHERE id=?').get(req.params.id);
  if (!leave || leave.status !== 'pending') return res.status(404).json({ error: 'Pending leave request not found' });
  const transaction = db.transaction(() => {
    db.prepare('UPDATE leaves SET status=?,reviewer_id=?,reviewer_note=?,reviewed_at=CURRENT_TIMESTAMP WHERE id=?').run(decision, req.user.id, note ?? null, leave.id);
    if (decision === 'approved') db.prepare(`UPDATE leave_balances SET ${leave.leave_type}=${leave.leave_type}-?, updated_at=CURRENT_TIMESTAMP WHERE employee_id=?`).run(leave.days, leave.employee_id);
  });
  transaction();
  res.json({ leave: db.prepare('SELECT * FROM leaves WHERE id=?').get(leave.id) });
}));

export default router;
