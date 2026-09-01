import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LABELS, checklistProgress, type Card, type LabelId } from "@/lib/board";

type Props = {
  card: Card | null;
  columnTitle?: string;
  onClose: () => void;
  onUpdate: (patch: Partial<Omit<Card, "id">>) => void;
  onToggleLabel: (label: LabelId) => void;
  onAddChecklistItem: (text: string) => void;
  onToggleChecklistItem: (itemId: string) => void;
  onRemoveChecklistItem: (itemId: string) => void;
  onDelete: () => void;
};

export function CardDialog({
  card,
  columnTitle,
  onClose,
  onUpdate,
  onToggleLabel,
  onAddChecklistItem,
  onToggleChecklistItem,
  onRemoveChecklistItem,
  onDelete,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [item, setItem] = useState("");

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
      setItem("");
    }
  }, [card?.id]);

  if (!card) return null;
  const progress = checklistProgress(card);
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <Dialog open={!!card} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Card details</DialogTitle>
          <DialogDescription className="sr-only">
            Edit the title, labels, due date and checklist for this card.
          </DialogDescription>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && onUpdate({ title: title.trim() })}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            aria-label="Card title"
            className="w-full bg-transparent pr-8 text-left font-semibold text-lg tracking-tight outline-none"
          />
          {columnTitle && (
            <p className="text-xs text-muted-foreground uppercase">in {columnTitle}</p>
          )}
        </DialogHeader>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Labels
          </h3>
          <div className="flex flex-wrap gap-2">
            {LABELS.map((label) => {
              const active = (card.labels ?? []).includes(label.id);
              return (
                <button
                  key={label.id}
                  onClick={() => onToggleLabel(label.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-opacity",
                    label.className,
                    !active && "opacity-40 hover:opacity-70",
                  )}
                >
                  {label.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <CalendarDays className="h-3.5 w-3.5" /> Due date
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={card.dueDate ?? ""}
              onChange={(e) => onUpdate({ dueDate: e.target.value || null })}
              aria-label="Due date"
              className="rounded-lg border border-border bg-input/40 px-3 py-1.5 text-sm outline-none focus:border-ring"
            />
            {card.dueDate && (
              <button
                onClick={() => onUpdate({ dueDate: null })}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Description
          </h3>
          <textarea
            rows={4}
            value={description}
            placeholder="Add more detail…"
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => onUpdate({ description })}
            className="w-full resize-none rounded-lg border border-border bg-input/40 p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </section>

        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Checklist
            {progress.total > 0 && (
              <span className="normal-case">
                {progress.done}/{progress.total}
              </span>
            )}
          </h3>
          {progress.total > 0 && (
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          )}
          <ul className="space-y-1">
            {(card.checklist ?? []).map((i) => (
              <li key={i.id} className="group flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={i.done}
                  onChange={() => onToggleChecklistItem(i.id)}
                  className="h-4 w-4 accent-primary"
                  aria-label={i.text}
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    i.done && "text-muted-foreground line-through",
                  )}
                >
                  {i.text}
                </span>
                <button
                  onClick={() => onRemoveChecklistItem(i.id)}
                  aria-label={`Remove ${i.text}`}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <input
              value={item}
              placeholder="Add an item"
              onChange={(e) => setItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onAddChecklistItem(item);
                  setItem("");
                }
              }}
              className="flex-1 rounded-lg border border-border bg-input/40 px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
            />
            <button
              onClick={() => {
                onAddChecklistItem(item);
                setItem("");
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </section>

        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete card
        </button>
      </DialogContent>
    </Dialog>
  );
}
