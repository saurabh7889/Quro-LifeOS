const express = require('express');
const { db } = require('../db.cjs');

const router = express.Router();

// Get aggregated analytics
router.get('/', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(req.userId);
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ?').all(req.userId);
  const subjects = db.prepare('SELECT * FROM study_subjects WHERE user_id = ?').all(req.userId);
  const workouts = db.prepare('SELECT * FROM workouts WHERE user_id = ?').all(req.userId);

  const completedTasks = tasks.filter(t => t.completed).length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const habitCompletionRate = habits.length > 0 ? Math.round((habits.filter(h => h.completed_today).length / habits.length) * 100) : 0;
  const avgStudyScore = subjects.length > 0 ? Math.round(subjects.reduce((s, sub) => s + sub.percentage, 0) / subjects.length) : 0;

  const hasAnyData = tasks.length > 0 || habits.length > 0 || subjects.length > 0 || workouts.length > 0;

  // Weekly progress data
  const productivityData = hasAnyData
    ? [{ week: 'Current', tasks: taskCompletionRate, habits: habitCompletionRate, study: avgStudyScore }]
    : [];

  // Life balance radar (strictly zero on empty accounts)
  const lifeBalanceData = hasAnyData
    ? [
        { category: 'Productivity', value: taskCompletionRate },
        { category: 'Health', value: Math.min(100, workouts.length * 20) },
        { category: 'Study', value: avgStudyScore },
        { category: 'Finance', value: 0 },
        { category: 'Social', value: 0 },
        { category: 'Wellness', value: habitCompletionRate },
      ]
    : [
        { category: 'Productivity', value: 0 },
        { category: 'Health', value: 0 },
        { category: 'Study', value: 0 },
        { category: 'Finance', value: 0 },
        { category: 'Social', value: 0 },
        { category: 'Wellness', value: 0 },
      ];

  // XP growth
  const xpGrowthData = user.xp > 0 ? [{ month: 'Current', xp: user.xp }] : [];

  // Achievements
  const achievements = [];
  if (user.streak >= 7) achievements.push({ title: `${user.streak}-day habit streak`, icon: '🔥', color: 'orange' });
  if (completedTasks >= 10) achievements.push({ title: `Completed ${completedTasks} tasks`, icon: '✅', color: 'green' });
  if (workouts.length >= 3) achievements.push({ title: `${workouts.length} workouts logged`, icon: '💪', color: 'purple' });
  if (user.level > 0) achievements.push({ title: `Level ${user.level} achieved`, icon: '⭐', color: 'yellow' });

  // Improvement areas
  const improvements = [];
  if (tasks.length > 0 && taskCompletionRate < 80) improvements.push({ area: 'Task consistency', score: taskCompletionRate, color: 'orange' });
  if (habitStatsCount(habits) > 0 && habitCompletionRate < 80) improvements.push({ area: 'Habit consistency', score: habitCompletionRate, color: 'orange' });
  if (subjects.length > 0 && avgStudyScore < 85) improvements.push({ area: 'Study performance', score: avgStudyScore, color: 'red' });
  if (workouts.length > 0 && workouts.length < 5) improvements.push({ area: 'Exercise frequency', score: Math.min(100, workouts.length * 20), color: 'yellow' });

  res.json({
    hasAnyData,
    overallScore: hasAnyData ? user.life_score : 0,
    productivity: taskCompletionRate,
    healthScore: Math.min(100, workouts.length * 20),
    studyScore: avgStudyScore,
    productivityData,
    lifeBalanceData,
    xpGrowthData,
    achievements,
    improvements,
  });
});

// Life Meter endpoint
router.get('/lifemeter', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(req.userId);
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ?').all(req.userId);
  const subjects = db.prepare('SELECT * FROM study_subjects WHERE user_id = ?').all(req.userId);
  const workouts = db.prepare('SELECT * FROM workouts WHERE user_id = ?').all(req.userId);
  const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ?').all(req.userId);

  const completedTasks = tasks.filter(t => t.completed).length;
  const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const habitRate = habits.length > 0 ? Math.round((habits.filter(h => h.completed_today).length / habits.length) * 100) : 0;
  const avgStudy = subjects.length > 0 ? Math.round(subjects.reduce((s, sub) => s + sub.percentage, 0) / subjects.length) : 0;
  const healthScore = Math.min(100, workouts.length * 20);
  const financeScore = 0;
  const hasAnyData = tasks.length > 0 || habits.length > 0 || subjects.length > 0 || workouts.length > 0 || transactions.length > 0;

  const categories = hasAnyData ? [
    { name: 'Productivity', score: taskRate, icon: 'Zap', color: '#6366f1' },
    { name: 'Health', score: healthScore, icon: 'Heart', color: '#10b981' },
    { name: 'Study', score: avgStudy, icon: 'BookOpen', color: '#06b6d4' },
    { name: 'Finance', score: financeScore, icon: 'Wallet', color: '#f59e0b' },
    { name: 'Wellness', score: habitRate, icon: 'Target', color: '#8b5cf6' },
  ] : [];

  // Calculate life score based on categories
  const lifeScore = categories.length > 0 ? Math.round(categories.reduce((s, c) => s + c.score, 0) / categories.length) : 0;
  db.prepare('UPDATE users SET life_score = ? WHERE id = ?').run(lifeScore, req.userId);

  // AI-powered insights
  const insights = [];
  if (hasAnyData && taskRate >= 80) insights.push({ type: 'positive', title: '🎯 Productivity Excellence', description: `You're crushing it! ${taskRate}% task completion rate. Your focus is outstanding.`, score: taskRate });
  if (hasAnyData && avgStudy >= 85) insights.push({ type: 'positive', title: '📚 Study Momentum', description: `Amazing progress! ${avgStudy}% average score across subjects.`, score: avgStudy });
  if (hasAnyData && healthScore < 75) insights.push({ type: 'warning', title: '⚠️ Health Needs Attention', description: `Only ${workouts.length} workouts logged. Schedule more exercise sessions.`, score: healthScore });
  if (hasAnyData && habitRate >= 75) insights.push({ type: 'positive', title: '🔥 Streak Master', description: `${user.streak}-day habit streak! Your consistency is impressive.`, score: Math.min(100, user.streak * 2) });
  if (hasAnyData && transactions.length > 0) {
    insights.push({ type: 'neutral', title: '💰 Financial Tracking', description: 'Keep logging your financial activity to improve planning insights.', score: financeScore });
  }

  // Recommendations
  const recommendations = [];
  if (hasAnyData && healthScore < 80) recommendations.push({ priority: 'high', title: 'Schedule 3 workouts this week', category: 'Health', impact: `+${Math.min(20, 100 - healthScore)} points` });
  if (hasAnyData && taskRate < 90) recommendations.push({ priority: 'medium', title: 'Complete remaining active tasks', category: 'Productivity', impact: '+5 points' });
  if (hasAnyData && avgStudy > 0) recommendations.push({ priority: 'low', title: 'Maintain current study momentum', category: 'Study', impact: '+3 points' });

  const performanceLabel = hasAnyData ? (lifeScore >= 80 ? 'Outstanding' : lifeScore >= 70 ? 'Excellent' : lifeScore >= 60 ? 'Good' : 'Needs Work') : 'No Data Yet';

  res.json({
    lifeScore: hasAnyData ? lifeScore : 0,
    performanceLabel,
    categories,
    insights,
    recommendations,
  });
});

function habitStatsCount(habits) {
  return Array.isArray(habits) ? habits.length : 0;
}

module.exports = router;
