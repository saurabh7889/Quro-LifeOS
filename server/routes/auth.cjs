const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db.cjs');
const { JWT_SECRET } = require('../middleware/auth.cjs');
const { sendResetEmail } = require('../mailer.cjs');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash, xp, level, coins, streak, life_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, email, passwordHash, 0, 0, 0, 0, 0);

    const userId = result.lastInsertRowid;

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
    const user = db.prepare('SELECT id, name, email, xp, level, coins, streak, life_score FROM users WHERE id = ?').get(userId);

    res.json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        streak: user.streak,
        life_score: user.life_score,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      // Don't reveal if email exists, just return success
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Secret is combined with current password hash so token invalidates after password change
    const secret = JWT_SECRET + user.password_hash;
    const token = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: '15m' });

    // The frontend URL to redirect to
    const frontendUrl = process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5173';
    const resetLink = `${frontendUrl}?resetToken=${token}&id=${user.id}`;

    await sendResetEmail(user.email, resetLink);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset Password
router.post('/reset-password', (req, res) => {
  try {
    const { id, token, password } = req.body;
    if (!id || !token || !password) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const secret = JWT_SECRET + user.password_hash;
    try {
      jwt.verify(token, secret);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const newPasswordHash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newPasswordHash, id);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
