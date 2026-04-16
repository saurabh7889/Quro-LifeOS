const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// Get user profile
router.get('/profile', (req, res) => {
  const user = db.prepare(
    'SELECT id, name, email, username, bio, avatar_url, date_of_birth, goals, notif_task_reminders, notif_habit_alerts, notif_weekly_summary, xp, level, coins, streak, life_score, created_at FROM users WHERE id = ?'
  ).get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Update user profile
router.patch('/profile', (req, res) => {
  const { name = null, username = null, bio = null, avatar_url = null, date_of_birth = null, goals = null, notif_task_reminders = null, notif_habit_alerts = null, notif_weekly_summary = null, xp = null, level = null, coins = null, streak = null, life_score = null } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      username = COALESCE(?, username),
      bio = COALESCE(?, bio),
      avatar_url = COALESCE(?, avatar_url),
      date_of_birth = COALESCE(?, date_of_birth),
      goals = COALESCE(?, goals),
      notif_task_reminders = COALESCE(?, notif_task_reminders),
      notif_habit_alerts = COALESCE(?, notif_habit_alerts),
      notif_weekly_summary = COALESCE(?, notif_weekly_summary),
      xp = COALESCE(?, xp),
      level = COALESCE(?, level),
      coins = COALESCE(?, coins),
      streak = COALESCE(?, streak),
      life_score = COALESCE(?, life_score)
    WHERE id = ?
  `).run(name, username, bio, avatar_url, date_of_birth, goals, notif_task_reminders, notif_habit_alerts, notif_weekly_summary, xp, level, coins, streak, life_score, req.userId);

  const updated = db.prepare(
    'SELECT id, name, email, username, bio, avatar_url, date_of_birth, goals, notif_task_reminders, notif_habit_alerts, notif_weekly_summary, xp, level, coins, streak, life_score, created_at FROM users WHERE id = ?'
  ).get(req.userId);
  res.json(updated);
});

// Get dashboard stats
router.get('/dashboard-stats', (req, res) => {
  const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?').get(req.userId).count;
  const completedTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND completed = 1').get(req.userId).count;
  const totalHabits = db.prepare('SELECT COUNT(*) as count FROM habits WHERE user_id = ?').get(req.userId).count;
  const completedHabits = db.prepare('SELECT COUNT(*) as count FROM habits WHERE user_id = ? AND completed_today = 1').get(req.userId).count;
  const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ?').get(req.userId).count;

  res.json({ totalTasks, completedTasks, totalHabits, completedHabits, totalProjects });
});

// Delete account
router.delete('/account', (req, res) => {
  const userId = req.userId;

  const tables = [
    'tasks', 'habits', 'study_subjects', 'study_resources', 'study_notes',
    'study_settings', 'projects', 'transactions', 'savings_goals',
    'workouts', 'health_metrics', 'diary_entries', 'movies', 'notifications'
  ];

  const deleteAll = db.transaction(() => {
    // Delete project milestones first
    try {
      const projectIds = db.prepare('SELECT id FROM projects WHERE user_id = ?').all(userId);
      for (const p of projectIds) {
        db.prepare('DELETE FROM project_milestones WHERE project_id = ?').run(p.id);
      }
    } catch (e) {}

    for (const table of tables) {
      try {
        db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(userId);
      } catch (e) {}
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  });

  deleteAll();
  res.json({ success: true });
});

module.exports = router;
