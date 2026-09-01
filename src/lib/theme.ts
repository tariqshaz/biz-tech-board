export type LabelStyle = "soft" | "solid" | "outline";

export const LABEL_STYLES: Array<{ id: LabelStyle; name: string }> = [
  { id: "soft", name: "Soft" },
  { id: "solid", name: "Solid" },
  { id: "outline", name: "Outline" },
];

export type SurfaceTheme = {
  id: string;
  name: string;
  /** css background for the surface itself */
  background: string;
  /** small swatch used in the settings picker */
  swatch: string;
  /** css variables scoped to the themed subtree */
  vars: Record<string, string>;
};

/** Themes for the board canvas (page background + list/card surfaces). */
export const BOARD_THEMES: SurfaceTheme[] = [
  {
    id: "midnight",
    name: "Midnight",
    background: "oklch(0.19 0.028 250)",
    swatch: "oklch(0.19 0.028 250)",
    vars: {
      "--card": "oklch(0.245 0.03 252)",
      "--secondary": "oklch(0.26 0.03 252)",
      "--muted": "oklch(0.3 0.03 252)",
      "--foreground": "oklch(0.96 0.008 250)",
      "--muted-foreground": "oklch(0.72 0.025 250)",
      "--border": "oklch(1 0 0 / 12%)",
    },
  },
  {
    id: "ink",
    name: "Ink",
    background: "oklch(0.145 0 0)",
    swatch: "oklch(0.145 0 0)",
    vars: {
      "--card": "oklch(0.2 0 0)",
      "--secondary": "oklch(0.23 0 0)",
      "--muted": "oklch(0.28 0 0)",
      "--foreground": "oklch(0.97 0 0)",
      "--muted-foreground": "oklch(0.72 0 0)",
      "--border": "oklch(1 0 0 / 12%)",
    },
  },
  {
    id: "forest",
    name: "Forest",
    background: "oklch(0.21 0.035 160)",
    swatch: "oklch(0.21 0.035 160)",
    vars: {
      "--card": "oklch(0.26 0.038 160)",
      "--secondary": "oklch(0.28 0.04 160)",
      "--muted": "oklch(0.32 0.04 160)",
      "--foreground": "oklch(0.96 0.01 160)",
      "--muted-foreground": "oklch(0.74 0.03 160)",
      "--border": "oklch(1 0 0 / 12%)",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    background: "oklch(0.22 0.05 240)",
    swatch: "oklch(0.22 0.05 240)",
    vars: {
      "--card": "oklch(0.27 0.055 240)",
      "--secondary": "oklch(0.29 0.06 240)",
      "--muted": "oklch(0.33 0.06 240)",
      "--foreground": "oklch(0.96 0.01 240)",
      "--muted-foreground": "oklch(0.74 0.03 240)",
      "--border": "oklch(1 0 0 / 12%)",
    },
  },
  {
    id: "plum",
    name: "Plum",
    background: "oklch(0.21 0.045 315)",
    swatch: "oklch(0.21 0.045 315)",
    vars: {
      "--card": "oklch(0.26 0.05 315)",
      "--secondary": "oklch(0.28 0.055 315)",
      "--muted": "oklch(0.33 0.055 315)",
      "--foreground": "oklch(0.96 0.01 315)",
      "--muted-foreground": "oklch(0.75 0.03 315)",
      "--border": "oklch(1 0 0 / 12%)",
    },
  },
  {
    id: "clay",
    name: "Clay",
    background: "oklch(0.22 0.035 40)",
    swatch: "oklch(0.22 0.035 40)",
    vars: {
      "--card": "oklch(0.27 0.04 40)",
      "--secondary": "oklch(0.29 0.045 40)",
      "--muted": "oklch(0.34 0.045 40)",
      "--foreground": "oklch(0.96 0.01 60)",
      "--muted-foreground": "oklch(0.75 0.03 50)",
      "--border": "oklch(1 0 0 / 12%)",
    },
  },
  {
    id: "paper",
    name: "Paper",
    background: "oklch(0.965 0.005 250)",
    swatch: "oklch(0.965 0.005 250)",
    vars: {
      "--card": "oklch(1 0 0)",
      "--secondary": "oklch(0.93 0.006 250)",
      "--muted": "oklch(0.9 0.008 250)",
      "--foreground": "oklch(0.22 0.02 250)",
      "--muted-foreground": "oklch(0.48 0.02 250)",
      "--border": "oklch(0.2 0.02 250 / 14%)",
    },
  },
  {
    id: "mist",
    name: "Mist",
    background: "oklch(0.94 0.02 200)",
    swatch: "oklch(0.94 0.02 200)",
    vars: {
      "--card": "oklch(0.99 0.005 200)",
      "--secondary": "oklch(0.91 0.022 200)",
      "--muted": "oklch(0.88 0.025 200)",
      "--foreground": "oklch(0.24 0.03 220)",
      "--muted-foreground": "oklch(0.48 0.03 215)",
      "--border": "oklch(0.24 0.03 220 / 14%)",
    },
  },
];

/** Themes for the card detail dialog. */
export const DIALOG_THEMES: SurfaceTheme[] = [
  {
    id: "match",
    name: "Match board",
    background: "",
    swatch: "linear-gradient(135deg, oklch(0.245 0.03 252) 50%, oklch(0.99 0 0) 50%)",
    vars: {},
  },
  ...BOARD_THEMES.map((t) => ({
    ...t,
    // in the dialog the sheet itself uses the theme's card colour
    background: t.vars["--card"] ?? t.background,
  })),
];

export function boardTheme(id: string) {
  return BOARD_THEMES.find((t) => t.id === id) ?? BOARD_THEMES[0]!;
}

export function dialogTheme(id: string, boardThemeId: string) {
  if (id === "match") {
    const base = boardTheme(boardThemeId);
    return { ...base, background: base.vars["--card"] ?? base.background };
  }
  return DIALOG_THEMES.find((t) => t.id === id) ?? dialogTheme("match", boardThemeId);
}

export function themeStyle(theme: SurfaceTheme, includeBackground = true) {
  const style: Record<string, string> = { ...theme.vars };
  if (includeBackground && theme.background) style["background"] = theme.background;
  return style as React.CSSProperties;
}
