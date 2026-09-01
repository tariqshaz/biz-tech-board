import { useCallback, useEffect, useState } from "react";
import {
  createInitialBoard,
  loadBoard,
  saveBoard,
  uid,
  type BoardState,
} from "@/lib/board";

export function useBoard() {
  const [state, setState] = useState<BoardState>(() => createInitialBoard());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadBoard());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveBoard(state);
  }, [state, hydrated]);

  const addCard = useCallback((columnId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((prev) => {
      const id = uid();
      return {
        ...prev,
        cards: { ...prev.cards, [id]: { id, title: trimmed } },
        columns: prev.columns.map((c) =>
          c.id === columnId ? { ...c, cardIds: [...c.cardIds, id] } : c,
        ),
      };
    });
  }, []);

  const renameCard = useCallback((cardId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      cards: { ...prev.cards, [cardId]: { id: cardId, title: trimmed } },
    }));
  }, []);


  const deleteCard = useCallback((cardId: string) => {
    setState((prev) => {
      const cards = { ...prev.cards };
      delete cards[cardId];
      return {
        ...prev,
        cards,
        columns: prev.columns.map((c) => ({
          ...c,
          cardIds: c.cardIds.filter((id) => id !== cardId),
        })),
      };
    });
  }, []);

  const addColumn = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      columns: [...prev.columns, { id: uid(), title: trimmed, cardIds: [] }],
    }));
  }, []);

  const renameColumn = useCallback((columnId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.id === columnId ? { ...c, title: trimmed } : c)),
    }));
  }, []);

  const deleteColumn = useCallback((columnId: string) => {
    setState((prev) => {
      const column = prev.columns.find((c) => c.id === columnId);
      const cards = { ...prev.cards };
      column?.cardIds.forEach((id) => delete cards[id]);
      return {
        ...prev,
        cards,
        columns: prev.columns.filter((c) => c.id !== columnId),
      };
    });
  }, []);

  const moveCard = useCallback(
    (cardId: string, toColumnId: string, toIndex: number) => {
      setState((prev) => {
        const from = prev.columns.find((c) => c.cardIds.includes(cardId));
        if (!from) return prev;

        const columns = prev.columns.map((c) => ({ ...c, cardIds: [...c.cardIds] }));
        const source = columns.find((c) => c.id === from.id)!;
        const target = columns.find((c) => c.id === toColumnId);
        if (!target) return prev;

        source.cardIds.splice(source.cardIds.indexOf(cardId), 1);
        const index = Math.max(0, Math.min(toIndex, target.cardIds.length));
        target.cardIds.splice(index, 0, cardId);

        return { ...prev, columns };
      });
    },
    [],
  );

  const resetBoard = useCallback(() => setState(createInitialBoard()), []);

  return {
    state,
    hydrated,
    addCard,
    renameCard,
    deleteCard,
    addColumn,
    renameColumn,
    deleteColumn,
    moveCard,
    resetBoard,
  };
}
