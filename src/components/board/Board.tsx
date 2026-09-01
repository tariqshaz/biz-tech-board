import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus, RotateCcw } from "lucide-react";
import { useBoard } from "@/hooks/useBoard";
import { findColumnOfCard } from "@/lib/board";
import { BoardColumn } from "./BoardColumn";

export function Board() {
  const board = useBoard();
  const { state } = board;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newList, setNewList] = useState("");
  const [addingList, setAddingList] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const cardId = String(active.id);
    const overId = String(over.id);

    if (overId.startsWith("column:")) {
      const columnId = overId.slice("column:".length);
      const target = state.columns.find((c) => c.id === columnId);
      if (target) board.moveCard(cardId, columnId, target.cardIds.length);
      return;
    }

    if (overId === cardId) return;
    const targetColumn = findColumnOfCard(state, overId);
    if (!targetColumn) return;
    const sourceColumn = findColumnOfCard(state, cardId);
    let index = targetColumn.cardIds.indexOf(overId);
    if (sourceColumn?.id === targetColumn.id) {
      const from = sourceColumn.cardIds.indexOf(cardId);
      if (from < index) index += 0;
    }
    board.moveCard(cardId, targetColumn.id, index);
  };

  const activeCard = activeId ? state.cards[activeId] : null;
  const total = Object.keys(state.cards).length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-6 py-5">
        <div className="mx-auto flex max-w-[110rem] flex-wrap items-center gap-4">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">{state.name}</h1>
            <p className="text-sm text-muted-foreground">
              {total} cards across {state.columns.length} lists · saved on this device
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm("Reset the board to its starting cards?")) board.resetBoard();
            }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto px-6 py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="mx-auto flex max-w-[110rem] items-start gap-4">
            {state.columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                cards={state.cards}
                onAddCard={(title) => board.addCard(column.id, title)}
                onRenameCard={board.renameCard}
                onDeleteCard={board.deleteCard}
                onRenameColumn={(title) => board.renameColumn(column.id, title)}
                onDeleteColumn={() => board.deleteColumn(column.id)}
              />
            ))}

            <div className="w-[19rem] shrink-0">
              {addingList ? (
                <div className="rounded-xl border border-border bg-secondary/40 p-3">
                  <input
                    autoFocus
                    value={newList}
                    placeholder="List name"
                    onChange={(e) => setNewList(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        board.addColumn(newList);
                        setNewList("");
                        setAddingList(false);
                      }
                      if (e.key === "Escape") setAddingList(false);
                    }}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setAddingList(true)}
                  className="flex w-full items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
                >
                  <Plus className="h-4 w-4" /> Add another list
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="w-[17rem] rotate-2 rounded-lg border border-primary/50 bg-card p-3 text-sm shadow-lg">
                {activeCard.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
