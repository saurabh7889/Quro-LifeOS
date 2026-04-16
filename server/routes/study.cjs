const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();
const getScope = (req) => req.query.scope || req.body.scope || 'semester-1';

// --- Subjects ---
router.get('/subjects', (req, res) => {
  const scope = getScope(req);
  const subjects = db.prepare('SELECT * FROM study_subjects WHERE user_id = ? AND scope = ?').all(req.userId, scope);
  res.json(subjects);
});

router.post('/subjects', (req, res) => {
  const { name, percentage, trend, color } = req.body;
  const scope = getScope(req);
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare('INSERT INTO study_subjects (user_id, name, percentage, trend, color, scope) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.userId, name, percentage || 0, trend || 'neutral', color || 'bg-blue-500', scope);
  const subject = db.prepare('SELECT * FROM study_subjects WHERE id = ?').get(result.lastInsertRowid);
  res.json(subject);
});

router.patch('/subjects/:id', (req, res) => {
  const { name, percentage, trend, color } = req.body;
  const scope = getScope(req);
  const subject = db.prepare('SELECT * FROM study_subjects WHERE id = ? AND user_id = ? AND scope = ?').get(req.params.id, req.userId, scope);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  db.prepare('UPDATE study_subjects SET name=COALESCE(?,name), percentage=COALESCE(?,percentage), trend=COALESCE(?,trend), color=COALESCE(?,color) WHERE id=?')
    .run(name, percentage, trend, color, req.params.id);
  const updated = db.prepare('SELECT * FROM study_subjects WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/subjects/:id', (req, res) => {
  const scope = getScope(req);
  db.prepare('DELETE FROM study_subjects WHERE id = ? AND user_id = ? AND scope = ?').run(req.params.id, req.userId, scope);
  res.json({ success: true });
});

// --- Resources ---
router.get('/resources', (req, res) => {
  const scope = getScope(req);
  const resources = db.prepare('SELECT * FROM study_resources WHERE user_id = ? AND scope = ? ORDER BY created_at DESC').all(req.userId, scope);
  res.json(resources);
});

router.post('/resources', (req, res) => {
  const { title, type, status, duration } = req.body;
  const scope = getScope(req);
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const result = db.prepare('INSERT INTO study_resources (user_id, title, type, status, duration, scope) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.userId, title, type || 'Notes', status || 'Not Started', duration || '', scope);
  const resource = db.prepare('SELECT * FROM study_resources WHERE id = ?').get(result.lastInsertRowid);
  res.json(resource);
});

router.patch('/resources/:id', (req, res) => {
  const { title, type, status, duration } = req.body;
  const scope = getScope(req);
  const resource = db.prepare('SELECT * FROM study_resources WHERE id = ? AND user_id = ? AND scope = ?').get(req.params.id, req.userId, scope);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  db.prepare('UPDATE study_resources SET title=COALESCE(?,title), type=COALESCE(?,type), status=COALESCE(?,status), duration=COALESCE(?,duration) WHERE id=?')
    .run(title, type, status, duration, req.params.id);
  const updated = db.prepare('SELECT * FROM study_resources WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/resources/:id', (req, res) => {
  const scope = getScope(req);
  db.prepare('DELETE FROM study_resources WHERE id = ? AND user_id = ? AND scope = ?').run(req.params.id, req.userId, scope);
  res.json({ success: true });
});

// --- Notes ---
router.get('/notes', (req, res) => {
  const scope = getScope(req);
  const notes = db.prepare('SELECT * FROM study_notes WHERE user_id = ? AND scope = ? ORDER BY date DESC').all(req.userId, scope);
  res.json(notes.map(n => ({ ...n, tags: JSON.parse(n.tags || '[]') })));
});

router.post('/notes', (req, res) => {
  const { title, tags, content } = req.body;
  const scope = getScope(req);
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const result = db.prepare('INSERT INTO study_notes (user_id, title, tags, content, scope) VALUES (?, ?, ?, ?, ?)')
    .run(req.userId, title, JSON.stringify(tags || []), content || '', scope);
  const note = db.prepare('SELECT * FROM study_notes WHERE id = ?').get(result.lastInsertRowid);
  res.json({ ...note, tags: JSON.parse(note.tags || '[]') });
});

router.delete('/notes/:id', (req, res) => {
  const scope = getScope(req);
  db.prepare('DELETE FROM study_notes WHERE id = ? AND user_id = ? AND scope = ?').run(req.params.id, req.userId, scope);
  res.json({ success: true });
});

// --- Settings (CGPA) ---
router.get('/settings', (req, res) => {
  const scope = getScope(req);
  const settings = db.prepare('SELECT * FROM study_settings WHERE user_id = ? AND scope = ?').get(req.userId, scope);
  res.json(settings || { current_cgpa: 0, target_cgpa: 0, scope });
});

router.patch('/settings', (req, res) => {
  const { current_cgpa, target_cgpa } = req.body;
  const scope = getScope(req);
  const existing = db.prepare('SELECT * FROM study_settings WHERE user_id = ? AND scope = ?').get(req.userId, scope);
  if (existing) {
    db.prepare('UPDATE study_settings SET current_cgpa=COALESCE(?,current_cgpa), target_cgpa=COALESCE(?,target_cgpa) WHERE user_id=? AND scope = ?')
      .run(current_cgpa, target_cgpa, req.userId, scope);
  } else {
    db.prepare('INSERT INTO study_settings (user_id, current_cgpa, target_cgpa, scope) VALUES (?, ?, ?, ?)')
      .run(req.userId, current_cgpa || 0, target_cgpa || 0, scope);
  }
  const settings = db.prepare('SELECT * FROM study_settings WHERE user_id = ? AND scope = ?').get(req.userId, scope);
  res.json(settings);
});

// --- Performance trend data ---
router.get('/trend', (req, res) => {
  const scope = getScope(req);
  const subjects = db.prepare('SELECT * FROM study_subjects WHERE user_id = ? AND scope = ?').all(req.userId, scope);
  if (!subjects.length) {
    return res.json([]);
  }
  const avgScore = Math.round(subjects.reduce((s, sub) => s + sub.percentage, 0) / subjects.length);
  res.json([{ month: 'Current', score: avgScore }]);
});

module.exports = router;
