export const theme = {
  paper: "#F4EDE4",
  paperDeep: "#E8DDD0",
  ink: "#1A1614",
  inkSoft: "#5C534A",
  stamp: "#C44B37",
  wax: "#2E5E4E",
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
