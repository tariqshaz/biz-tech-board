import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Card } from "@/lib/board";

type Props = {
  card: Card;
  onRename: (title: string) => void;
  onDelete: () => void;
};

export function KanbanCard({ card, onRename, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card" },
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.title);

  const commit = () => {
    onRename(draft);
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group relative rounded-lg border border-border bg-card p-3 shadow-sm",
        "hover:border-ring/60",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          aria-label={`Drag ${card.title}`}
          className="mt-0.5 cursor-grab text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(card.title);
                setEditing(false);
              }
            }}
            className="w-full bg-transparent text-sm leading-snug text-card-foreground outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setDraft(card.title);
              setEditing(true);
            }}
            className="flex-1 text-left text-sm leading-snug text-card-foreground"
          >
            {card.title}
          </button>
        )}

        <button
          onClick={onDelete}
          aria-label={`Delete ${card.title}`}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </div>
  );
}
