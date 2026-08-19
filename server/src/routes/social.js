const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/posts', (req, res) => {
  const posts = db.posts.all()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 100)
    .map(p => {
      const author = db.users.find(u => u.id === p.user_id);
      const reward = p.reward_to ? db.users.find(u => u.id === p.reward_to) : null;
      const comments = db.comments.filter(c => c.post_id === p.id)
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map(c => {
          const cu = db.users.find(u => u.id === c.user_id);
          return { ...c, author_name: cu?.name, author_color: cu?.avatar_color };
        });
      return {
        ...p,
        liked_by: Array.isArray(p.liked_by) ? p.liked_by : [],
        author_name: author?.name, author_color: author?.avatar_color, author_code: author?.emp_code,
        reward_name: reward?.name,
        comments
      };
    });
  res.json({ posts });
});

router.post('/posts', (req, res) => {
  const { body, badge, reward_to } = req.body || {};
  if (!body) return res.status(400).json({ error: 'body required' });
  const r = db.posts.insert({
    user_id: req.user.id, body, badge: badge || null,
    reward_to: reward_to || null, likes: 0, liked_by: []
  });
  res.json({ id: r.lastInsertRowid, ok: true });
});

router.post('/posts/:id/like', (req, res) => {
  const id = Number(req.params.id);
  const p = db.posts.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const liked = Array.isArray(p.liked_by) ? [...p.liked_by] : [];
  const idx = liked.indexOf(req.user.id);
  if (idx >= 0) liked.splice(idx, 1); else liked.push(req.user.id);
  db.posts.update(x => x.id === id, { likes: liked.length, liked_by: liked });
  res.json({ ok: true, likes: liked.length, liked: idx < 0 });
});

router.post('/posts/:id/comments', (req, res) => {
  const { body } = req.body || {};
  if (!body) return res.status(400).json({ error: 'body required' });
  const r = db.comments.insert({ post_id: Number(req.params.id), user_id: req.user.id, body });
  res.json({ id: r.lastInsertRowid, ok: true });
});

router.post('/wishes', (req, res) => {
  const { recipient_id, wish_type, body } = req.body || {};
  if (!recipient_id || !wish_type) return res.status(400).json({ error: 'recipient_id, wish_type required' });
  const r = db.wishes.insert({
    recipient_id: Number(recipient_id), sender_id: req.user.id,
    wish_type, body: body || null
  });
  res.json({ id: r.lastInsertRowid, ok: true });
});

router.get('/wishes/sent', (req, res) => {
  const wishes = db.wishes.filter(w => w.sender_id === req.user.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(w => {
      const r = db.users.find(u => u.id === w.recipient_id);
      return { ...w, recipient_name: r?.name };
    });
  res.json({ wishes });
});

module.exports = router;
