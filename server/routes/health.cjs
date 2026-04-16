const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// Get workouts
router.get('/workouts', (req, res) => {
  const workouts = db.prepare('SELECT * FROM workouts WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(workouts);
});

// Log workout
router.post('/workouts', (req, res) => {
  const { name, duration, calories, date } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const result = db.prepare('INSERT INTO workouts (user_id, name, duration, calories, date) VALUES (?, ?, ?, ?, ?)')
    .run(req.userId, name, duration || '', calories || 0, date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(result.lastInsertRowid);
  res.json(workout);
});

// Delete workout
router.delete('/workouts/:id', (req, res) => {
  db.prepare('DELETE FROM workouts WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

// Get health metrics
router.get('/metrics', (req, res) => {
  const metrics = db.prepare('SELECT * FROM health_metrics WHERE user_id = ? ORDER BY id ASC').all(req.userId);
  const latestMetric = metrics[metrics.length - 1] || { steps: 0, calories_burned: 0, fitness_score: 0, step_goal: 0 };
  const workoutsThisWeek = db.prepare('SELECT COUNT(*) as count FROM workouts WHERE user_id = ?').get(req.userId);

  res.json({
    activityData: metrics.map(m => ({ day: m.date, steps: m.steps, calories: m.calories_burned })),
    todaySteps: latestMetric.steps,
    stepGoal: latestMetric.step_goal,
    caloriesBurned: latestMetric.calories_burned,
    fitnessScore: latestMetric.fitness_score,
    workoutsThisWeek: workoutsThisWeek.count,
  });
});

// Update health metrics
router.post('/metrics', (req, res) => {
  const { steps, calories_burned, fitness_score, step_goal, date } = req.body;

  const result = db.prepare('INSERT INTO health_metrics (user_id, steps, calories_burned, fitness_score, step_goal, date) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.userId, steps || 0, calories_burned || 0, fitness_score || 0, step_goal || 0, date || new Date().toLocaleDateString('en-US', { weekday: 'short' }));

  const metric = db.prepare('SELECT * FROM health_metrics WHERE id = ?').get(result.lastInsertRowid);
  res.json(metric);
});

module.exports = router;
