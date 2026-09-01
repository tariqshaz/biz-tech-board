import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_LABELS,
  createInitialBoard,
  emptyCard,
  loadBoard,
  saveBoard,
  uid,
  type BoardState,
  type Attachment,
  type Card,
  type LabelColor,
  type LabelId,
} from "@/lib/board";
import { deleteFile, putFile } from "@/lib/attachments";

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
        cards: { ...prev.cards, [id]: emptyCard(id, trimmed) },
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

  const createLabel = useCallback((name: string, color: LabelColor) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      labels: [...prev.labels, { id: uid(), name: trimmed, color }],
    }));
  }, []);

  const updateLabel = useCallback(
    (labelId: string, patch: { name?: string; color?: LabelColor }) => {
      setState((prev) => ({
        ...prev,
        labels: prev.labels.map((l) =>
          l.id === labelId
            ? { ...l, ...(patch.name?.trim() ? { name: patch.name.trim() } : {}), ...(patch.color ? { color: patch.color } : {}) }
            : l,
        ),
      }));
    },
    [],
  );

  const deleteLabel = useCallback((labelId: string) => {
    setState((prev) => {
      const cards: Record<string, Card> = {};
      Object.values(prev.cards).forEach((c) => {
        cards[c.id] = { ...c, labels: (c.labels ?? []).filter((l) => l !== labelId) };
      });
      return { ...prev, cards, labels: prev.labels.filter((l) => l.id !== labelId) };
    });
  }, []);

  const resetLabels = useCallback(() => {
    setState((prev) => ({ ...prev, labels: DEFAULT_LABELS.map((l) => ({ ...l })) }));
  }, []);

  const addAttachment = useCallback(async (cardId: string, file: File) => {
    const id = uid();
    await putFile(id, file);
    const attachment: Attachment = {
      id,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      addedAt: new Date().toISOString(),
    };
    setState((prev) => {
      const card = prev.cards[cardId];
      if (!card) return prev;
      return {
        ...prev,
        cards: {
          ...prev.cards,
          [cardId]: { ...card, attachments: [...(card.attachments ?? []), attachment] },
        },
      };
    });
    return attachment;
  }, []);

  const removeAttachment = useCallback(async (cardId: string, attachmentId: string) => {
    await deleteFile(attachmentId).catch(() => undefined);
    setState((prev) => {
      const card = prev.cards[cardId];
      if (!card) return prev;
      return {
        ...prev,
        cards: {
          ...prev.cards,
          [cardId]: {
            ...card,
            attachments: (card.attachments ?? []).filter((a) => a.id !== attachmentId),
          },
        },
      };
    });
  }, []);

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
    createLabel,
    updateLabel,
    deleteLabel,
    resetLabels,
    addAttachment,
    removeAttachment,
    deleteCard,
    moveColumn,
    addColumn,
    renameColumn,
    deleteColumn,
    moveCard,
    resetBoard,
  };
}
