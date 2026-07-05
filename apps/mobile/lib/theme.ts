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

export const theme = {
  paper: "#F4EDE4",
  paperDeep: "#E8DDD0",
  ink: "#1A1614",
  inkSoft: "#5C534A",
  inkFaint: "#9A8F82",
  stamp: "#C44B37",
  wax: "#2E5E4E",
  indigo: "#5A6B8A",
  faded: "#9A8F82",
  line: "#D4C8B8",
  error: "#A63D2F",
  // aliases
  bg: "#F4EDE4",
  surface: "#E8DDD0",
  text: "#1A1614",
  muted: "#5C534A",
  accent: "#C44B37",
  chip: "#E8DDD0",
  success: "#2E5E4E",
  glow: "#4A6670",
};

export const chipColors: Record<string, string> = {
  electronics: "#4A6670",
  clothing: "#8B6E5A",
  books: "#6B5B7A",
  memorabilia: "#A65D57",
  default: "#5C534A",
};

export function categoryColor(category?: string): string {
  if (!category) return chipColors.default;
  return chipColors[category] ?? chipColors.default;
}
