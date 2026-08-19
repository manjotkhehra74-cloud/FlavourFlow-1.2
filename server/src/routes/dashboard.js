const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const today = () => new Date().toISOString().slice(0, 10);

router.get('/summary', (req, res) => {
  const uid = req.user.id;
  const isManager = req.user.role !== 'employee';
  const month = new Date().toISOString().slice(0, 7);

  const todayRow = db.attendance.find(a => a.user_id === uid && a.date === today());
  const monthRecords = db.attendance.filter(a => a.user_id === uid && a.date.startsWith(month));
  const monthStats = {};
  monthRecords.forEach(r => { monthStats[r.status] = (monthStats[r.status] || 0) + 1; });

  const result = {
    today: todayRow || null,
    month,
    monthStats,
    pending: {
      leaves: db.leave_requests.count(l => l.status === 'pending' && l.user_id === uid),
      attendanceRequests: db.attendance_requests.count(r => r.status === 'pending' && r.user_id === uid),
      teamApprovals: 0,
    },
  };

  if (isManager) {
    const teamIds = new Set(db.users.filter(u => u.manager_id === uid).map(u => u.id));
    result.pending.teamApprovals = db.attendance_requests.count(r => r.status === 'pending' && teamIds.has(r.user_id));
    result.teamCount = teamIds.size;
    result.teamPresentToday = db.attendance.count(a =>
      a.date === today() && ['present', 'late', 'wfh'].includes(a.status) && teamIds.has(a.user_id)
    );
    result.pendingLeaves = db.leave_requests.count(l => l.status === 'pending' && teamIds.has(l.user_id));
  }

  res.json(result);
});

module.exports = router;
