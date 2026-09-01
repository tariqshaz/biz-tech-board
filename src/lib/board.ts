export type LabelId = "bug" | "priority" | "frontend" | "backend" | "design" | "idea";

export const LABELS: Array<{ id: LabelId; name: string; className: string }> = [
  { id: "priority", name: "Priority", className: "bg-chart-1/20 text-chart-1 border-chart-1/40" },
  { id: "bug", name: "Bug", className: "bg-destructive/20 text-destructive border-destructive/40" },
  { id: "frontend", name: "Frontend", className: "bg-chart-2/20 text-chart-2 border-chart-2/40" },
  { id: "backend", name: "Backend", className: "bg-chart-3/20 text-chart-3 border-chart-3/40" },
  { id: "design", name: "Design", className: "bg-chart-4/20 text-chart-4 border-chart-4/40" },
  { id: "idea", name: "Idea", className: "bg-chart-5/20 text-chart-5 border-chart-5/40" },
];

export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type Card = {
  id: string;
  title: string;
  description?: string;
  labels?: LabelId[];
  dueDate?: string | null;
  checklist?: ChecklistItem[];
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
      cards[id] = { id, title: t, labels: [], checklist: [], dueDate: null, description: "" };
      return id;
    }),
  }));

  return { name: "OpenBoard", columns, cards };
}

function normalizeCard(card: Card): Card {
  return {
    id: card.id,
    title: card.title,
    description: card.description ?? "",
    labels: Array.isArray(card.labels) ? card.labels : [],
    dueDate: card.dueDate ?? null,
    checklist: Array.isArray(card.checklist) ? card.checklist : [],
  };
}

export function loadBoard(): BoardState {
  if (typeof window === "undefined") return createInitialBoard();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialBoard();
    const parsed = JSON.parse(raw) as BoardState;
    if (!parsed?.columns || !parsed?.cards) return createInitialBoard();
    const cards: Record<string, Card> = {};
    Object.values(parsed.cards).forEach((c) => {
      cards[c.id] = normalizeCard(c);
    });
    return { ...parsed, cards };
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

export function checklistProgress(card: Card) {
  const items = card.checklist ?? [];
  return { done: items.filter((i) => i.done).length, total: items.length };
}

export function dueStatus(dueDate?: string | null) {
  if (!dueDate) return null;
  const due = new Date(`${dueDate}T23:59:59`);
  const now = new Date();
  const days = Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return "overdue" as const;
  if (days <= 2) return "soon" as const;
  return "later" as const;
}

export function formatDue(dueDate: string) {
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function matchesQuery(card: Card, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const labelNames = (card.labels ?? [])
    .map((id) => LABELS.find((l) => l.id === id)?.name ?? "")
    .join(" ");
  return `${card.title} ${card.description ?? ""} ${labelNames}`.toLowerCase().includes(q);
}
