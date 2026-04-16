import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, CheckCircle2, Circle, Clock, Zap, Star, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../api";
import { SectionEmptyState } from "./ui/SectionEmptyState";
import { SwipeableCard } from "./ui/SwipeableCard";
import { useIsMobile } from "./ui/use-mobile";

export function Tasks() {
  const { refreshUser } = useAuth();
  const isMobile = useIsMobile();
  const [tasks, setTasks] = useState<any[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [rewardXP, setRewardXP] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "medium", difficulty: "medium", estimated_time: "1h", deadline: "" });

  useEffect(() => {
    api.tasks.getAll().then(setTasks);
  }, []);

  const toggleTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      setRewardXP(task.xp);
      setShowReward(true);
      setTimeout(() => setShowReward(false), 2000);
    }
    const res = await api.tasks.toggle(id);
    setTasks(tasks.map((t) => (t.id === id ? res.task : t)));
    refreshUser();
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const task = await api.tasks.create(form);
    setTasks([task, ...tasks]);
    setForm({ title: "", priority: "medium", difficulty: "medium", estimated_time: "1h", deadline: "" });
    setShowForm(false);
  };

  const deleteTask = async (id: number) => {
    await api.tasks.delete(id);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 md:space-y-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`mb-1 ${isMobile ? 'text-lg' : ''}`}>Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {activeTasks.length} active • {completedTasks.length} completed
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} bg-primary text-primary-foreground rounded-lg hover:glow transition-all flex items-center gap-2 tap-feedback`}>
          <Plus className="w-4 h-4" />
          {!isMobile && "Add Task"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={createTask}
            className="glass rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className={isMobile ? 'text-sm' : ''}>New Task</h3>
              <button type="button" onClick={() => setShowForm(false)} className="tap-feedback"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title..." required className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none" />
            <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2.5 bg-input rounded-lg border border-border focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Difficulty</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full px-3 py-2.5 bg-input rounded-lg border border-border focus:outline-none">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Est. Time</label>
                <input type="text" value={form.estimated_time} onChange={(e) => setForm({ ...form, estimated_time: e.target.value })} className="w-full px-3 py-2.5 bg-input rounded-lg border border-border focus:outline-none" />
              </div>
            </div>
            <input type="text" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} placeholder="Deadline (e.g., Today, 2:00 PM)" className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none" />
            <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:glow transition-all tap-feedback">Create Task</button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-1 lg:grid-cols-3'}`}>
        <div className="glass rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>High</span>
          </div>
          <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{tasks.filter((t) => t.priority === "high" && !t.completed).length}</p>
        </div>
        <div className="glass rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <Zap className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-accent`} />
            <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>XP</span>
          </div>
          <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-accent`}>{activeTasks.reduce((sum, t) => sum + t.xp, 0)}</p>
        </div>
        <div className="glass rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <Clock className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-orange-500`} />
            <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>Active</span>
          </div>
          <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{activeTasks.length}</p>
        </div>
      </div>

      <div>
        <h3 className={`mb-3 md:mb-4 ${isMobile ? 'text-sm' : ''}`}>Active Tasks</h3>
        <div className="space-y-2 md:space-y-3">
          <AnimatePresence>
            {activeTasks.map((task, index) => (
              <SwipeableCard
                key={task.id}
                onSwipeRight={() => toggleTask(task.id)}
                onSwipeLeft={() => deleteTask(task.id)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-xl p-4 md:p-5 hover:glow-hover cursor-pointer"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <button className="mt-1 flex-shrink-0 tap-feedback" onClick={() => toggleTask(task.id)}>
                      <Circle className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 md:gap-4 mb-2 md:mb-3">
                        <h4 className={`${isMobile ? 'text-sm' : ''} truncate`}>{task.title}</h4>
                        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                          <div className={`px-2 py-0.5 md:py-1 rounded text-xs ${task.priority === "high" ? "bg-red-500/20 text-red-500" : task.priority === "medium" ? "bg-orange-500/20 text-orange-500" : "bg-green-500/20 text-green-500"}`}>
                            {task.priority}
                          </div>
                          {!isMobile && (
                            <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="p-1 rounded hover:bg-red-500/20 transition-colors">
                              <X className="w-3 h-3 text-muted-foreground hover:text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 md:gap-4 text-xs text-muted-foreground ${isMobile ? 'flex-wrap gap-2' : ''}`}>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.estimated_time}</div>
                        <div className="flex items-center gap-1 text-accent"><Zap className="w-3 h-3" />+{task.xp} XP</div>
                        {!isMobile && <div className="ml-auto">{task.deadline}</div>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwipeableCard>
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <SectionEmptyState message="No tasks yet. Add your first task to start earning XP! ⚡" />
          )}
        </div>
      </div>

      {completedTasks.length > 0 && (
        <div>
          <h3 className={`mb-3 md:mb-4 text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Completed</h3>
          <div className="space-y-2 md:space-y-3">
            {completedTasks.map((task) => (
              <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="glass rounded-xl p-4 md:p-5 tap-feedback" onClick={() => toggleTask(task.id)}>
                <div className="flex items-start gap-3 md:gap-4">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className={`line-through text-muted-foreground mb-2 ${isMobile ? 'text-sm' : ''}`}>{task.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 text-green-500"><Zap className="w-3 h-3" />+{task.xp} XP earned</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showReward && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: -50 }} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className={`glass rounded-2xl ${isMobile ? 'p-6' : 'p-8'} text-center glow`}>
              <Star className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} text-accent mx-auto mb-3 md:mb-4`} />
              <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} mb-2`}>Task Complete!</h3>
              <p className={`text-accent ${isMobile ? 'text-lg' : 'text-xl'}`}>+{rewardXP} XP</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
