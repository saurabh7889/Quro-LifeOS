import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Mail, Calendar, Target, Edit3, Save, X, Trash2, AlertTriangle,
  CheckCircle, Trophy, Flame, Sparkles, TrendingUp, FolderKanban, CheckSquare, Camera
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../api";
import { useToast } from "./ui/Toast";
import { useIsMobile } from "./ui/use-mobile";

export function Profile() {
  const { user, updateUser, deleteAccount, logout } = useAuth();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dashStats, setDashStats] = useState({ totalTasks: 0, completedTasks: 0, totalHabits: 0, completedHabits: 0, totalProjects: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    date_of_birth: "",
    goals: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        date_of_birth: user.date_of_birth || "",
        goals: user.goals || "",
        avatar_url: user.avatar_url || "",
      });
    }
    api.user.getDashboardStats().then(setDashStats).catch(() => {});
  }, [user]);

  if (!user) return null;

  const profileFields = [
    { key: "name", label: "Full Name", filled: !!user.name },
    { key: "username", label: "Username", filled: !!user.username },
    { key: "bio", label: "Bio", filled: !!user.bio },
    { key: "date_of_birth", label: "Date of Birth", filled: !!user.date_of_birth },
    { key: "goals", label: "Goals / Interests", filled: !!user.goals },
  ];

  const filledCount = profileFields.filter((f) => f.filled).length;
  const completionPercent = Math.round((filledCount / profileFields.length) * 100);
  const isComplete = completionPercent === 100;

  const handleSave = async () => {
    try {
      const updated = await api.user.updateProfile(form);
      updateUser(updated);
      setEditing(false);
      showToast({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      showToast({ message: "Failed to update profile", type: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount();
      showToast({ message: "Account deleted", type: "default" });
    } catch (err) {
      showToast({ message: "Failed to delete account", type: "error" });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showToast({ message: "Image must be less than 2MB", type: "warning" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, avatar_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Parse goals into array for tags display
  const goalsArray = user.goals ? user.goals.split(",").map(g => g.trim()).filter(Boolean) : [];

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 md:space-y-6 max-w-4xl mx-auto`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="mb-1">Profile Overview</h2>
          <p className="text-sm text-muted-foreground">Manage your personal information and preferences.</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="px-5 py-2.5 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all flex items-center gap-2 text-sm font-medium">
            <Edit3 className="w-4 h-4" />Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2 text-sm font-bold">
              <Save className="w-4 h-4" />Save Changes
            </button>
            <button onClick={() => {
              setEditing(false);
              setForm({
                name: user.name || "",
                username: user.username || "",
                bio: user.bio || "",
                date_of_birth: user.date_of_birth || "",
                goals: user.goals || "",
                avatar_url: user.avatar_url || "",
              });
            }} className="px-5 py-2.5 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm">
              <X className="w-4 h-4" />Cancel
            </button>
          </div>
        )}
      </div>

      {/* Completion Indicator */}
      {!isComplete && !editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Profile Completion: {completionPercent}%
            </h4>
            <p className="text-xs text-muted-foreground">Complete your profile to unlock full tracking features!</p>
          </div>
          <div className="flex-1 max-w-sm">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}

      <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        {/* Left Column: Basic Info & Avatar */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-6 relative overflow-hidden text-center flex flex-col items-center">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-primary/20 to-accent/20" />
            
            <div className="relative mt-8 mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-card bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden shadow-xl z-10 relative">
                {(editing ? form.avatar_url : user.avatar_url) ? (
                  <img src={editing ? form.avatar_url : user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                )}
                
                {editing && (
                  <div 
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] text-white">Upload</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <h3 className="text-xl font-bold">{user.name}</h3>
            {user.username && <p className="text-sm font-medium text-primary">@{user.username}</p>}
            
            {user.bio && !editing && (
              <p className="text-sm text-muted-foreground mt-4 italic">"{user.bio}"</p>
            )}
          </motion.div>

          {/* Profile Stats Mini Dashboard */}
          {isComplete && !editing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 space-y-3">
              <h4 className="font-bold flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-accent" /> Lifetime Stats
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Streak</p>
                    <p className="font-bold text-sm">{user.streak} Days</p>
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Level</p>
                    <p className="font-bold text-sm">{user.level}</p>
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Tasks</p>
                    <p className="font-bold text-sm">{dashStats.totalTasks}</p>
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
                  <FolderKanban className="w-5 h-5 text-violet-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Projects</p>
                    <p className="font-bold text-sm">{dashStats.totalProjects}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Editable Details */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
            <h4 className="font-bold mb-6 flex items-center gap-2 border-b border-border pb-3">
              <User className="w-5 h-5 text-primary" /> Personal Details
            </h4>
            
            <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                {editing ? (
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-input/50 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-sm" placeholder="e.g. Satoshi Nakamoto" />
                ) : (
                  <div className="px-4 py-2.5 bg-transparent border border-transparent text-sm font-medium">{user.name}</div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email Address (Read-only)</label>
                <div className="px-4 py-2.5 bg-muted/20 border border-border/50 rounded-xl text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 opacity-50" /> {user.email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Username</label>
                {editing ? (
                  <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-4 py-2.5 bg-input/50 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-sm" placeholder="e.g. satoshi" />
                ) : (
                  <div className="px-4 py-2.5 bg-transparent border border-transparent text-sm font-medium">{user.username ? `@${user.username}` : <span className="text-muted-foreground italic">Not set</span>}</div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
                {editing ? (
                  <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="w-full px-4 py-2.5 bg-input/50 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-sm" />
                ) : (
                  <div className="px-4 py-2.5 bg-transparent border border-transparent text-sm font-medium flex items-center gap-2">
                    {user.date_of_birth ? <><Calendar className="w-4 h-4 text-primary" /> {user.date_of_birth}</> : <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Bio</label>
                {editing ? (
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full px-4 py-3 bg-input/50 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-sm resize-none" placeholder="A short blurb about who you are..." rows={3} />
                ) : (
                  <div className="px-4 py-2.5 bg-transparent border border-transparent text-sm">{user.bio || <span className="text-muted-foreground italic">No bio provided.</span>}</div>
                )}
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Goals & Interests</label>
                {editing ? (
                  <>
                    <input value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} className="w-full px-4 py-2.5 bg-input/50 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-sm mb-2" placeholder="e.g. Web Development, Reading, Running (comma separated)" />
                    <p className="text-[10px] text-muted-foreground px-2">Separate multiple interests with commas.</p>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-2 px-2">
                    {goalsArray.length > 0 ? goalsArray.map((g, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">{g}</span>
                    )) : <span className="text-muted-foreground italic text-sm">No goals or interests added yet.</span>}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 border border-red-500/10">
            <h4 className="font-bold mb-2 text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Account Deletion
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action is irreversible.
            </p>
            <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto border border-red-500/20">
              <Trash2 className="w-4 h-4" /> Delete Account Permanently
            </button>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass rounded-2xl p-6 max-w-sm w-full border border-red-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center text-center space-y-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Are you absolutely sure?</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will permanently delete your account, including all your tasks, habits, projects, and financial records.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={handleDelete} className="w-full py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  Yes, delete everything
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm font-medium">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
