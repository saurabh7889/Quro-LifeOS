import { useCallback } from "react";
import { Copy, Expand, Pencil, Pin, Trash2 } from "lucide-react";
import type { SmartAction } from "./SmartContextMenu";

interface ItemContextActionConfig {
  section: string;
  isPinned: boolean;
  onOpenLargeView: () => void;
  onTogglePin: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onEdit?: () => void;
  editLabel?: string;
  duplicateLabel?: string;
  aiEdit?: boolean;
}

export function useItemContextActions() {
  return useCallback((config: ItemContextActionConfig): SmartAction[] => {
    const actions: SmartAction[] = [
      {
        id: "open-large-view",
        label: "Open in Large View",
        icon: Expand,
        section: config.section,
        onSelect: config.onOpenLargeView,
      },
    ];

    if (config.onEdit) {
      actions.push({
        id: "edit",
        label: config.editLabel || "Edit",
        icon: Pencil,
        section: config.section,
        ai: config.aiEdit ?? false,
        onSelect: config.onEdit,
      });
    }

    if (config.onDuplicate) {
      actions.push({
        id: "duplicate",
        label: config.duplicateLabel || "Duplicate",
        icon: Copy,
        section: config.section,
        onSelect: config.onDuplicate,
      });
    }

    actions.push({
      id: "pin",
      label: config.isPinned ? "Unpin" : "Pin",
      icon: Pin,
      section: config.section,
      onSelect: config.onTogglePin,
    });

    if (config.onDelete) {
      actions.push({
        id: "delete",
        label: "Delete",
        icon: Trash2,
        section: config.section,
        danger: true,
        onSelect: config.onDelete,
      });
    }

    return actions;
  }, []);
}
