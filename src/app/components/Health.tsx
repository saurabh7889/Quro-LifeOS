import React, { useState, useEffect, type FormEvent } from "react";
import { motion } from "motion/react";
import { Activity, Heart, Footprints, Flame, Plus, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import * as api from "../api";
import { SmartContextMenu } from "./ui/SmartContextMenu";
import { useToast } from "./ui/Toast";
import { ConfirmDeleteDialog, LargeViewDialog } from "./ui/ItemActionDialogs";
import { useItemContextActions } from "./ui/useItemContextActions";
import { SectionEmptyState } from "./ui/SectionEmptyState";

export function Health() {
  const [metrics, setMetrics] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", duration: "", calories: "" });
  const [pinnedIds, setPinnedIds] = useState<Record<string, boolean>>({});
  const [largeView, setLargeView] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const { showToast } = useToast();
  const buildActions = useItemContextActions();

  useEffect(() => {
    api.health.getMetrics().then(setMetrics);
    api.health.getWorkouts().then(setWorkouts);
  }, []);

  const createWorkout = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const workout = await api.health.createWorkout({ name: form.name, duration: form.duration, calories: parseInt(form.calories) || 0 });
    setWorkouts([workout, ...workouts]);
    setForm({ name: "", duration: "", calories: "" });
    setShowForm(false);
    api.health.getMetrics().then(setMetrics);
  };

  const togglePin = (key: string) => setPinnedIds((prev) => ({ ...prev, [key]: !prev[key] }));

  const duplicateWorkout = async (workout: any) => {
    const copy = await api.health.createWorkout({
      name: `${workout.name} (Copy)`,
      duration: workout.duration,
      calories: workout.calories,
    });
    setWorkouts((prev) => [copy, ...prev]);
    api.health.getMetrics().then(setMetrics);
    showToast({ message: "Workout duplicated", type: "success" });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    const previous = workouts;
    setWorkouts((prev) => prev.filter((item) => item.id !== target.id));
    try {
      await api.health.deleteWorkout(target.id);
      api.health.getMetrics().then(setMetrics);
      showToast({
        message: "Workout deleted",
        type: "warning",
        undoAction: () => setWorkouts(previous),
      });
    } catch {
      setWorkouts(previous);
      showToast({ message: "Could not delete workout", type: "error" });
    }
  };

  if (!metrics) return <div className="p-6"><p className="text-muted-foreground">Loading...</p></div>;

  const stepsPercent = Math.round(metrics.stepGoal > 0 ? (metrics.todaySteps / metrics.stepGoal) * 100 : 0);
  const hasHealthData = workouts.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="mb-1">Health & Fitness</h2><p className="text-sm text-muted-foreground">Track your physical activity and wellness</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:glow transition-all flex items-center gap-2"><Plus className="w-4 h-4" />Log Workout</button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={createWorkout} className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between"><h3>Log Workout</h3><button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button></div>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Workout name..." required className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Duration (e.g., 45 min)" className="px-3 py-2 bg-input rounded-lg border border-border" />
            <input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="Calories burned" className="px-3 py-2 bg-input rounded-lg border border-border" />
          </div>
          <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:glow transition-all">Log Workout</button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center"><Heart className="w-5 h-5 text-green-500" /></div><div><p className="text-xs text-muted-foreground">Fitness Score</p><h3 className="font-bold">{metrics.fitnessScore}/100</h3></div></div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${metrics.fitnessScore}%` }} transition={{ duration: 1, delay: 0.3 }} className="absolute inset-y-0 left-0 bg-green-500" /></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Footprints className="w-5 h-5 text-blue-500" /></div><div><p className="text-xs text-muted-foreground">Steps Today</p><h3 className="font-bold">{metrics.todaySteps.toLocaleString()}</h3></div></div>
          <p className="text-xs text-muted-foreground">Goal: {metrics.stepGoal.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center"><Flame className="w-5 h-5 text-orange-500" /></div><div><p className="text-xs text-muted-foreground">Calories Burned</p><h3 className="font-bold">{metrics.caloriesBurned}</h3></div></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"><Activity className="w-5 h-5 text-purple-500" /></div><div><p className="text-xs text-muted-foreground">Workouts</p><h3 className="font-bold">{metrics.workoutsThisWeek} this week</h3></div></div>
          <p className="text-xs text-muted-foreground">Target: 5/week</p>
        </motion.div>
      </div>

      {hasHealthData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-1 glass rounded-2xl p-6">
          <h3 className="text-sm text-muted-foreground mb-4">Steps Progress</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="12" fill="none" />
                <motion.circle cx="80" cy="80" r="70" stroke="#3b82f6" strokeWidth="12" fill="none" strokeLinecap="round"
                  initial={{ strokeDasharray: "440", strokeDashoffset: 440 }} animate={{ strokeDashoffset: 440 - (440 * Math.min(1, metrics.todaySteps / metrics.stepGoal)) }} transition={{ duration: 1.5, ease: "easeOut" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-blue-500">{stepsPercent}%</span>
                <span className="text-xs text-muted-foreground mt-1">of goal</span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">{Math.max(0, metrics.stepGoal - metrics.todaySteps).toLocaleString()} steps to go</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.activityData}>
              <defs><linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
              <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "rgba(20, 20, 35, 0.9)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="steps" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#stepsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
        <h3 className="mb-4">Recent Workouts</h3>
        <div className="space-y-3">
          {workouts.map((workout, i) => {
            const pinKey = `health-workout-${workout.id}`;
            return (
              <SmartContextMenu
                key={workout.id}
                actions={buildActions({
                  section: "health",
                  isPinned: !!pinnedIds[pinKey],
                  onOpenLargeView: () => setLargeView(workout),
                  onEdit: () => showToast({ message: "Workout editor coming soon", type: "default" }),
                  editLabel: "Edit Workout",
                  aiEdit: true,
                  onDuplicate: () => duplicateWorkout(workout),
                  onTogglePin: () => togglePin(pinKey),
                  onDelete: () => setDeleteTarget(workout),
                })}
              >
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.05 }} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-default transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center"><Activity className="w-6 h-6 text-primary" /></div>
                    <div><h4 className="mb-1">{workout.name}</h4><p className="text-xs text-muted-foreground">{workout.date}</p></div>
                  </div>
                  <div className="text-right"><p className="text-sm font-bold">{workout.duration}</p><p className="text-xs text-orange-500">{workout.calories} cal</p></div>
                </motion.div>
              </SmartContextMenu>
            );
          })}
          {workouts.length === 0 && <SectionEmptyState message="No workouts logged yet. Log your first workout to unlock health visualizations." className="py-4" />}
        </div>
      </motion.div>

      <LargeViewDialog
        open={!!largeView}
        onOpenChange={(open) => !open && setLargeView(null)}
        title={largeView?.name || "Workout Details"}
        description="Focused workout view with metrics, editing space, and AI suggestions."
        details={largeView || {}}
        insight="AI suggestion: this workout pattern can improve consistency if scheduled near your peak energy window."
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete workout?"
        description={`This action will remove ${deleteTarget?.name || "this workout"}. You can undo from the toast.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
