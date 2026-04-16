const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// Get all projects with milestones
router.get('/', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  const result = projects.map(p => {
    const milestones = db.prepare('SELECT * FROM project_milestones WHERE project_id = ? ORDER BY id ASC').all(p.id);
    return { ...p, milestones };
  });
  res.json(result);
});

// Create project
router.post('/', (req, res) => {
  const { name, deadline, milestones } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const result = db.prepare('INSERT INTO projects (user_id, name, progress, status, deadline) VALUES (?, ?, ?, ?, ?)')
    .run(req.userId, name, 0, 'In Progress', deadline || 'No deadline');

  const projectId = result.lastInsertRowid;

  if (milestones && Array.isArray(milestones)) {
    const insertMs = db.prepare('INSERT INTO project_milestones (project_id, name, completed) VALUES (?, ?, ?)');
    milestones.forEach(m => insertMs.run(projectId, m.name || m, 0));
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  const ms = db.prepare('SELECT * FROM project_milestones WHERE project_id = ?').all(projectId);
  res.json({ ...project, milestones: ms });
});

// Update project
router.patch('/:id', (req, res) => {
  const { name, status, deadline } = req.body;
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  db.prepare('UPDATE projects SET name=COALESCE(?,name), status=COALESCE(?,status), deadline=COALESCE(?,deadline) WHERE id=?')
    .run(name, status, deadline, req.params.id);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  const milestones = db.prepare('SELECT * FROM project_milestones WHERE project_id = ?').all(req.params.id);
  res.json({ ...updated, milestones });
});

// Toggle milestone
router.patch('/:id/milestones/:milestoneId/toggle', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const milestone = db.prepare('SELECT * FROM project_milestones WHERE id = ? AND project_id = ?').get(req.params.milestoneId, req.params.id);
  if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

  db.prepare('UPDATE project_milestones SET completed = ? WHERE id = ?').run(milestone.completed ? 0 : 1, req.params.milestoneId);

  // Recalculate progress
  const milestones = db.prepare('SELECT * FROM project_milestones WHERE project_id = ?').all(req.params.id);
  const completed = milestones.filter(m => m.completed).length;
  const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;
  const status = progress === 100 ? 'Completed' : 'In Progress';

  db.prepare('UPDATE projects SET progress = ?, status = ? WHERE id = ?').run(progress, status, req.params.id);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  const updatedMs = db.prepare('SELECT * FROM project_milestones WHERE project_id = ?').all(req.params.id);
  res.json({ ...updated, milestones: updatedMs });
});

// Delete project
router.delete('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  db.prepare('DELETE FROM project_milestones WHERE project_id = ?').run(req.params.id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
