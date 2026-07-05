export type ParsedItem = { name: string; category?: string };

const SPLIT = /,|\band\b|\bplus\b|\balso\b/gi;
const QUANTITY = /^((?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|a couple of|a pair of|some|several)\s+)/i;

export function parseItemsFromTranscript(transcript: string): ParsedItem[] {
  const seen = new Set<string>();

  return transcript
    .split(SPLIT)
    .map((p) => p.trim())
    .filter((p) => p.length > 1)
    .map((raw) => {
      let name = raw
        .replace(/^my\s+/i, "")
        .replace(/^a\s+/i, "")
        .replace(/^an\s+/i, "")
        .replace(/^the\s+/i, "")
        .replace(/^old\s+/i, "Old ");

      const qty = name.match(QUANTITY);
      if (qty) {
        const word = qty[1].trim().toLowerCase();
        const num =
          word === "one" || word === "a"
            ? "One"
            : word === "two" || word === "a couple of" || word === "a pair of"
              ? "Two"
              : word === "three"
                ? "Three"
                : word.charAt(0).toUpperCase() + word.slice(1);
        name = name.replace(QUANTITY, `${num} `);
      }

      return { name, category: guessCategory(name) };
    })
    .filter((item) => {
      const key = item.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function guessCategory(name: string): string | undefined {
  const n = name.toLowerCase();
  if (/camera|cable|charger|hdmi|battery|electronics|lens|tripod/.test(n)) return "electronics";
  if (/hoodie|coat|shirt|clothing|jacket|sweater/.test(n)) return "clothing";
  if (/book|paperback|novel|siddhartha/.test(n)) return "books";
  if (/postcard|letter|photo|memorabilia|card from/.test(n)) return "memorabilia";
  return undefined;
}
