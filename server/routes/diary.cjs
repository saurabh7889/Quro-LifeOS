const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// Get all diary entries
router.get('/', (req, res) => {
  const entries = db.prepare('SELECT * FROM diary_entries WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(entries);
});

// Create diary entry
router.post('/', (req, res) => {
  const { mood, energy, productivity, content, date } = req.body;

  const result = db.prepare('INSERT INTO diary_entries (user_id, mood, energy, productivity, content, date) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.userId, mood || 'neutral', energy || 5, productivity || 5, content || '', date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));

  // Award XP for journaling
  db.prepare('UPDATE users SET xp = xp + 25, coins = coins + 10 WHERE id = ?').run(req.userId);

  const entry = db.prepare('SELECT * FROM diary_entries WHERE id = ?').get(result.lastInsertRowid);
  res.json(entry);
});

// Update diary entry
router.patch('/:id', (req, res) => {
  const { mood, energy, productivity, content } = req.body;
  const entry = db.prepare('SELECT * FROM diary_entries WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });

  db.prepare('UPDATE diary_entries SET mood=COALESCE(?,mood), energy=COALESCE(?,energy), productivity=COALESCE(?,productivity), content=COALESCE(?,content) WHERE id=?')
    .run(mood, energy, productivity, content, req.params.id);

  const updated = db.prepare('SELECT * FROM diary_entries WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete diary entry
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM diary_entries WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

module.exports = router;
