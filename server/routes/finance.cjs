const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// Get all transactions
router.get('/transactions', (req, res) => {
  const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(transactions);
});

// Create transaction
router.post('/transactions', (req, res) => {
  const { name, amount, type, category, date } = req.body;
  if (!name || amount === undefined) return res.status(400).json({ error: 'Name and amount are required' });

  const result = db.prepare('INSERT INTO transactions (user_id, name, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.userId, name, amount, type || (amount >= 0 ? 'income' : 'expense'), category || 'Other', date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

  // Update net worth
  if (amount > 0) {
    db.prepare('UPDATE savings_goals SET net_worth = net_worth + ? WHERE user_id = ?').run(amount, req.userId);
  } else {
    db.prepare('UPDATE savings_goals SET net_worth = net_worth + ? WHERE user_id = ?').run(amount, req.userId);
  }

  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
  res.json(transaction);
});

// Delete transaction
router.delete('/transactions/:id', (req, res) => {
  const txn = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });

  // Reverse the net worth impact
  db.prepare('UPDATE savings_goals SET net_worth = net_worth - ? WHERE user_id = ?').run(txn.amount, req.userId);
  db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Get financial summary
router.get('/summary', (req, res) => {
  const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ?').all(req.userId);
  const savings = db.prepare('SELECT * FROM savings_goals WHERE user_id = ?').get(req.userId);

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  const netSavings = totalIncome - totalExpenses;

  // Expense breakdown by category
  const expensesByCategory = {};
  transactions.filter(t => t.amount < 0).forEach(t => {
    const cat = t.category || 'Other';
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Math.abs(t.amount);
  });

  const categoryColors = {
    Housing: '#6366f1',
    Food: '#06b6d4',
    Transport: '#10b981',
    Entertainment: '#f59e0b',
    Other: '#ef4444',
    Salary: '#10b981',
    Freelance: '#06b6d4',
  };

  const expenseBreakdown = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || '#9ca3af',
  }));

  // Monthly data — built strictly from actual transactions (no fabricated history)
  const monthMap = {};
  transactions.forEach(t => {
    const month = t.date || 'Other';
    if (!monthMap[month]) monthMap[month] = { month, income: 0, expenses: 0 };
    if (t.amount > 0) monthMap[month].income += t.amount;
    else monthMap[month].expenses += Math.abs(t.amount);
  });
  const monthlyData = Object.values(monthMap);

  res.json({
    totalIncome,
    totalExpenses,
    savings: netSavings,
    netWorth: savings ? savings.net_worth : 0,
    savingsGoal: savings ? savings.goal_amount : 0,
    monthlyData,
    expenseBreakdown,
  });
});

// Update savings goal
router.patch('/savings-goal', (req, res) => {
  const { goal_amount, net_worth } = req.body;
  const existing = db.prepare('SELECT * FROM savings_goals WHERE user_id = ?').get(req.userId);
  if (existing) {
    db.prepare('UPDATE savings_goals SET goal_amount=COALESCE(?,goal_amount), net_worth=COALESCE(?,net_worth) WHERE user_id=?')
      .run(goal_amount, net_worth, req.userId);
  } else {
    db.prepare('INSERT INTO savings_goals (user_id, goal_amount, net_worth) VALUES (?, ?, ?)')
      .run(req.userId, goal_amount || 0, net_worth || 0);
  }
  const updated = db.prepare('SELECT * FROM savings_goals WHERE user_id = ?').get(req.userId);
  res.json(updated);
});

module.exports = router;
