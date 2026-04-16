const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// Get all movies
router.get('/', (req, res) => {
  const movies = db.prepare('SELECT * FROM movies WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(movies);
});

// Add movie
router.post('/', (req, res) => {
  const { title, year, rating, status, genre, poster } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const result = db.prepare('INSERT INTO movies (user_id, title, year, rating, status, genre, poster) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(req.userId, title, year || null, rating || null, status || 'watchlist', genre || '', poster || '🎬');

  const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(result.lastInsertRowid);
  res.json(movie);
});

// Update movie (mark as watched, rate, etc.)
router.patch('/:id', (req, res) => {
  const { title, year, rating, status, genre, poster } = req.body;
  const movie = db.prepare('SELECT * FROM movies WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  db.prepare('UPDATE movies SET title=COALESCE(?,title), year=COALESCE(?,year), rating=COALESCE(?,rating), status=COALESCE(?,status), genre=COALESCE(?,genre), poster=COALESCE(?,poster) WHERE id=?')
    .run(title, year, rating, status, genre, poster, req.params.id);

  const updated = db.prepare('SELECT * FROM movies WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete movie
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM movies WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

module.exports = router;
