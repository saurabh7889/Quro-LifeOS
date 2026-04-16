import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Settings2, Palette, Bell, User, Moon, Sun, Monitor, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../api";
import { useToast } from "./ui/Toast";
import { useIsMobile } from "./ui/use-mobile";

export function Settings({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains("dark"));
    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

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
    window.dispatchEvent(new Event("themechange"));
  };

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 md:space-y-6 max-w-3xl mx-auto`}>
      <div>
        <h2 className="mb-1">Settings</h2>
        <p className="text-sm text-muted-foreground">Customize your QURO experience</p>
      </div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />Appearance
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-input border border-border hover:border-primary transition-colors"
            >
              {isDark ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Light</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />Account
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Profile</p>
              <p className="text-xs text-muted-foreground">Manage your personal information</p>
            </div>
            <button onClick={() => onNavigate?.("profile")} className="px-3 py-1.5 text-xs bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
              View Profile
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />Notifications
        </h4>
        <div className="space-y-4">
          {[
            { id: "notif_task_reminders", label: "Task Reminders", desc: "Get notified about upcoming deadlines", active: !!user?.notif_task_reminders },
            { id: "notif_habit_alerts", label: "Habit Alerts", desc: "Daily reminders for pending habits", active: !!user?.notif_habit_alerts },
            { id: "notif_weekly_summary", label: "Weekly Summary", desc: "Receive a weekly progress report", active: !!user?.notif_weekly_summary },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <button 
                disabled={savingSettings}
                onClick={async () => {
                  if (!user) return;
                  setSavingSettings(true);
                  try {
                    const updatedUser = await api.user.updateProfile({
                      [item.id]: item.active ? 0 : 1 
                    });
                    updateUser(updatedUser);
                    showToast({ message: `${item.label} ${item.active ? 'disabled' : 'enabled'}`, type: "success" });
                  } catch (e) {
                    showToast({ message: "Failed to update setting", type: "error" });
                  } finally {
                    setSavingSettings(false);
                  }
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${item.active ? 'bg-primary' : 'bg-input border border-border'} ${savingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-transform duration-200 ${item.active ? 'bg-white left-[calc(100%-1.25rem)]' : 'bg-muted-foreground/50 left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* About */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />About
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">App</p>
            <p className="text-sm font-medium">QURO LifeOS</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="text-sm font-medium">1.0.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
