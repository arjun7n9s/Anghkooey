export function extractToken(data: string): string | null {
  const trimmed = data.trim();
  if (!trimmed) return null;

  if (trimmed.includes("/b/")) {
    return trimmed.split("/b/").pop()?.split("?")[0]?.split("#")[0] ?? null;
  }
  if (trimmed.includes("anghkooey://log/")) {
    return trimmed.replace("anghkooey://log/", "").split("?")[0] ?? null;
  }
  if (trimmed.includes("anghkooey://b/")) {
    return trimmed.replace("anghkooey://b/", "").split("?")[0] ?? null;
  }
  if (trimmed.startsWith("qr-")) return trimmed;
  if (trimmed.length < 64 && !trimmed.startsWith("http")) return trimmed;
  return null;
}

export function tokensMatch(scanned: string, expected: string): boolean {
  const a = extractToken(scanned);
  const b = extractToken(expected);
  return !!a && !!b && a === b;
}

export function boxSortKey(label: string): number {
  const match = label.match(/#(\d+)/);
  return match ? Number(match[1]) : 999;
}
