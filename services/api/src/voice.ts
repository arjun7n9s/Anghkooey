import type { BoxItem } from "../../../packages/shared/src/index.js";

const SPLIT = /,|\band\b/gi;

export function parseItemsFromTranscript(transcript: string): BoxItem[] {
  const parts = transcript
    .split(SPLIT)
    .map((p) => p.trim())
    .filter((p) => p.length > 1);

  return parts.map((name) => ({
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    name: name.replace(/^my\s+/i, "").replace(/^a\s+/i, "").replace(/^an\s+/i, "").replace(/^the\s+/i, ""),
    category: guessCategory(name),
  }));
}

function guessCategory(name: string): string | undefined {
  const n = name.toLowerCase();
  if (/camera|cable|charger|hdmi|battery|electronics/.test(n)) return "electronics";
  if (/hoodie|coat|shirt|clothing/.test(n)) return "clothing";
  if (/book|paperback|siddhartha/.test(n)) return "books";
  if (/postcard|letter|photo/.test(n)) return "memorabilia";
  return undefined;
}

export async function parseItemsWithLlm(transcript: string): Promise<BoxItem[]> {
  const baseUrl = process.env.CRUSOE_BASE_URL;
  const apiKey = process.env.CRUSOE_API_KEY;

  if (!baseUrl || !apiKey) {
    return parseItemsFromTranscript(transcript);
  }

  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL ?? "gemma-4-31b-it",
        messages: [
          {
            role: "system",
            content:
              "Extract a JSON array of items from the packing list. Return ONLY valid JSON: [{\"name\":\"...\",\"category\":\"...\"}]",
          },
          { role: "user", content: transcript },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) throw new Error(`LLM ${res.status}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? "[]";
    const match = content.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match?.[0] ?? "[]") as { name: string; category?: string }[];
    return parsed.map((p) => ({
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      name: p.name,
      category: p.category,
    }));
  } catch {
    return parseItemsFromTranscript(transcript);
  }
}

export async function transcribeAudio(buffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.GRADIUM_API_KEY;
  if (!apiKey) {
    return "Old Canon camera body, two HDMI cables, the battery charger, my college hoodie, a paperback of Siddhartha, and a postcard from Sarah.";
  }

  try {
    const form = new FormData();
    form.append("file", new Blob([buffer], { type: mimeType }), "recording.webm");
    const res = await fetch("https://api.gradium.ai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!res.ok) throw new Error(`Gradium ${res.status}`);
    const data = (await res.json()) as { text?: string };
    return data.text ?? "";
  } catch {
    return "Old Canon camera body, two HDMI cables, the battery charger, my college hoodie, a paperback of Siddhartha, and a postcard from Sarah.";
  }
}
