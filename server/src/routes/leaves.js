const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/balances', (req, res) => {
  const rows = db.leave_balances.filter(b => b.user_id === req.user.id);
  const balances = {};
  rows.forEach(r => { balances[r.leave_type] = { total: r.total, used: r.used, remaining: r.total - r.used }; });
  res.json({ balances });
});

router.get('/mine', (req, res) => {
  const requests = db.leave_requests
    .filter(l => l.user_id === req.user.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json({ requests });
});

router.post('/request', (req, res) => {
  const { leave_type, from_date, to_date, reason } = req.body || {};
  if (!leave_type || !from_date || !to_date || !reason)
    return res.status(400).json({ error: 'All fields required' });
  const days = Math.max(1, Math.round((new Date(to_date) - new Date(from_date)) / 86400000) + 1);
  const r = db.leave_requests.insert({
    user_id: req.user.id, leave_type, from_date, to_date, days, reason,
    status: 'pending', reviewed_by: null, reviewed_at: null
  });
  res.json({ id: r.lastInsertRowid, ok: true, days });
});

router.get('/pending', requireRole('manager', 'admin'), (req, res) => {
  const teamIds = new Set(db.users.filter(u => u.manager_id === req.user.id).map(u => u.id));
  const requests = db.leave_requests
    .filter(l => l.status === 'pending' && teamIds.has(l.user_id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(l => {
      const u = db.users.find(x => x.id === l.user_id);
      return { ...l, user_name: u?.name, emp_code: u?.emp_code, avatar_color: u?.avatar_color };
    });
  res.json({ requests });
});

router.post('/:id/review', requireRole('manager', 'admin'), (req, res) => {
  const { action } = req.body || {};
  if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'action required' });
  const lr = db.leave_requests.find(l => l.id === Number(req.params.id));
  if (!lr) return res.status(404).json({ error: 'Not found' });
  const status = action === 'approve' ? 'approved' : 'rejected';
  db.leave_requests.update(l => l.id === lr.id, { status, reviewed_by: req.user.id, reviewed_at: new Date().toISOString() });
  if (status === 'approved') {
    const bal = db.leave_balances.find(b => b.user_id === lr.user_id && b.leave_type === lr.leave_type);
    if (bal) db.leave_balances.update(b => b.id === bal.id, { used: bal.used + lr.days });
  }
  res.json({ ok: true, status });
});

module.exports = router;
