const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// Get all habits
router.get('/', (req, res) => {
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC').all(req.userId);
  res.json(habits);
});

// Create habit
router.post('/', (req, res) => {
  const { name, xp } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const result = db.prepare(`
    INSERT INTO habits (user_id, name, xp) VALUES (?, ?, ?)
  `).run(req.userId, name, xp || 50);

  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid);
  res.json(habit);
});

// Toggle habit completion for today
router.patch('/:id/toggle', (req, res) => {
  const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!habit) return res.status(404).json({ error: 'Habit not found' });

  const newCompleted = habit.completed_today ? 0 : 1;
  let newStreak = habit.streak;

  if (newCompleted === 1) {
    newStreak = habit.streak + 1;
    // Award XP
    db.prepare('UPDATE users SET xp = xp + ?, coins = coins + ? WHERE id = ?').run(habit.xp, Math.floor(habit.xp / 3), req.userId);
  } else {
    newStreak = Math.max(0, habit.streak - 1);
    db.prepare('UPDATE users SET xp = MAX(0, xp - ?), coins = MAX(0, coins - ?) WHERE id = ?').run(habit.xp, Math.floor(habit.xp / 3), req.userId);
  }

  db.prepare('UPDATE habits SET completed_today = ?, streak = ?, last_completed = datetime("now") WHERE id = ?')
    .run(newCompleted, newStreak, req.params.id);

  // Update user streak (max streak across all habits)
  const maxStreak = db.prepare('SELECT MAX(streak) as max_streak FROM habits WHERE user_id = ?').get(req.userId);
  const userWithXp = db.prepare('SELECT xp FROM users WHERE id = ?').get(req.userId);
  db.prepare('UPDATE users SET streak = ?, level = ? WHERE id = ?').run(maxStreak.max_streak || 0, Math.floor((userWithXp?.xp || 0) / 100), req.userId);

  const updated = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
  const user = db.prepare('SELECT xp, level, coins, streak FROM users WHERE id = ?').get(req.userId);
  res.json({ habit: updated, user });
});

// Update habit
router.patch('/:id', (req, res) => {
  const { name, xp } = req.body;
  const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!habit) return res.status(404).json({ error: 'Habit not found' });

  db.prepare('UPDATE habits SET name = COALESCE(?, name), xp = COALESCE(?, xp) WHERE id = ?')
    .run(name, xp, req.params.id);

  const updated = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete habit
router.delete('/:id', (req, res) => {
  const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!habit) return res.status(404).json({ error: 'Habit not found' });

  db.prepare('DELETE FROM habits WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Reset all habits for new day
router.post('/reset-daily', (req, res) => {
  db.prepare('UPDATE habits SET completed_today = 0 WHERE user_id = ?').run(req.userId);
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC').all(req.userId);
  res.json(habits);
});

module.exports = router;
