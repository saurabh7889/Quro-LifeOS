import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCw, Wallet, Heart, BookMarked, Film,
  BarChart3, Trophy, FolderKanban, Shield, Settings2,
  User, LogOut, Flame, Coins, X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface MobileMoreDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  isAdmin?: boolean;
}

const drawerItems = [
  { id: "habits", label: "Habits", icon: RefreshCw },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "health", label: "Health & Fitness", icon: Heart },
  { id: "diary", label: "Diary", icon: BookMarked },
  { id: "entertainment", label: "Entertainment", icon: Film },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "lifemeter", label: "Life Meter", icon: Trophy },
];

export function MobileMoreDrawer({ open, onClose, onNavigate, isAdmin }: MobileMoreDrawerProps) {
  const { user, logout } = useAuth();

  const handleNav = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-drawer-overlay"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mobile-drawer"
          >
            {/* Handle */}
            <div className="mobile-drawer-handle" />

            {/* User Info */}
            {user && (
              <div className="px-5 pb-4 pt-2 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-xs">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>{user.streak} days</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Trophy className="w-3.5 h-3.5 text-primary" />
                    <span>Lv {user.level}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-accent">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{user.coins?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <div className="p-3 space-y-1">
              {drawerItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleNav(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors tap-feedback"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">{item.label}</span>
                  </motion.button>
                );
              })}

              {isAdmin && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => handleNav("admin")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors tap-feedback"
                >
                  <Shield className="w-5 h-5 text-amber-500" />
                  <span className="text-sm">Admin</span>
                </motion.button>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-border space-y-1">
              <button
                onClick={() => handleNav("profile")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors tap-feedback"
              >
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Profile</span>
              </button>
              <button
                onClick={() => handleNav("settings")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors tap-feedback"
              >
                <Settings2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Settings</span>
              </button>
              <button
                onClick={() => { logout(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors tap-feedback text-red-500"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
