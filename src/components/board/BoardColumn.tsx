import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./KanbanCard";
import type { BoardState, Column } from "@/lib/board";

type Props = {
  column: Column;
  cards: BoardState["cards"];
  onAddCard: (title: string) => void;
  onRenameCard: (cardId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
  onRenameColumn: (title: string) => void;
  onDeleteColumn: () => void;
};

export function BoardColumn({
  column,
  cards,
  onAddCard,
  onRenameCard,
  onDeleteCard,
  onRenameColumn,
  onDeleteColumn,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${column.id}`,
    data: { type: "column", columnId: column.id },
  });
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [titleDraft, setTitleDraft] = useState(column.title);
  const [editingTitle, setEditingTitle] = useState(false);

  const submitCard = () => {
    onAddCard(draft);
    setDraft("");
  };

  return (
    <section
      className={cn(
        "flex w-[19rem] shrink-0 flex-col rounded-xl border border-border bg-secondary/40 backdrop-blur",
        isOver && "border-primary/60 bg-secondary/70",
      )}
    >
      <header className="flex items-center gap-2 px-3 pt-3 pb-2">
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => {
              onRenameColumn(titleDraft);
              setEditingTitle(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="w-full bg-transparent text-sm font-semibold tracking-wide uppercase outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setTitleDraft(column.title);
              setEditingTitle(true);
            }}
            className="text-sm font-semibold tracking-wide text-foreground uppercase"
          >
            {column.title}
          </button>
        )}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {column.cardIds.length}
        </span>
        <button
          onClick={onDeleteColumn}
          aria-label={`Delete list ${column.title}`}
          className="ml-auto text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </header>

      <div ref={setNodeRef} className="flex min-h-24 flex-col gap-2 px-3 pb-2">
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          {column.cardIds.map((id) =>
            cards[id] ? (
              <KanbanCard
                key={id}
                card={cards[id]}
                onRename={(title) => onRenameCard(id, title)}
                onDelete={() => onDeleteCard(id)}
              />
            ) : null,
          )}
        </SortableContext>
        {column.cardIds.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            Drop cards here
          </p>
        )}
      </div>

      <div className="px-3 pb-3">
        {composing ? (
          <div className="rounded-lg border border-border bg-card p-2">
            <textarea
              autoFocus
              rows={2}
              value={draft}
              placeholder="What needs doing?"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitCard();
                }
                if (e.key === "Escape") setComposing(false);
              }}
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={submitCard}
                className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add card
              </button>
              <button
                onClick={() => setComposing(false)}
                aria-label="Cancel"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setComposing(true)}
            className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Add a card
          </button>
        )}
      </div>
    </section>
  );
}
