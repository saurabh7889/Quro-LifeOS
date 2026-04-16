const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// Global search
router.get('/', (req, res) => {
  const q = req.query.q;
  if (!q || q.trim().length === 0) return res.json([]);

  const query = `%${q}%`;
  const results = [];

  // Search tasks
  const tasks = db.prepare("SELECT id, title as name, 'task' as type FROM tasks WHERE user_id = ? AND title LIKE ?").all(req.userId, query);
  results.push(...tasks);

  // Search habits
  const habits = db.prepare("SELECT id, name, 'habit' as type FROM habits WHERE user_id = ? AND name LIKE ?").all(req.userId, query);
  results.push(...habits);

  // Search projects
  const projects = db.prepare("SELECT id, name, 'project' as type FROM projects WHERE user_id = ? AND name LIKE ?").all(req.userId, query);
  results.push(...projects);

  // Search study resources
  const resources = db.prepare("SELECT id, title as name, 'resource' as type FROM study_resources WHERE user_id = ? AND title LIKE ?").all(req.userId, query);
  results.push(...resources);

  // Search notes
  const notes = db.prepare("SELECT id, title as name, 'note' as type FROM study_notes WHERE user_id = ? AND title LIKE ?").all(req.userId, query);
  results.push(...notes);

  // Search movies
  const movies = db.prepare("SELECT id, title as name, 'movie' as type FROM movies WHERE user_id = ? AND title LIKE ?").all(req.userId, query);
  results.push(...movies);

  // Search diary entries
  const diary = db.prepare("SELECT id, date as name, 'diary' as type FROM diary_entries WHERE user_id = ? AND content LIKE ?").all(req.userId, query);
  results.push(...diary);

  res.json(results.slice(0, 20));
});

module.exports = router;
