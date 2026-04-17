import { useMemo } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./context-menu";

export interface SmartAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  section: string;
  shortcut?: string;
  danger?: boolean;
  ai?: boolean;
  onSelect: () => void;
}

interface SmartContextMenuProps {
  children: ReactNode;
  actions?: SmartAction[];
}

const OPEN_ACTION_ID = "open-large-view";
const DELETE_ACTION_ID = "delete";

const usageKey = (section: string, actionId: string) => `smart-action:${section}:${actionId}`;

function getUsage(section: string, actionId: string) {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  const value = Number(localStorage.getItem(usageKey(section, actionId)));
  return Number.isFinite(value) ? value : 0;
}

function bumpUsage(section: string, actionId: string) {
  if (typeof window === "undefined" || !window.localStorage) return;
  const current = getUsage(section, actionId);
  localStorage.setItem(usageKey(section, actionId), String(current + 1));
}

export function SmartContextMenu({ children, actions = [] }: SmartContextMenuProps) {
  const ranked = useMemo(() => {
    if (!Array.isArray(actions)) return [];
    
    const open = actions.find((action) => action.id === OPEN_ACTION_ID);
    const del = actions.find((action) => action.id === DELETE_ACTION_ID);
    const dynamic = actions.filter((action) => action.id !== OPEN_ACTION_ID && action.id !== DELETE_ACTION_ID);

    dynamic.sort((a, b) => getUsage(b.section, b.id) - getUsage(a.section, a.id));
    return [open, ...dynamic, del].filter(Boolean) as SmartAction[];
  }, [actions]);

  const hasAISuggestion = ranked.some((action) => action.ai);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent
        className="min-w-60 rounded-2xl border bg-popover/95 text-popover-foreground p-2 backdrop-blur-3xl shadow-2xl z-50"
      >
        <ContextMenuLabel className="text-xs text-muted-foreground">Quick actions</ContextMenuLabel>
        {ranked.map((action) => {
          const Icon = action.icon;
          return (
            <ContextMenuItem
              key={action.id}
              variant={action.danger ? "destructive" : "default"}
              className="rounded-xl py-2"
              onSelect={() => {
                bumpUsage(action.section, action.id);
                action.onSelect();
              }}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              <span>{action.label}</span>
              {action.shortcut ? <ContextMenuShortcut>{action.shortcut}</ContextMenuShortcut> : null}
            </ContextMenuItem>
          );
        })}
        {hasAISuggestion ? (
          <>
            <ContextMenuSeparator />
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI suggestions enabled</span>
            </div>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}
