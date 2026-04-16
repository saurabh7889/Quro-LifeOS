const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// Get all users (admin)
router.get('/users', (req, res) => {
  const users = db.prepare(
    'SELECT id, name, email, xp, level, coins, streak, life_score, created_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json(users);
});

// Delete user (admin)
router.delete('/users/:id', (req, res) => {
  const targetId = parseInt(req.params.id);

  // Prevent self-deletion
  if (targetId === req.userId) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Delete all related data (order matters for foreign keys)
  const tables = [
    'tasks', 'habits', 'study_subjects', 'study_resources', 'study_notes',
    'study_settings', 'projects', 'transactions', 'savings_goals',
    'workouts', 'health_metrics', 'diary_entries', 'movies', 'notifications'
  ];

  const deleteAll = db.transaction(() => {
    for (const table of tables) {
      try {
        db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(targetId);
      } catch (e) {
        // Table might not have user_id column, skip
      }
    }
    // Delete project milestones via projects
    try {
      const projectIds = db.prepare('SELECT id FROM projects WHERE user_id = ?').all(targetId);
      for (const p of projectIds) {
        db.prepare('DELETE FROM project_milestones WHERE project_id = ?').run(p.id);
      }
    } catch (e) {}

    db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
  });

  deleteAll();
  res.json({ success: true });
});

// Get user stats overview (admin)
router.get('/stats', (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
  const totalHabits = db.prepare('SELECT COUNT(*) as count FROM habits').get().count;
  const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;

  res.json({ totalUsers, totalTasks, totalHabits, totalProjects });
});

module.exports = router;
