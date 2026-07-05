export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  hero: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const card = {
  hero: 24,
  default: 20,
  tight: 16,
} as const;

// Cave.guanocoin palette — electric orange bg, magenta panels, yellow pills, black cards.
export const theme = {
  paper: "#FE3C00", // electric orange — screen background
  paperDeep: "#A3278F", // magenta — cards / nav / panels
  night: "#151210", // near-black — accent cards / text on yellow
  ink: "#1A120C", // primary dark text (on orange / yellow)
  inkSoft: "rgba(26,18,12,0.78)",
  inkFaint: "rgba(26,18,12,0.55)",
  stamp: "#ECD94C", // yellow — primary buttons / accents
  wax: "#151210", // black accent (button variant)
  indigo: "#A3278F",
  faded: "rgba(26,18,12,0.6)",
  line: "rgba(26,18,12,0.18)",
  error: "#7A1500",
  // light text for use INSIDE magenta / black cards
  cream: "#FFF3E0",
  creamSoft: "rgba(255,243,224,0.82)",
  creamFaint: "rgba(255,243,224,0.6)",
  creamLine: "rgba(255,243,224,0.22)",
  // aliases
  bg: "#FE3C00",
  surface: "#A3278F",
  text: "#1A120C",
  muted: "rgba(26,18,12,0.78)",
  accent: "#ECD94C",
  chip: "#A3278F",
  success: "#ECD94C",
  glow: "#A3278F",
  gold: "#F6C24A",
};

export const chipColors: Record<string, string> = {
  electronics: "#ECD94C",
  clothing: "#F6C24A",
  books: "#7BC5E0",
  memorabilia: "#FF9ED2",
  default: "#FFF3E0",
};

export function categoryColor(category?: string): string {
  if (!category) return chipColors.default;
  return chipColors[category] ?? chipColors.default;
}

export type Space = (typeof space)[keyof typeof space];

const _caveDims = {
  scoop: 48,
  card: 32,
  pill: 28,
  panel: 24,
  field: 16,
  stroke: 1.5,
  hairline: 1,
};

export const cave = {
  ..._caveDims,
  lift: {
    shadowColor: "#1A1614",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  heroCard: {
    backgroundColor: theme.paperDeep,
    borderRadius: _caveDims.scoop,
    padding: _caveDims.panel,
  },
  pillBtn: {
    backgroundColor: theme.stamp,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: _caveDims.pill,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  pillBtnText: {
    color: theme.night,
    fontSize: 16,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
};
