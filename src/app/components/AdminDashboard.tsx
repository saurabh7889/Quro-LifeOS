import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Users, Trash2, Search, CheckSquare, RefreshCw, FolderKanban, AlertTriangle, X, UserCheck, Crown } from "lucide-react";
import * as api from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./ui/Toast";
import { useIsMobile } from "./ui/use-mobile";

export function AdminDashboard() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalTasks: 0, totalHabits: 0, totalProjects: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      showToast({ message: "Failed to load admin data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    try {
      await api.admin.deleteUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      showToast({ message: `User "${target.name}" deleted successfully`, type: "success" });
    } catch (err: any) {
      showToast({ message: err.message || "Failed to delete user", type: "error" });
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "from-indigo-500 to-purple-500" },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow animate-pulse">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <p className="text-muted-foreground text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 md:space-y-6`}>
      <div className={`flex ${isMobile ? 'flex-col gap-3 items-start' : 'items-center justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`mb-0 ${isMobile ? 'text-lg' : ''}`}>Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground">Manage users and monitor platform activity</p>
          </div>
        </div>
        <button onClick={loadData} className={`${isMobile ? 'w-full justify-center' : ''} px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors flex items-center gap-2 text-sm tap-feedback`}>
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="glass rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <h3 className="text-2xl font-bold">{card.value}</h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* User Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`glass rounded-2xl ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'} mb-6`}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3>User Management</h3>
            <span className="text-xs text-muted-foreground ml-2">({filtered.length} users)</span>
          </div>
          <div className={`relative ${isMobile ? 'w-full' : 'w-64'}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input rounded-lg border border-border focus:border-primary focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border mb-2">
          <span>Name</span>
          <span>Email</span>
          <span>Level</span>
          <span>XP</span>
          <span>Streak</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>

        {/* User Rows */}
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          <AnimatePresence>
            {filtered.map((u, index) => {
              const isSelf = u.id === user?.id;
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.02 }}
                  className={`grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 rounded-lg items-center transition-colors ${isSelf ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5"}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isSelf ? "bg-gradient-to-br from-primary to-accent" : "bg-gradient-to-br from-gray-500 to-gray-700"}`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">{u.name}</span>
                      {isSelf && <UserCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground truncate">{u.email}</span>
                  <span className="text-sm font-bold">{u.level}</span>
                  <span className="text-sm">{u.xp.toLocaleString()}</span>
                  <span className="text-sm">{u.streak} days</span>
                  <span className="text-xs text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</span>
                  <div>
                    {isSelf ? (
                      <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-bold">You</span>
                    ) : (
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors group"
                        title={`Delete ${u.name}`}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {searchQuery ? "No users matching your search" : "No users found"}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass rounded-2xl p-6 max-w-md w-full mx-4 border border-red-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Delete User</h3>
                  <p className="text-xs text-muted-foreground">This action is irreversible</p>
                </div>
                <button onClick={() => setDeleteTarget(null)} className="ml-auto p-1 rounded hover:bg-white/10">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="glass rounded-xl p-4 mb-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-sm font-bold text-white">
                    {deleteTarget.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{deleteTarget.name}</p>
                    <p className="text-xs text-muted-foreground">{deleteTarget.email}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                All data for <strong className="text-foreground">{deleteTarget.name}</strong> will be permanently deleted, including tasks, habits, study data, finances, and more.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm">
                  Cancel
                </button>
                <button onClick={handleDeleteUser} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />Delete User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
