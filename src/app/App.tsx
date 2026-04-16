import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  CheckSquare,
  RefreshCw,
  BookOpen,
  FolderKanban,
  Wallet,
  Heart,
  BookMarked,
  Film,
  BarChart3,
  Brain,
  Search,
  Bell,
  User,
  Flame,
  Trophy,
  Coins,
  LogOut,
  Shield,
  Moon,
  Sun,
  Settings2,
  ChevronDown,
} from "lucide-react";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Tasks } from "./components/Tasks";
import { Habits } from "./components/Habits";
import { Study } from "./components/Study";
import { Projects } from "./components/Projects";
import { Finance } from "./components/Finance";
import { Health } from "./components/Health";
import { Diary } from "./components/Diary";
import { Entertainment } from "./components/Entertainment";
import { Analytics } from "./components/Analytics";
import { QuroAI } from "./components/QuroAI";
import { LifeMeter } from "./components/LifeMeter";
import { AdminDashboard } from "./components/AdminDashboard";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { ToastProvider } from "./components/ui/Toast";
import { useIsMobile } from "./components/ui/use-mobile";
import { MobileBottomNav } from "./components/ui/MobileBottomNav";
import { MobileFAB } from "./components/ui/MobileFAB";
import { MobileHeader } from "./components/ui/MobileHeader";
import { MobileMoreDrawer } from "./components/ui/MobileMoreDrawer";
import * as api from "./api";

function AppContent() {
  const { user, loading, logout, refreshUser, isAdmin } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const isMobile = useIsMobile();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showProfileMenu && !target.closest("[data-profile-menu]")) setShowProfileMenu(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showProfileMenu]);

  useEffect(() => {
    const saved = localStorage.getItem("quro_theme");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      api.notifications.getAll().then(setNotifs).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timer = setTimeout(() => {
        api.search.query(searchQuery).then(setSearchResults).catch(console.error);
        setShowSearch(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow animate-pulse">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <p className="text-muted-foreground text-sm">Loading QURO...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "habits", label: "Habits", icon: RefreshCw },
    { id: "study", label: "Study", icon: BookOpen },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "finance", label: "Finance", icon: Wallet },
    { id: "health", label: "Health", icon: Heart },
    { id: "diary", label: "Diary", icon: BookMarked },
    { id: "entertainment", label: "Entertainment", icon: Film },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "lifemeter", label: "Life Meter", icon: Trophy },
    { id: "quro", label: "QURO AI", icon: Brain },
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Shield }] : []),
  ];

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
        return <Tasks />;
      case "habits":
        return <Habits />;
      case "study":
        return <Study />;
      case "projects":
        return <Projects />;
      case "finance":
        return <Finance />;
      case "health":
        return <Health />;
      case "diary":
        return <Diary />;
      case "entertainment":
        return <Entertainment />;
      case "analytics":
        return <Analytics />;
      case "lifemeter":
        return <LifeMeter />;
      case "quro":
        return <QuroAI />;
      case "admin":
        return isAdmin ? <AdminDashboard /> : <Dashboard />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings onNavigate={setActiveView} />;
      default:
        return <Dashboard />;
    }
  };

  const xpForNextLevel = (user.level) * 1000;
  const xpProgress = ((user.xp % 1000) / 1000) * 100;

  const handleSearchResultClick = (result: any) => {
    const viewMap: Record<string, string> = {
      task: "tasks", habit: "habits", project: "projects",
      resource: "study", note: "study", movie: "entertainment", diary: "diary",
    };
    setActiveView(viewMap[result.type] || "dashboard");
    setSearchQuery("");
    setShowSearch(false);
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("quro_theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("quro_theme", "dark");
      setIsDark(true);
    }
  };

  // ============ MOBILE LAYOUT ============
  if (isMobile) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
        {/* Mobile Header */}
        <MobileHeader
          isDark={isDark}
          onToggleTheme={toggleTheme}
          unreadCount={unreadCount}
          onNotificationsToggle={() => setShowNotifications(!showNotifications)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onSearchResultClick={handleSearchResultClick}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto mobile-content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-[105] bg-background/95 backdrop-blur-xl"
            >
              <div className="mobile-header">
                <h3 className="text-sm font-bold">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        api.notifications.markAllRead().then(() => {
                          setNotifs(notifs.map((n) => ({ ...n, read: 1 })));
                        });
                      }}
                      className="text-xs text-primary tap-feedback px-3 py-1.5"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="p-2 tap-feedback">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: "calc(100vh - 56px)" }}>
                {notifs.map((notif, i) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass rounded-xl p-4 ${notif.read ? "opacity-50" : ""}`}
                  >
                    <h4 className="text-sm mb-1">{notif.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{notif.description}</p>
                    <span className="text-xs text-accent">{notif.time}</span>
                  </motion.div>
                ))}
                {notifs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <MobileFAB onNavigate={setActiveView} />

        {/* Bottom Nav */}
        <MobileBottomNav
          activeView={activeView}
          onNavigate={setActiveView}
          onMoreOpen={() => setShowMoreDrawer(true)}
        />

        {/* More Drawer */}
        <MobileMoreDrawer
          open={showMoreDrawer}
          onClose={() => setShowMoreDrawer(false)}
          onNavigate={setActiveView}
          isAdmin={isAdmin}
        />
      </div>
    );
  }

  // ============ DESKTOP LAYOUT (unchanged) ============
  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex">
      <aside className="w-64 h-full border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight">QURO</h1>
              <p className="text-xs text-muted-foreground">Life Operating System</p>
            </div>
          </motion.div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="glass rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Level {user.level}</span>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs">{user.streak} days</span>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{user.xp.toLocaleString()} XP</span>
              <div className="flex items-center gap-1 text-accent">
                <Coins className="w-3 h-3" />
                <span>{user.coins.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 relative z-50">
          <div className="flex-1 max-w-xl relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                onFocus={() => { if (searchResults.length > 0) setShowSearch(true); }}
                className="w-full bg-input pl-10 pr-4 py-2 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            {showSearch && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 glass rounded-lg p-2 z-50 max-h-60 overflow-y-auto"
              >
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearchResultClick(r)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-sidebar-accent flex items-center justify-between"
                  >
                    <span className="text-sm">{r.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{r.type}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-accent/10 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              )}
            </button>

            <div className="relative" data-profile-menu>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm">{user.name}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
              </button>

              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-full mt-2 w-56 glass rounded-xl border border-border shadow-2xl shadow-black/40 z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { setActiveView("profile"); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />Profile
                    </button>
                    <button
                      onClick={() => { setActiveView("settings"); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <Settings2 className="w-4 h-4 text-muted-foreground" />Settings
                    </button>
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                      {isDark ? "Light Mode" : "Dark Mode"}
                    </button>
                  </div>
                  <div className="p-1.5 border-t border-border">
                    <button
                      onClick={() => { logout(); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-red-500"
                    >
                      <LogOut className="w-4 h-4" />Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-0 top-16 bottom-0 w-80 bg-card/90 backdrop-blur-xl border-l border-border p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    api.notifications.markAllRead().then(() => {
                      setNotifs(notifs.map((n) => ({ ...n, read: 1 })));
                    });
                  }}
                  className="text-xs text-primary hover:text-accent"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="space-y-3">
              {notifs.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass rounded-lg p-4 ${notif.read ? "opacity-50" : ""}`}
                >
                  <h4 className="text-sm mb-1">{notif.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{notif.description}</p>
                  <span className="text-xs text-accent">{notif.time}</span>
                </motion.div>
              ))}
              {notifs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
