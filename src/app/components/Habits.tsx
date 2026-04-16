import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Check, Plus, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../api";
import { SectionEmptyState } from "./ui/SectionEmptyState";
import { SwipeableCard } from "./ui/SwipeableCard";
import { useIsMobile } from "./ui/use-mobile";

const motivationalQuotes = [
  "Success is the sum of small efforts repeated day in and day out.",
  "Your future is created by what you do today, not tomorrow.",
  "Small daily improvements over time lead to stunning results.",
  "Discipline is choosing between what you want now and what you want most.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
];

export function Habits() {
  const { refreshUser } = useAuth();
  const isMobile = useIsMobile();
  const [habits, setHabits] = useState<any[]>([]);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newXP, setNewXP] = useState(50);

  useEffect(() => {
    api.habits.getAll().then(setHabits);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleHabit = async (id: number) => {
    const res = await api.habits.toggle(id);
    setHabits(habits.map((h) => (h.id === id ? res.habit : h)));
    refreshUser();
  };

  const createHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const habit = await api.habits.create({ name: newName, xp: newXP });
    setHabits([...habits, habit]);
    setNewName("");
    setNewXP(50);
    setShowForm(false);
  };

  const deleteHabit = async (id: number) => {
    await api.habits.delete(id);
    setHabits(habits.filter((h) => h.id !== id));
  };

  const completedCount = habits.filter((h) => h.completed_today).length;
  const completionPercentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;

  const circleSize = isMobile ? 100 : 128;
  const circleR = isMobile ? 42 : 56;
  const circleCx = circleSize / 2;
  const circleC = 2 * Math.PI * circleR;

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 md:space-y-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`mb-1 ${isMobile ? 'text-lg' : ''}`}>Daily Habits</h2>
          <p className="text-sm text-muted-foreground">
            {completedCount} / {habits.length} completed ({completionPercentage}%)
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} bg-primary text-primary-foreground rounded-lg hover:glow transition-all flex items-center gap-2 tap-feedback`}>
          <Plus className="w-4 h-4" />
          {!isMobile && "Add Habit"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={createHabit} className="glass rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={isMobile ? 'text-sm' : ''}>New Habit</h3>
              <button type="button" onClick={() => setShowForm(false)} className="tap-feedback"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Habit name..." required className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none" />
            <div>
              <label className="block text-xs text-muted-foreground mb-1">XP per completion</label>
              <input type="number" value={newXP} onChange={(e) => setNewXP(parseInt(e.target.value) || 50)} className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:outline-none" />
            </div>
            <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:glow transition-all tap-feedback">Create Habit</button>
          </motion.form>
        )}
      </AnimatePresence>

      {habits.length === 0 ? (
        <div className="glass rounded-2xl p-4 md:p-6">
          <SectionEmptyState message="No habits yet. Add your first daily habit to start building consistency and streaks! 🔥" />
        </div>
      ) : (
      <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <div className="relative" style={{ width: circleSize, height: circleSize }}>
              <svg className="w-full h-full transform -rotate-90">
                <circle cx={circleCx} cy={circleCx} r={circleR} stroke="rgba(99, 102, 241, 0.1)" strokeWidth={isMobile ? 8 : 10} fill="none" />
                <motion.circle cx={circleCx} cy={circleCx} r={circleR} stroke="url(#habit-gradient)" strokeWidth={isMobile ? 8 : 10} fill="none" strokeLinecap="round"
                  initial={{ strokeDasharray: `${circleC}`, strokeDashoffset: circleC }}
                  animate={{ strokeDashoffset: circleC - (circleC * completionPercentage) / 100 }}
                  transition={{ duration: 1 }}
                />
                <defs><linearGradient id="habit-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>{completionPercentage}%</span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">Daily Progress</p>
        </motion.div>

        <div className={`${isMobile ? '' : 'lg:col-span-2'} glass rounded-2xl p-4 md:p-6`}>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Flame className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            <h3 className={isMobile ? 'text-sm' : ''}>Current Streak</h3>
          </div>
          <div className="mb-3 md:mb-4">
            <p className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent`}>{maxStreak} Days</p>
            <p className="text-sm text-muted-foreground mt-2">
              {maxStreak >= 30 ? "Your longest streak ever! Keep it going!" : "Build your streak — every day counts!"}
            </p>
          </div>
          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`aspect-square rounded-lg ${i < Math.min(maxStreak, 7) ? "bg-orange-500/30 border border-orange-500/50" : "bg-muted/30"}`} />
            ))}
          </div>
        </div>
      </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`glass rounded-2xl ${isMobile ? 'p-5' : 'p-8'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
        <div className="relative z-10 text-center">
          <h3 className="text-sm text-muted-foreground mb-3 md:mb-4">Motivation</h3>
          <AnimatePresence mode="wait">
            <motion.p key={currentQuote} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className={`${isMobile ? 'text-base' : 'text-xl'} italic`}>
              "{motivationalQuotes[currentQuote]}"
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {habits.length > 0 && (
      <div>
        <h3 className={`mb-3 md:mb-4 ${isMobile ? 'text-sm' : ''}`}>Today's Habits</h3>
        <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {habits.map((habit, index) => (
            <SwipeableCard
              key={habit.id}
              onSwipeRight={() => !habit.completed_today && toggleHabit(habit.id)}
              onSwipeLeft={() => deleteHabit(habit.id)}
              rightLabel="Done"
            >
              <motion.div key={habit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className={`glass rounded-xl p-4 md:p-5 cursor-pointer transition-all ${habit.completed_today ? "bg-green-500/10 border-green-500/30" : "hover:glow-hover"}`}
              >
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className="flex items-center gap-3 tap-feedback" onClick={() => toggleHabit(habit.id)}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${habit.completed_today ? "bg-green-500 text-white" : "border-2 border-muted-foreground/30"}`}>
                      {habit.completed_today && <Check className="w-4 h-4" />}
                    </div>
                    <h4 className={`${habit.completed_today ? "line-through text-muted-foreground" : ""} ${isMobile ? 'text-sm' : ''}`}>{habit.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-orange-500">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-bold">{habit.streak}</span>
                    </div>
                    {!isMobile && (
                      <button onClick={() => deleteHabit(habit.id)} className="p-1 rounded hover:bg-red-500/20 transition-colors">
                        <X className="w-3 h-3 text-muted-foreground hover:text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>+{habit.xp} XP</span>
                  <span>{habit.streak} day streak</span>
                </div>
              </motion.div>
            </SwipeableCard>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
