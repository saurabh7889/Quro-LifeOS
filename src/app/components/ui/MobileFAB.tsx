import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, CheckSquare, RefreshCw, Wallet, Heart } from "lucide-react";

interface MobileFABProps {
  onNavigate: (view: string) => void;
  onAction?: (action: string) => void;
}

const fabActions = [
  { id: "task", label: "Add Task", icon: CheckSquare, view: "tasks", color: "text-green-500" },
  { id: "habit", label: "Add Habit", icon: RefreshCw, view: "habits", color: "text-orange-500" },
  { id: "transaction", label: "Add Transaction", icon: Wallet, view: "finance", color: "text-blue-500" },
  { id: "workout", label: "Log Workout", icon: Heart, view: "health", color: "text-red-500" },
];

export function MobileFAB({ onNavigate }: MobileFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: typeof fabActions[0]) => {
    setIsOpen(false);
    onNavigate(action.view);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[98] bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action items */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed z-[99]" style={{ bottom: `calc(140px + env(safe-area-inset-bottom, 0px))`, right: '16px' }}>
            {fabActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  onClick={() => handleAction(action)}
                  className="fab-menu-item mb-3 w-full"
                >
                  <div className={`w-9 h-9 rounded-lg bg-card flex items-center justify-center ${action.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        className="mobile-fab"
        onClick={() => setIsOpen(!isOpen)}
        animate={{
          rotate: isOpen ? 45 : 0,
          scale: isOpen ? 0.9 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        whileTap={{ scale: 0.85 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </motion.button>
    </>
  );
}
