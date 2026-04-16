import { Expand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface LargeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  details: Record<string, unknown>;
  insight: string;
}

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  onConfirm: () => void;
}

export function LargeViewDialog({
  open,
  onOpenChange,
  title,
  description,
  details,
  insight,
}: LargeViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border border-border bg-background/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Expand className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
            <h4 className="mb-2">Details</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {Object.entries(details).slice(0, 8).map(([key, value]) => (
                <p key={key}>
                  <span className="text-foreground">{key}:</span> {String(value)}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-accent/20 bg-accent/10 p-4">
            <h4 className="mb-2">Insights</h4>
            <p className="text-sm text-muted-foreground">{insight}</p>
          </div>
        </div>
        <DialogFooter>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">
            Save changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Delete item?",
  description,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg bg-muted text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
