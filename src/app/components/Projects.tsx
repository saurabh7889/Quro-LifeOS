import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, CheckCircle2, Circle, Calendar, X } from "lucide-react";
import * as api from "../api";
import { SectionEmptyState } from "./ui/SectionEmptyState";
import { useIsMobile } from "./ui/use-mobile";

export function Projects() {
  const isMobile = useIsMobile();
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", deadline: "", milestones: "" });

  useEffect(() => {
    api.projects.getAll().then(setProjects);
  }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const milestones = form.milestones.split(",").map((m) => m.trim()).filter(Boolean);
    const project = await api.projects.create({ name: form.name, deadline: form.deadline, milestones });
    setProjects([project, ...projects]);
    setForm({ name: "", deadline: "", milestones: "" });
    setShowForm(false);
  };

  const toggleMilestone = async (projectId: number, milestoneId: number) => {
    const updated = await api.projects.toggleMilestone(projectId, milestoneId);
    setProjects(projects.map((p) => (p.id === projectId ? updated : p)));
  };

  const deleteProject = async (id: number) => {
    await api.projects.delete(id);
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 md:space-y-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`mb-1 ${isMobile ? 'text-lg' : ''}`}>Projects</h2>
          <p className="text-sm text-muted-foreground">
            {projects.filter((p) => p.status === "In Progress").length} active •{" "}
            {projects.filter((p) => p.status === "Completed").length} completed
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} bg-primary text-primary-foreground rounded-lg hover:glow transition-all flex items-center gap-2 tap-feedback`}>
          <Plus className="w-4 h-4" />{isMobile ? 'Add' : 'New Project'}
        </button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={createProject} className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between"><h3>New Project</h3><button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button></div>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project name..." required className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none" />
          <input type="text" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} placeholder="Deadline (e.g., May 10, 2026)" className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:outline-none" />
          <input type="text" value={form.milestones} onChange={(e) => setForm({ ...form, milestones: e.target.value })} placeholder="Milestones (comma-separated)" className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:outline-none" />
          <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:glow transition-all">Create Project</button>
        </motion.form>
      )}

      <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-1 lg:grid-cols-3'}`}>
        <div className="glass rounded-xl p-3 md:p-4"><p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 text-center md:text-left">Total Projects</p><p className="text-xl md:text-3xl font-bold text-center md:text-left">{projects.length}</p></div>
        <div className="glass rounded-xl p-3 md:p-4"><p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 text-center md:text-left">In Progress</p><p className="text-xl md:text-3xl font-bold text-blue-500 text-center md:text-left">{projects.filter((p) => p.status === "In Progress").length}</p></div>
        <div className="glass rounded-xl p-3 md:p-4"><p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 text-center md:text-left">Completed</p><p className="text-xl md:text-3xl font-bold text-green-500 text-center md:text-left">{projects.filter((p) => p.status === "Completed").length}</p></div>
      </div>

      <div className="space-y-4">
        {projects.length === 0 && (
          <div className="glass rounded-2xl p-6">
            <SectionEmptyState message="No projects yet. Create your first project with milestones to track progress! 🚀" />
          </div>
        )}
        {projects.map((project, index) => (
          <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="glass rounded-2xl p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="mb-2">{project.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{project.deadline}</div>
                  <span className={`px-2 py-1 rounded text-xs ${project.status === "Completed" ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-500"}`}>{project.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl md:text-3xl font-bold text-primary">{project.progress}%</p>
                <button onClick={() => deleteProject(project.id)} className="p-1 rounded hover:bg-red-500/20"><X className="w-4 h-4 text-muted-foreground hover:text-red-500" /></button>
              </div>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-4">
              <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 1, delay: 0.3 + index * 0.1 }} className={`absolute inset-y-0 left-0 ${project.status === "Completed" ? "bg-green-500" : "bg-gradient-to-r from-primary to-accent"}`} />
            </div>
            <div>
              <h4 className="text-sm mb-3">Milestones</h4>
              <div className="space-y-2">
                {(project.milestones || []).map((milestone: any, i: number) => (
                  <motion.div key={milestone.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.1 + i * 0.05 }}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer tap-feedback" onClick={() => toggleMilestone(project.id, milestone.id)}>
                    {milestone.completed ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                    <span className={`text-sm ${milestone.completed ? "line-through text-muted-foreground" : ""}`}>{milestone.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
