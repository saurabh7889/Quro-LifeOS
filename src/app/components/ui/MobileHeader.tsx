import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Bell, Search, Moon, Sun, X } from "lucide-react";

interface MobileHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  unreadCount: number;
  onNotificationsToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: any[];
  onSearchResultClick: (result: any) => void;
}

export function MobileHeader({
  isDark,
  onToggleTheme,
  unreadCount,
  onNotificationsToggle,
  searchQuery,
  onSearchChange,
  searchResults,
  onSearchResultClick,
}: MobileHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="mobile-header">
      {showSearch ? (
        <motion.div
          initial={{ opacity: 0, width: "80%" }}
          animate={{ opacity: 1, width: "100%" }}
          className="flex items-center gap-2 w-full"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-input pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={() => {
              setShowSearch(false);
              onSearchChange("");
            }}
            className="p-2 tap-feedback"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mobile search results */}
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-1 mx-4 bg-popover/95 backdrop-blur-xl rounded-xl border border-border p-2 z-50 max-h-60 overflow-y-auto"
            >
              {searchResults.map((r: any, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    onSearchResultClick(r);
                    setShowSearch(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-sidebar-accent flex items-center justify-between tap-feedback"
                >
                  <span className="text-sm">{r.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{r.type}</span>
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      ) : (
        <>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight leading-none">QURO</h1>
              <p className="text-[9px] text-muted-foreground leading-none">LifeOS</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2.5 rounded-xl hover:bg-accent/10 transition-colors tap-feedback"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl hover:bg-accent/10 transition-colors tap-feedback"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>

            <button
              onClick={onNotificationsToggle}
              className="relative p-2.5 rounded-xl hover:bg-accent/10 transition-colors tap-feedback"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
