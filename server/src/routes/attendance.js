const express = require('express');
const db = require('../db');
const { auth, requireRole, sanitize } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const today = () => new Date().toISOString().slice(0, 10);

router.post('/clock', (req, res) => {
  const { action, latitude, longitude, source, note } = req.body || {};
  const date = today();
  const existing = db.attendance.find(a => a.user_id === req.user.id && a.date === date);
  const now = new Date().toISOString();

  if (action === 'in') {
    if (existing && existing.clock_in) return res.status(400).json({ error: 'Already clocked in today' });
    const status = new Date().getHours() >= 10 ? 'late' : 'present';
    if (existing) {
      db.attendance.update(a => a.id === existing.id, {
        clock_in: now, status, source: source || 'selfie',
        latitude: latitude || null, longitude: longitude || null, note: note || ''
      });
    } else {
      db.attendance.insert({
        user_id: req.user.id, date, clock_in: now, clock_out: null, status,
        source: source || 'selfie', latitude: latitude || null, longitude: longitude || null, note: note || ''
      });
    }
    return res.json({ ok: true, clockedIn: now });
  }

  if (action === 'out') {
    if (!existing || !existing.clock_in) return res.status(400).json({ error: 'Not clocked in today' });
    db.attendance.update(a => a.id === existing.id, { clock_out: now });
    return res.json({ ok: true, clockedOut: now });
  }

  res.status(400).json({ error: 'action must be in|out' });
});

router.get('/today', (req, res) => {
  res.json({ today: db.attendance.find(a => a.user_id === req.user.id && a.date === today()) });
});

router.get('/history', (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const records = db.attendance
    .filter(a => a.user_id === req.user.id && a.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));
  res.json({ month, records });
});

router.post('/requests', (req, res) => {
  const { date, type, reason } = req.body || {};
  if (!date || !type || !reason) return res.status(400).json({ error: 'date, type, reason required' });
  const r = db.attendance_requests.insert({
    user_id: req.user.id, date, type, reason, status: 'pending',
    reviewed_by: null, reviewed_at: null
  });
  res.json({ id: r.lastInsertRowid, ok: true });
});

router.get('/requests/mine', (req, res) => {
  const requests = db.attendance_requests
    .filter(r => r.user_id === req.user.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(r => ({ ...r, user_name: req.user.name, emp_code: req.user.emp_code }));
  res.json({ requests });
});

router.get('/requests/pending', requireRole('manager', 'admin'), (req, res) => {
  const team = db.users.filter(u => u.manager_id === req.user.id);
  const teamIds = new Set(team.map(u => u.id));
  const requests = db.attendance_requests
    .filter(r => r.status === 'pending' && teamIds.has(r.user_id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(r => {
      const u = db.users.find(x => x.id === r.user_id);
      return { ...r, user_name: u?.name, emp_code: u?.emp_code, avatar_color: u?.avatar_color };
    });
  res.json({ requests });
});

router.post('/requests/bulk', requireRole('manager', 'admin'), (req, res) => {
  const { ids, action } = req.body || {};
  if (!Array.isArray(ids) || !ids.length || !['approve', 'reject'].includes(action))
    return res.status(400).json({ error: 'ids[] and action(approve|reject) required' });
  const status = action === 'approve' ? 'approved' : 'rejected';
  const idSet = new Set(ids.map(Number));
  db.attendance_requests.update(r => idSet.has(r.id), {
    status, reviewed_by: req.user.id, reviewed_at: new Date().toISOString()
  });
  res.json({ ok: true, updated: ids.length, status });
});

module.exports = router;
