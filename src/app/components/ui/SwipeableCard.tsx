import { type ReactNode } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "motion/react";
import { Trash2, Check } from "lucide-react";
import { useIsMobile } from "./use-mobile";

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  rightLabel?: string;
  leftLabel?: string;
  className?: string;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 100;

export function SwipeableCard({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightLabel = "Complete",
  leftLabel = "Delete",
  className = "",
  disabled = false,
}: SwipeableCardProps) {
  const isMobile = useIsMobile();
  const x = useMotionValue(0);
  const controls = useAnimation();

  // Background colors based on drag direction
  const rightBgOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const leftBgOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const rightIconScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.5, 1]);
  const leftIconScale = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0.5]);

  if (!isMobile || disabled) {
    return <div className={className}>{children}</div>;
  }

  const handleDragEnd = (_: any, info: any) => {
    const offset = info.offset.x;

    if (offset > SWIPE_THRESHOLD && onSwipeRight) {
      controls.start({ x: 400, opacity: 0, transition: { duration: 0.25 } }).then(() => {
        onSwipeRight();
      });
    } else if (offset < -SWIPE_THRESHOLD && onSwipeLeft) {
      controls.start({ x: -400, opacity: 0, transition: { duration: 0.25 } }).then(() => {
        onSwipeLeft();
      });
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 500, damping: 30 } });
    }
  };

  return (
    <div className={`swipe-card rounded-xl ${className}`}>
      {/* Right action background (swipe right = complete) */}
      {onSwipeRight && (
        <motion.div
          className="swipe-actions swipe-actions-right absolute inset-y-0 left-0 w-full flex items-center pl-5 rounded-xl"
          style={{ opacity: rightBgOpacity }}
        >
          <motion.div style={{ scale: rightIconScale }} className="flex items-center gap-2 text-white">
            <Check className="w-6 h-6" />
            <span className="text-sm font-bold">{rightLabel}</span>
          </motion.div>
        </motion.div>
      )}

      {/* Left action background (swipe left = delete) */}
      {onSwipeLeft && (
        <motion.div
          className="swipe-actions swipe-actions-left absolute inset-y-0 right-0 w-full flex items-center justify-end pr-5 rounded-xl"
          style={{ opacity: leftBgOpacity }}
        >
          <motion.div style={{ scale: leftIconScale }} className="flex items-center gap-2 text-white">
            <span className="text-sm font-bold">{leftLabel}</span>
            <Trash2 className="w-6 h-6" />
          </motion.div>
        </motion.div>
      )}

      {/* Draggable card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        style={{ x }}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-inherit rounded-xl"
      >
        {children}
      </motion.div>
    </div>
  );
}
