import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, Clock, Flame, Target, Brain, Sparkles, FolderKanban } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../api";
import { SectionEmptyState } from "./ui/SectionEmptyState";
import { useIsMobile } from "./ui/use-mobile";

export function Dashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0 });
  const [habitStats, setHabitStats] = useState({ total: 0, completed: 0 });
  const [projectCount, setProjectCount] = useState(0);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);

  useEffect(() => {
    api.tasks.getAll().then((tasks) => {
      const active = tasks.filter((t: any) => !t.completed);
      const completed = tasks.filter((t: any) => t.completed);
      setTaskStats({ total: tasks.length, completed: completed.length });
      setUpcomingTasks(active.slice(0, 3));
    });
    api.habits.getAll().then((habits) => {
      setHabitStats({
        total: habits.length,
        completed: habits.filter((h: any) => h.completed_today).length,
      });
    });
    api.projects.getAll().then((p) => setProjectCount(p.length));
  }, []);

  if (!user) return null;

  const taskPercent = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;
  const habitPercent = habitStats.total > 0 ? Math.round((habitStats.completed / habitStats.total) * 100) : 0;
  const hasDashboardData =
    user.xp > 0 ||
    user.coins > 0 ||
    user.streak > 0 ||
    user.level > 0 ||
    taskStats.total > 0 ||
    habitStats.total > 0 ||
    projectCount > 0;

  const circleSize = isMobile ? 120 : 160;
  const circleR = isMobile ? 52 : 70;
  const circleCx = circleSize / 2;
  const circleC = 2 * Math.PI * circleR;

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 md:space-y-6`}>
      <div>
        <h2 className={`mb-1 ${isMobile ? 'text-lg' : ''}`}>Welcome {hasDashboardData ? `back, ${user.name.split(" ")[0]} 👋` : "to QURO"}</h2>
        <p className="text-sm text-muted-foreground">
          {hasDashboardData ? "Here's what's happening with your life today" : "Start building your life system"}
        </p>
      </div>

      {!hasDashboardData && (
        <div className="glass rounded-2xl p-6 md:p-8">
          <SectionEmptyState message="No data yet. Start by adding your first task or habit to unlock your dashboard 🚀" className="py-6" />
        </div>
      )}

      {hasDashboardData && (
      <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 glass rounded-2xl p-5 md:p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
          <div className="relative z-10">
            <h3 className="text-sm text-muted-foreground mb-3 md:mb-4">Life Score</h3>
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <div className="relative" style={{ width: circleSize, height: circleSize }}>
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx={circleCx} cy={circleCx} r={circleR} stroke="rgba(99, 102, 241, 0.1)" strokeWidth={isMobile ? 10 : 12} fill="none" />
                  <motion.circle
                    cx={circleCx} cy={circleCx} r={circleR}
                    stroke="url(#gradient)"
                    strokeWidth={isMobile ? 10 : 12} fill="none" strokeLinecap="round"
                    initial={{ strokeDasharray: `${circleC}`, strokeDashoffset: circleC }}
                    animate={{ strokeDashoffset: circleC - (circleC * user.life_score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
                    {user.life_score}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Level</p>
                <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>{user.level}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Streak</p>
                <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold flex items-center justify-center gap-1`}>
                  <Flame className="w-5 h-5 text-orange-500" />
                  {user.streak}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className={`${isMobile ? '' : 'lg:col-span-2'} grid grid-cols-2 gap-3 md:gap-6`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-primary/20 flex items-center justify-center`}>
                <TrendingUp className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total XP</p>
                <h3 className={`font-bold ${isMobile ? 'text-sm' : ''}`}>{user.xp.toLocaleString()}</h3>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(user.xp % 100) || 0}%` }} transition={{ duration: 1, delay: 0.5 }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{100 - (user.xp % 100)} XP to Level {user.level + 1}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-accent/20 flex items-center justify-center`}>
                <Sparkles className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-accent`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Coins</p>
                <h3 className={`font-bold ${isMobile ? 'text-sm' : ''}`}>{user.coins.toLocaleString()}</h3>
              </div>
            </div>
            <p className="text-xs text-accent">Earned from tasks & habits</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-green-500/20 flex items-center justify-center`}>
                <Target className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-green-500`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tasks Today</p>
                <h3 className={`font-bold ${isMobile ? 'text-sm' : ''}`}>{taskStats.completed} / {taskStats.total}</h3>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${taskPercent}%` }} transition={{ duration: 1, delay: 0.6 }} className="absolute inset-y-0 left-0 bg-green-500" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-orange-500/20 flex items-center justify-center`}>
                <Clock className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-orange-500`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Habits</p>
                <h3 className={`font-bold ${isMobile ? 'text-sm' : ''}`}>{habitStats.completed} / {habitStats.total}</h3>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${habitPercent}%` }} transition={{ duration: 1, delay: 0.7 }} className="absolute inset-y-0 left-0 bg-orange-500" />
            </div>
          </motion.div>

          {!isMobile && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Projects</p>
                  <h3 className="font-bold">{projectCount}</h3>
                </div>
              </div>
              <p className="text-xs text-violet-400">Active projects</p>
            </motion.div>
          )}
        </div>
      </div>
      )}

      <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-4 md:p-6">
          <h3 className={`mb-3 md:mb-4 flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
            <Brain className="w-5 h-5 text-accent" />
            AI Insights
          </h3>
          <div className="space-y-3">
            <div className="p-3 md:p-4 rounded-lg bg-accent/10 border border-accent/30">
              <p className="text-sm mb-1">🎯 Productivity {taskPercent >= 70 ? "on fire!" : "needs a boost"}</p>
              <p className="text-xs text-muted-foreground">
                You've completed {taskPercent}% of tasks. {taskPercent >= 70 ? "Keep up the momentum!" : "Try to knock out a few more today."}
              </p>
            </div>
            <div className="p-3 md:p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <p className="text-sm mb-1">{habitPercent >= 75 ? "✅ Habits are solid" : "⚠️ Habits need attention"}</p>
              <p className="text-xs text-muted-foreground">
                {habitStats.completed} of {habitStats.total} habits done today. {habitPercent >= 75 ? "Great consistency!" : "Try to complete more habits today."}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass rounded-2xl p-4 md:p-6">
          <h3 className={`mb-3 md:mb-4 ${isMobile ? 'text-sm' : ''}`}>Upcoming Tasks</h3>
          <div className="space-y-2 md:space-y-3">
            {upcomingTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-orange-500" : "bg-green-500"
                  }`} />
                  <span className="text-sm">{task.title}</span>
                </div>
                {!isMobile && <span className="text-xs text-muted-foreground">{task.deadline}</span>}
              </motion.div>
            ))}
            {upcomingTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {taskStats.total > 0 ? "All tasks completed! 🎉" : "No tasks yet. Head to Tasks to create one!"}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {hasDashboardData && (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={`glass rounded-2xl ${isMobile ? 'p-5' : 'p-8'} text-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
        <div className="relative z-10">
          <motion.p
            key={Math.floor(Date.now() / 3000)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`${isMobile ? 'text-base' : 'text-xl'} italic`}
          >
            "Progress compounds when actions stay consistent."
          </motion.p>
        </div>
      </motion.div>
      )}
    </div>
  );
}
