import { useCallback, useEffect, useState } from "react";
import {
  createInitialBoard,
  loadBoard,
  saveBoard,
  uid,
  type BoardState,
  type Card,
  type LabelId,
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
        cards: {
          ...prev.cards,
          [id]: { id, title: trimmed, description: "", labels: [], dueDate: null, checklist: [] },
        },
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
      cards: { ...prev.cards, [cardId]: { ...prev.cards[cardId]!, title: trimmed } },
    }));
  }, []);

  const updateCard = useCallback((cardId: string, patch: Partial<Omit<Card, "id">>) => {
    setState((prev) => {
      const card = prev.cards[cardId];
      if (!card) return prev;
      return { ...prev, cards: { ...prev.cards, [cardId]: { ...card, ...patch } } };
    });
  }, []);

  const toggleLabel = useCallback((cardId: string, label: LabelId) => {
    setState((prev) => {
      const card = prev.cards[cardId];
      if (!card) return prev;
      const labels = card.labels ?? [];
      const next = labels.includes(label)
        ? labels.filter((l) => l !== label)
        : [...labels, label];
      return { ...prev, cards: { ...prev.cards, [cardId]: { ...card, labels: next } } };
    });
  }, []);

  const addChecklistItem = useCallback((cardId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setState((prev) => {
      const card = prev.cards[cardId];
      if (!card) return prev;
      const checklist = [...(card.checklist ?? []), { id: uid(), text: trimmed, done: false }];
      return { ...prev, cards: { ...prev.cards, [cardId]: { ...card, checklist } } };
    });
  }, []);

  const toggleChecklistItem = useCallback((cardId: string, itemId: string) => {
    setState((prev) => {
      const card = prev.cards[cardId];
      if (!card) return prev;
      const checklist = (card.checklist ?? []).map((i) =>
        i.id === itemId ? { ...i, done: !i.done } : i,
      );
      return { ...prev, cards: { ...prev.cards, [cardId]: { ...card, checklist } } };
    });
  }, []);

  const removeChecklistItem = useCallback((cardId: string, itemId: string) => {
    setState((prev) => {
      const card = prev.cards[cardId];
      if (!card) return prev;
      const checklist = (card.checklist ?? []).filter((i) => i.id !== itemId);
      return { ...prev, cards: { ...prev.cards, [cardId]: { ...card, checklist } } };
    });
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

  const moveColumn = useCallback((columnId: string, toIndex: number) => {
    setState((prev) => {
      const from = prev.columns.findIndex((c) => c.id === columnId);
      if (from === -1) return prev;
      const columns = [...prev.columns];
      const [moved] = columns.splice(from, 1) as [(typeof columns)[number]];
      columns.splice(Math.max(0, Math.min(toIndex, columns.length)), 0, moved);
      return { ...prev, columns };
    });
  }, []);

  const resetBoard = useCallback(() => setState(createInitialBoard()), []);

  return {
    state,
    hydrated,
    addCard,
    renameCard,
    updateCard,
    toggleLabel,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    deleteCard,
    moveColumn,
    addColumn,
    renameColumn,
    deleteColumn,
    moveCard,
    resetBoard,
  };
}
