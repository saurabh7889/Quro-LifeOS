const express = require('express');
const cors = require('cors');
const path = require('path');
const { authMiddleware } = require('./middleware/auth.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", // For local development
    "https://qurolifeos.vercel.app" // Your Vercel frontend
  ],
  credentials: true
}));
app.use(express.json());

// Health check (renamed to /api/ping to avoid collision with health module)
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', require('./routes/auth.cjs'));

// Protected routes (require JWT)
app.use('/api/user', authMiddleware, require('./routes/user.cjs'));
app.use('/api/tasks', authMiddleware, require('./routes/tasks.cjs'));
app.use('/api/habits', authMiddleware, require('./routes/habits.cjs'));
app.use('/api/study', authMiddleware, require('./routes/study.cjs'));
app.use('/api/projects', authMiddleware, require('./routes/projects.cjs'));
app.use('/api/finance', authMiddleware, require('./routes/finance.cjs'));
app.use('/api/health', authMiddleware, require('./routes/health.cjs'));
app.use('/api/diary', authMiddleware, require('./routes/diary.cjs'));
app.use('/api/entertainment', authMiddleware, require('./routes/entertainment.cjs'));
app.use('/api/analytics', authMiddleware, require('./routes/analytics.cjs'));
app.use('/api/notifications', authMiddleware, require('./routes/notifications.cjs'));
app.use('/api/search', authMiddleware, require('./routes/search.cjs'));
app.use('/api/admin', authMiddleware, require('./routes/admin.cjs'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 QURO LifeOS Backend running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${path.join(__dirname, 'quro.db')}`);
  console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL || '(not set — defaulting to https://qurolifeos.vercel.app)'}`);
  console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER ? '✅ set' : '❌ NOT SET'}`);
  console.log(`🔑 EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ set' : '❌ NOT SET'}`);
});
