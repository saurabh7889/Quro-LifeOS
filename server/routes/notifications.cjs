const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// Get notifications
router.get('/', (req, res) => {
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.userId);
  res.json(notifications);
});

// Create notification
router.post('/', (req, res) => {
  const { title, description, time } = req.body;
  const result = db.prepare('INSERT INTO notifications (user_id, title, description, time) VALUES (?, ?, ?, ?)')
    .run(req.userId, title, description || '', time || 'Just now');
  const notif = db.prepare('SELECT * FROM notifications WHERE id = ?').get(result.lastInsertRowid);
  res.json(notif);
});

// Mark as read
router.patch('/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

// Mark all as read
router.patch('/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.userId);
  res.json({ success: true });
});

// Delete notification
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

module.exports = router;
