import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Smile, Frown, Meh, Calendar, Zap } from "lucide-react";
import * as api from "../api";
import { SmartContextMenu } from "./ui/SmartContextMenu";
import { useToast } from "./ui/Toast";
import { ConfirmDeleteDialog, LargeViewDialog } from "./ui/ItemActionDialogs";
import { useItemContextActions } from "./ui/useItemContextActions";
import { useIsMobile } from "./ui/use-mobile";

export function Diary() {
  const isMobile = useIsMobile();
  const [entries, setEntries] = useState<any[]>([]);
  const [mood, setMood] = useState("neutral");
  const [energy, setEnergy] = useState(7);
  const [productivity, setProductivity] = useState(8);
  const [content, setContent] = useState("");
  const [pinnedIds, setPinnedIds] = useState<Record<string, boolean>>({});
  const [largeView, setLargeView] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const { showToast } = useToast();
  const buildActions = useItemContextActions();

  useEffect(() => {
    api.diary.getAll().then(setEntries);
  }, []);

  const saveEntry = async () => {
    if (!content.trim()) return;
    const entry = await api.diary.create({ mood, energy, productivity, content });
    setEntries([entry, ...entries]);
    setContent("");
    setMood("neutral");
    setEnergy(7);
    setProductivity(8);
  };

  const togglePin = (key: string) => setPinnedIds((prev) => ({ ...prev, [key]: !prev[key] }));

  const duplicateEntry = async (entry: any) => {
    const copy = await api.diary.create({
      mood: entry.mood,
      energy: entry.energy,
      productivity: entry.productivity,
      content: `${entry.content}\n\n(duplicate)`,
    });
    setEntries((prev) => [copy, ...prev]);
    showToast({ message: "Entry duplicated", type: "success" });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    const previous = entries;
    setEntries((prev) => prev.filter((item) => item.id !== target.id));
    try {
      await api.diary.delete(target.id);
      showToast({
        message: "Entry deleted",
        type: "warning",
        undoAction: () => setEntries(previous),
      });
    } catch {
      setEntries(previous);
      showToast({ message: "Could not delete entry", type: "error" });
    }
  };

  const getMoodIcon = (m: string) => {
    switch (m) {
      case "happy": return <Smile className="w-6 h-6 text-green-500" />;
      case "sad": return <Frown className="w-6 h-6 text-red-500" />;
      default: return <Meh className="w-6 h-6 text-orange-500" />;
    }
  };

  const getMoodColor = (m: string) => {
    switch (m) {
      case "happy": return "border-green-500/50 bg-green-500/10";
      case "sad": return "border-red-500/50 bg-red-500/10";
      default: return "border-orange-500/50 bg-orange-500/10";
    }
  };

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 md:space-y-6 max-w-4xl mx-auto`}>
      <div className="flex items-center justify-between">
        <div><h2 className={`mb-1 ${isMobile ? 'text-lg' : ''}`}>Daily Diary</h2><p className="text-sm text-muted-foreground">Reflect on your day and track your mood</p></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <h3 className="mb-4">Today's Entry</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-muted-foreground mb-3">How are you feeling?</label>
            <div className="flex gap-4">
              {[
                { m: "happy", icon: Smile, label: "Happy", color: "green" },
                { m: "neutral", icon: Meh, label: "Neutral", color: "orange" },
                { m: "sad", icon: Frown, label: "Sad", color: "red" },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = mood === item.m;
                return (
                  <button key={item.m} onClick={() => setMood(item.m)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${isSelected ? `border-${item.color}-500 bg-${item.color}-500/20` : `border-${item.color}-500/30 hover:border-${item.color}-500/50 hover:bg-${item.color}-500/10`}`}>
                    <Icon className={`w-8 h-8 text-${item.color}-500 mx-auto mb-2`} />
                    <p className="text-sm text-center">{item.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-3">Energy Level</label>
            <div className="flex items-center gap-4">
              <Zap className="w-5 h-5 text-orange-500" />
              <input type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(parseInt(e.target.value))} className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
              <span className="text-sm font-bold w-8 text-center">{energy}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-3">Productivity Rating</label>
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-blue-500" />
              <input type="range" min="1" max="10" value={productivity} onChange={(e) => setProductivity(parseInt(e.target.value))} className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
              <span className="text-sm font-bold w-8 text-center">{productivity}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-3">What happened today?</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write about your day..." rows={4} className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none resize-none" />
          </div>
          <button onClick={saveEntry} className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:glow transition-all">Save Entry</button>
        </div>
      </motion.div>

      <div>
        <h3 className="mb-4">Past Entries</h3>
        <div className="space-y-4">
          {entries.map((entry, index) => {
            const pinKey = `diary-entry-${entry.id}`;
            return (
              <SmartContextMenu
                key={entry.id}
                actions={buildActions({
                  section: "diary",
                  isPinned: !!pinnedIds[pinKey],
                  onOpenLargeView: () => setLargeView(entry),
                  onEdit: () => showToast({ message: "Entry editor coming soon", type: "default" }),
                  editLabel: "Edit Entry",
                  aiEdit: true,
                  onDuplicate: () => duplicateEntry(entry),
                  onTogglePin: () => togglePin(pinKey),
                  onDelete: () => setDeleteTarget(entry),
                })}
              >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}
                  className={`glass rounded-2xl p-6 border-2 cursor-default ${getMoodColor(entry.mood)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getMoodIcon(entry.mood)}
                      <div><h4>{entry.date}</h4><p className="text-xs text-muted-foreground">Energy: {entry.energy}/10 • Productivity: {entry.productivity}/10</p></div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{entry.content}</p>
                </motion.div>
              </SmartContextMenu>
            );
          })}
          {entries.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No diary entries yet. Write your first one above!</p>}
        </div>
      </div>

      <LargeViewDialog
        open={!!largeView}
        onOpenChange={(open) => !open && setLargeView(null)}
        title="Diary Focus View"
        description="Distraction-free entry view with deep reflection and AI-ready prompts."
        details={largeView || {}}
        insight="AI suggestion: recurring mood/energy patterns suggest adding a short evening reflection ritual."
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete diary entry?"
        description="This action will remove this entry. You can undo from the toast."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
