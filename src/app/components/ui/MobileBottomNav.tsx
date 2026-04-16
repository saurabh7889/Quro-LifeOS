import { motion } from "motion/react";
import { LayoutDashboard, CheckSquare, BookOpen, Brain, User, Menu } from "lucide-react";

interface MobileBottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onMoreOpen: () => void;
}

const tabs = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "study", label: "Study", icon: BookOpen },
  { id: "quro", label: "AI", icon: Brain },
  { id: "more", label: "More", icon: Menu },
];

export function MobileBottomNav({ activeView, onNavigate, onMoreOpen }: MobileBottomNavProps) {
  // Determine which tab is visually active
  const getActiveTab = () => {
    if (["dashboard"].includes(activeView)) return "dashboard";
    if (["tasks"].includes(activeView)) return "tasks";
    if (["study"].includes(activeView)) return "study";
    if (["quro"].includes(activeView)) return "quro";
    return "more";
  };

  const currentTab = getActiveTab();

  return (
    <motion.nav
      className="mobile-bottom-nav"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "more") {
                  onMoreOpen();
                } else {
                  onNavigate(tab.id);
                }
              }}
              className={`mobile-bottom-nav-item ${isActive ? "active" : ""}`}
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-b bg-gradient-to-r from-primary to-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                className="nav-icon"
                animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span className="mobile-bottom-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
