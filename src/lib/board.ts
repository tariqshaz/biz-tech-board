export type Card = {
  id: string;
  title: string;
};

export type Column = {
  id: string;
  title: string;
  cardIds: string[];
};

export type BoardState = {
  name: string;
  columns: Column[];
  cards: Record<string, Card>;
};

export const STORAGE_KEY = "openboard.board.v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

export function createInitialBoard(): BoardState {
  const seed: Array<[string, string[]]> = [
    ["Backlog", ["Sketch board layout", "List must-have features"]],
    ["In progress", ["Build drag and drop"]],
    ["Review", []],
    ["Done", ["Set up the project"]],
  ];

  const cards: Record<string, Card> = {};
  const columns: Column[] = seed.map(([title, titles]) => ({
    id: uid(),
    title,
    cardIds: titles.map((t) => {
      const id = uid();
      cards[id] = { id, title: t };
      return id;
    }),
  }));

  return { name: "OpenBoard", columns, cards };
}

export function loadBoard(): BoardState {
  if (typeof window === "undefined") return createInitialBoard();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialBoard();
    const parsed = JSON.parse(raw) as BoardState;
    if (!parsed?.columns || !parsed?.cards) return createInitialBoard();
    return parsed;
  } catch {
    return createInitialBoard();
  }
}

export function saveBoard(state: BoardState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

export function findColumnOfCard(state: BoardState, cardId: string) {
  return state.columns.find((c) => c.cardIds.includes(cardId));
}
