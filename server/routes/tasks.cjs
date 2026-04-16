const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// AI Reward Calculation Engine
function calculateAIReward(priority, difficulty, timeStr) {
  let pMulti = 1;
  if (priority === 'high') pMulti = 1.5;
  if (priority === 'low') pMulti = 0.8;

  let dMulti = 1;
  if (difficulty === 'hard') dMulti = 1.5;
  if (difficulty === 'easy') dMulti = 0.8;

  let h = 0, m = 0;
  const tStr = (timeStr || "1h").toLowerCase();
  
  const hMatch = tStr.match(/(\d+)\s*h/);
  const mMatch = tStr.match(/(\d+)\s*m/);
  
  if (hMatch) h = parseInt(hMatch[1]) || 0;
  if (mMatch) m = parseInt(mMatch[1]) || 0;
  
  if (!h && !m) {
    const raw = parseInt(tStr);
    if (!isNaN(raw)) {
      if (raw <= 12) h = raw;
      else m = raw;
    }
  }
  
  let totalMinutes = h * 60 + m;
  if (totalMinutes <= 0) totalMinutes = 30;
  if (totalMinutes > 600) totalMinutes = 600;

  const rawXp = (20 + totalMinutes) * pMulti * dMulti;
  return Math.max(10, Math.floor(rawXp / 5) * 5);
}

// Get all tasks
router.get('/', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY completed ASC, created_at DESC').all(req.userId);
  res.json(tasks);
});

// Create task
router.post('/', (req, res) => {
  const { title, priority, difficulty, estimated_time, deadline } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const aiXp = calculateAIReward(priority, difficulty, estimated_time);

  const result = db.prepare(`
    INSERT INTO tasks (user_id, title, priority, difficulty, estimated_time, xp, deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.userId, title, priority || 'medium', difficulty || 'medium', estimated_time || '1h', aiXp, deadline || 'No deadline');

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.json(task);
});

// Update task
router.patch('/:id', (req, res) => {
  const { title = null, priority = null, difficulty = null, estimated_time = null, deadline = null } = req.body;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const newPriority = priority !== null ? priority : task.priority;
  const newDifficulty = difficulty !== null ? difficulty : task.difficulty;
  const newTime = estimated_time !== null ? estimated_time : task.estimated_time;
  const newAiXp = calculateAIReward(newPriority, newDifficulty, newTime);

  db.prepare(`
    UPDATE tasks SET
      title = COALESCE(?, title),
      priority = COALESCE(?, priority),
      difficulty = COALESCE(?, difficulty),
      estimated_time = COALESCE(?, estimated_time),
      xp = ?,
      deadline = COALESCE(?, deadline)
    WHERE id = ? AND user_id = ?
  `).run(title, priority, difficulty, estimated_time, newAiXp, deadline, req.params.id, req.userId);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Toggle task completion
router.patch('/:id/toggle', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const newCompleted = task.completed ? 0 : 1;
  db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(newCompleted, req.params.id);

  // Award XP when completing a task
  if (newCompleted === 1) {
    db.prepare('UPDATE users SET xp = xp + ?, coins = coins + ? WHERE id = ?').run(task.xp, Math.floor(task.xp / 2), req.userId);

    // Level formula: floor(XP / 100)
    const user = db.prepare('SELECT xp, level FROM users WHERE id = ?').get(req.userId);
    const expectedLevel = Math.floor(user.xp / 100);
    if (expectedLevel > user.level) {
      db.prepare('UPDATE users SET level = ? WHERE id = ?').run(expectedLevel, req.userId);
    }
  } else {
    // Remove XP when un-completing
    db.prepare('UPDATE users SET xp = MAX(0, xp - ?), coins = MAX(0, coins - ?) WHERE id = ?').run(task.xp, Math.floor(task.xp / 2), req.userId);
    const user = db.prepare('SELECT xp FROM users WHERE id = ?').get(req.userId);
    db.prepare('UPDATE users SET level = ? WHERE id = ?').run(Math.floor(user.xp / 100), req.userId);
  }

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  const user = db.prepare('SELECT xp, level, coins FROM users WHERE id = ?').get(req.userId);
  res.json({ task: updated, user });
});

// Delete task
router.delete('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
