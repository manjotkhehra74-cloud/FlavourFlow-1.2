import { Router } from 'express';
import { db, employeeForUser, todayIst } from '../db/index.js';
import { authRequired, requirePerm } from '../middleware/auth.js';
import { hasPermission } from '../rbac.js';

const router = Router();
router.use(authRequired, requirePerm('dashboard.view'));

/** Role-aware home payload for the web dashboard. */
router.get('/', (req, res) => {
  const today = todayIst();
  const month = today.slice(0, 7);
  const employee = employeeForUser(req.user.id);
  const payload = { today, month, employee: employee ?? null };

  if (employee) {
    payload.myAttendance = db.prepare('SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?').get(employee.id, today) ?? null;
    payload.myBalance = db.prepare('SELECT * FROM leave_balances WHERE employee_id=?').get(employee.id) ?? null;
  }

  if (hasPermission(req.user.role, 'attendance.view')) {
    const counts = Object.fromEntries(
      db.prepare('SELECT status, COUNT(*) AS count FROM attendance WHERE attendance_date=? GROUP BY status').all(today).map((r) => [r.status, r.count]),
    );
    const headcount = db.prepare('SELECT COUNT(*) AS count FROM employees WHERE active=1').get().count;
    const marked = Object.values(counts).reduce((a, b) => a + b, 0);
    payload.todayCounts = {
      present: counts.present ?? 0,
      late: counts.late ?? 0,
      half_day: counts.half_day ?? 0,
      absent: counts.absent ?? 0,
      notMarked: Math.max(headcount - marked, 0),
      headcount,
    };
    payload.trend = db.prepare(`SELECT attendance_date AS date,
        SUM(status IN ('present','late')) AS present, SUM(status='absent') AS absent
      FROM attendance WHERE attendance_date <= ? GROUP BY attendance_date ORDER BY attendance_date DESC LIMIT 14`).all(today).reverse();
    payload.departments = db.prepare(`SELECT COALESCE(NULLIF(e.department,''),'Unassigned') AS department,
        COUNT(*) AS headcount,
        SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) AS present
      FROM employees e LEFT JOIN attendance a ON a.employee_id=e.id AND a.attendance_date=?
      WHERE e.active=1 GROUP BY department ORDER BY headcount DESC`).all(today);
  }

  if (hasPermission(req.user.role, 'leave.manage')) {
    payload.pendingLeaves = db.prepare("SELECT COUNT(*) AS count FROM leaves WHERE status='pending'").get().count;
  }
  if (hasPermission(req.user.role, 'reports.view')) {
    payload.monthLeaveDays = db.prepare("SELECT COALESCE(SUM(days),0) AS days FROM leaves WHERE status='approved' AND start_date LIKE ?").get(`${month}%`).days;
  }

  payload.unreadNotifications = db.prepare('SELECT COUNT(*) AS count FROM notifications WHERE user_id=? AND read_at IS NULL').get(req.user.id).count;
  payload.recentActivity = hasPermission(req.user.role, 'users.view')
    ? db.prepare(`SELECT a.id, a.action, a.entity_type, a.created_at, u.name AS actor
        FROM audit_log a LEFT JOIN users u ON u.id=a.actor_id ORDER BY a.id DESC LIMIT 12`).all()
    : [];

  res.json(payload);
});

export default router;
