import { useState, useEffect, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  BookOpen,
  Youtube,
  FileText,
  Tag,
  Plus,
  X,
  Layers,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import * as api from "../api";
import { SmartContextMenu } from "./ui/SmartContextMenu";
import { useToast } from "./ui/Toast";
import { ConfirmDeleteDialog, LargeViewDialog } from "./ui/ItemActionDialogs";
import { useItemContextActions } from "./ui/useItemContextActions";
import { SectionEmptyState } from "./ui/SectionEmptyState";

export function Study() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [settings, setSettings] = useState({ current_cgpa: 0, target_cgpa: 0 });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [scope, setScope] = useState("semester-1");
  const [subjectForm, setSubjectForm] = useState({ name: "", percentage: "" });
  const [resourceForm, setResourceForm] = useState({ title: "", type: "Notes", status: "Not Started", duration: "" });
  const [pinnedIds, setPinnedIds] = useState<Record<string, boolean>>({});
  const [largeView, setLargeView] = useState<{ type: "subject" | "resource" | "note"; item: any } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "subject" | "resource" | "note"; item: any } | null>(null);
  const { showToast } = useToast();
  const buildActions = useItemContextActions();

  useEffect(() => {
    Promise.all([
      api.study.getSubjects(scope),
      api.study.getResources(scope),
      api.study.getNotes(scope),
      api.study.getSettings(scope),
      api.study.getTrend(scope),
    ]).then(([subjectData, resourceData, noteData, settingsData, trend]) => {
      setSubjects(subjectData);
      setResources(resourceData);
      setNotes(noteData);
      setSettings(settingsData || { current_cgpa: 0, target_cgpa: 0 });
      setTrendData(trend);
    });
  }, [scope]);

  const createSubject = async (e: FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;
    const subject = await api.study.createSubject(
      {
        name: subjectForm.name,
        percentage: Number(subjectForm.percentage) || 0,
      },
      scope,
    );
    setSubjects((prev) => [subject, ...prev]);
    setSubjectForm({ name: "", percentage: "" });
    setShowSubjectForm(false);
    const nextTrend = await api.study.getTrend(scope);
    setTrendData(nextTrend);
  };

  const createResource = async (e: FormEvent) => {
    e.preventDefault();
    if (!resourceForm.title.trim()) return;
    const resource = await api.study.createResource(resourceForm, scope);
    setResources([resource, ...resources]);
    setResourceForm({ title: "", type: "Notes", status: "Not Started", duration: "" });
    setShowResourceForm(false);
  };

  const updateTargetCGPA = async (val: string) => {
    const target = parseFloat(val);
    if (!isNaN(target)) {
      setSettings({ ...settings, target_cgpa: target });
      await api.study.updateSettings({ target_cgpa: target }, scope);
    }
  };

  const currentCGPA = settings.current_cgpa;
  const targetCGPA = settings.target_cgpa;

  const togglePin = (key: string) => {
    setPinnedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const duplicateResource = async (resource: any) => {
    const duplicated = await api.study.createResource(
      {
        ...resource,
        title: `${resource.title} (Copy)`,
      },
      scope,
    );
    setResources((prev) => [duplicated, ...prev]);
    showToast({ message: "Resource duplicated", type: "success" });
  };

  const duplicateNote = async (note: any) => {
    const duplicated = await api.study.createNote(
      {
        ...note,
        title: `${note.title} (Copy)`,
      },
      scope,
    );
    setNotes((prev) => [duplicated, ...prev]);
    showToast({ message: "Note duplicated", type: "success" });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setDeleteTarget(null);

    if (target.type === "subject") {
      const previous = subjects;
      setSubjects((prev) => prev.filter((item) => item.id !== target.item.id));
      try {
        await api.study.deleteSubject(target.item.id, scope);
        const nextTrend = await api.study.getTrend(scope);
        setTrendData(nextTrend);
        showToast({
          message: "Subject deleted",
          type: "warning",
          undoAction: () => setSubjects(previous),
        });
      } catch {
        setSubjects(previous);
        showToast({ message: "Could not delete subject", type: "error" });
      }
    }

    if (target.type === "resource") {
      const previous = resources;
      setResources((prev) => prev.filter((item) => item.id !== target.item.id));
      try {
        await api.study.deleteResource(target.item.id, scope);
        showToast({
          message: "Resource deleted",
          type: "warning",
          undoAction: () => setResources(previous),
        });
      } catch {
        setResources(previous);
        showToast({ message: "Could not delete resource", type: "error" });
      }
    }

    if (target.type === "note") {
      const previous = notes;
      setNotes((prev) => prev.filter((item) => item.id !== target.item.id));
      try {
        await api.study.deleteNote(target.item.id, scope);
        showToast({
          message: "Note deleted",
          type: "warning",
          undoAction: () => setNotes(previous),
        });
      } catch {
        setNotes(previous);
        showToast({ message: "Could not delete note", type: "error" });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-1">Study System</h2>
          <p className="text-sm text-muted-foreground">Track your academic progress and resources</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-input border border-border">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="bg-transparent text-sm focus:outline-none">
              <option value="semester-1">Semester 1</option>
              <option value="semester-2">Semester 2</option>
              <option value="semester-3">Semester 3</option>
              <option value="semester-4">Semester 4</option>
              <option value="semester-5">Semester 5</option>
              <option value="semester-6">Semester 6</option>
              <option value="semester-7">Semester 7</option>
              <option value="semester-8">Semester 8</option>
              <option value="self-study">Self Study</option>
            </select>
          </div>
          <button onClick={() => setShowSubjectForm(!showSubjectForm)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:glow transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Subject
          </button>
          <button onClick={() => setShowResourceForm(!showResourceForm)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:glow transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Resource
          </button>
        </div>
      </div>

      {showSubjectForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={createSubject} className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between"><h3>New Subject</h3><button type="button" onClick={() => setShowSubjectForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button></div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="Subject name..." required className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none" />
            <input type="number" value={subjectForm.percentage} onChange={(e) => setSubjectForm({ ...subjectForm, percentage: e.target.value })} placeholder="Current score %" className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none" />
          </div>
          <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:glow transition-all">Add Subject</button>
        </motion.form>
      )}

      {showResourceForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={createResource} className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between"><h3>New Resource</h3><button type="button" onClick={() => setShowResourceForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button></div>
          <input type="text" value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} placeholder="Resource title..." required className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none" />
          <div className="grid grid-cols-3 gap-4">
            <select value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })} className="px-3 py-2 bg-input rounded-lg border border-border">
              <option>YouTube</option><option>PDF</option><option>Course</option><option>Notes</option>
            </select>
            <select value={resourceForm.status} onChange={(e) => setResourceForm({ ...resourceForm, status: e.target.value })} className="px-3 py-2 bg-input rounded-lg border border-border">
              <option>Not Started</option><option>In Progress</option><option>Completed</option>
            </select>
            <input type="text" value={resourceForm.duration} onChange={(e) => setResourceForm({ ...resourceForm, duration: e.target.value })} placeholder="Duration" className="px-3 py-2 bg-input rounded-lg border border-border" />
          </div>
          <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:glow transition-all">Add Resource</button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-6">
          <h3 className="text-sm text-muted-foreground mb-4">Current CGPA</h3>
          <div className="text-center mb-4">
            <p className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{currentCGPA}</p>
            <p className="text-xs text-muted-foreground mt-2">Out of 4.0</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Target</span><span className="font-bold">{targetCGPA}</span></div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${targetCGPA > 0 ? (currentCGPA / targetCGPA) * 100 : 0}%` }} transition={{ duration: 1, delay: 0.3 }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent" />
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" />Performance Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "rgba(20, 20, 35, 0.9)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#06b6d4", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <SectionEmptyState message="No performance data yet for this section." />
          )}
        </div>
      </div>

      {subjects.length > 0 && (
        <div>
          <h3 className="mb-4">Subject Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject, index) => {
            const pinKey = `subject-${subject.id}`;
            return (
              <SmartContextMenu
                key={subject.id}
                actions={buildActions({
                  section: "study",
                  isPinned: !!pinnedIds[pinKey],
                  onOpenLargeView: () => setLargeView({ type: "subject", item: subject }),
                  onEdit: () => showToast({ message: "Subject editor coming soon", type: "default" }),
                  editLabel: "Edit Subject",
                  aiEdit: true,
                  onTogglePin: () => togglePin(pinKey),
                  onDelete: () => setDeleteTarget({ type: "subject", item: subject }),
                })}
              >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass rounded-xl p-5 cursor-default">
                  <div className="flex items-center justify-between mb-3">
                    <h4>{subject.name}</h4>
                    {subject.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="mb-3">
                    <div className="flex items-end gap-1 mb-2"><span className="text-3xl font-bold">{subject.percentage}</span><span className="text-muted-foreground mb-1">%</span></div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${subject.percentage}%` }} transition={{ duration: 1, delay: 0.2 + index * 0.05 }} className={`absolute inset-y-0 left-0 ${subject.color}`} />
                    </div>
                  </div>
                </motion.div>
              </SmartContextMenu>
            );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="mb-4">Study Resources</h3>
          <div className="space-y-3">
            {resources.map((resource, index) => {
              const pinKey = `resource-${resource.id}`;
              return (
                <SmartContextMenu
                  key={resource.id}
                  actions={buildActions({
                    section: "study",
                    isPinned: !!pinnedIds[pinKey],
                    onOpenLargeView: () => setLargeView({ type: "resource", item: resource }),
                    onDuplicate: () => duplicateResource(resource),
                    onTogglePin: () => togglePin(pinKey),
                    onDelete: () => setDeleteTarget({ type: "resource", item: resource }),
                  })}
                >
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="glass rounded-xl p-4 hover:glow-hover cursor-default">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        {resource.type === "YouTube" ? <Youtube className="w-5 h-5 text-red-500" /> : resource.type === "PDF" ? <FileText className="w-5 h-5 text-blue-500" /> : <BookOpen className="w-5 h-5 text-green-500" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1">{resource.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{resource.type}</span><span>•</span><span>{resource.duration}</span>
                          <span className={`ml-auto px-2 py-1 rounded ${resource.status === "Completed" ? "bg-green-500/20 text-green-500" : resource.status === "In Progress" ? "bg-blue-500/20 text-blue-500" : "bg-muted/50 text-muted-foreground"}`}>{resource.status}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </SmartContextMenu>
              );
            })}
            {resources.length === 0 && (
              <SectionEmptyState message="No resources yet. Add YouTube videos, PDFs, courses, or notes." />
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-4">Recent Notes</h3>
          <div className="space-y-3">
            {notes.map((note, index) => {
              const pinKey = `note-${note.id}`;
              return (
                <SmartContextMenu
                  key={note.id}
                  actions={buildActions({
                    section: "study",
                    isPinned: !!pinnedIds[pinKey],
                    onOpenLargeView: () => setLargeView({ type: "note", item: note }),
                    onDuplicate: () => duplicateNote(note),
                    onTogglePin: () => togglePin(pinKey),
                    onDelete: () => setDeleteTarget({ type: "note", item: note }),
                  })}
                >
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="glass rounded-xl p-4 hover:glow-hover cursor-default">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="flex-1">{note.title}</h4>
                      <span className="text-xs text-muted-foreground">{note.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      {(note.tags || []).map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{tag}</span>
                      ))}
                    </div>
                  </motion.div>
                </SmartContextMenu>
              );
            })}
            {notes.length === 0 && (
              <SectionEmptyState message="No notes yet. Create notes for your study sessions." />
            )}
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
        <h3 className="mb-4">CGPA Advisor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Target CGPA</label>
            <input type="number" step="0.01" value={targetCGPA} onChange={(e) => updateTargetCGPA(e.target.value)} className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none" />
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:glow transition-all">Calculate Required Marks</button>
          </div>
        </div>
        {targetCGPA > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm">
              <span className="text-accent font-bold">Target Analysis:</span> To achieve {targetCGPA} CGPA, you need an average of {Math.round((targetCGPA / 4.0) * 100)}% in remaining subjects.
            </p>
          </motion.div>
        )}
      </motion.div>

      <LargeViewDialog
        open={!!largeView}
        onOpenChange={(open) => !open && setLargeView(null)}
        title={largeView?.item?.title || largeView?.item?.name || "Large View"}
        description="Focus mode for detailed review, quick edits, and AI-ready insights."
        details={largeView?.item || {}}
        insight="AI suggestion: prioritize this item based on completion trend, recent activity, and relevance to your target CGPA."
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete item?"
        description={`This action will remove ${deleteTarget?.item?.title || deleteTarget?.item?.name || "this item"}. You can undo from the toast.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
