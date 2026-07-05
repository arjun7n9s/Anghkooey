import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, options } from "../_shared/cors.ts";
import { requireUser } from "../_shared/db.ts";

// Gradium Speech-to-Text (REST). Docs: https://docs.gradium.ai/guides/speech-to-text-rest
// One-shot: POST raw audio body, x-api-key header, NDJSON streamed back.
const GRADIUM_ASR_URL = "https://api.gradium.ai/api/post/speech/asr";

async function transcribe(buffer: ArrayBuffer, mimeType: string): Promise<string> {
  const apiKey = Deno.env.get("GRADIUM_API_KEY");
  if (!apiKey) throw new Error("Voice transcription not configured on server");

  const config = encodeURIComponent(JSON.stringify({ language: "en" }));
  const res = await fetch(`${GRADIUM_ASR_URL}?json_config=${config}`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": mimeType || "audio/wav",
    },
    body: buffer,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Transcription failed (${res.status})${detail ? `: ${detail.slice(0, 140)}` : ""}`);
  }

  // NDJSON: each line is {type, text?, end_text?, error?}
  const raw = await res.text();
  const parts: string[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const msg = JSON.parse(trimmed) as { type?: string; text?: string; error?: string };
      if (msg.error) throw new Error(msg.error);
      if (msg.type === "text" && msg.text) parts.push(msg.text);
    } catch {
      // ignore non-JSON keepalive lines
    }
  }

  const text = parts.join("").replace(/\s+/g, " ").trim();
  if (!text) throw new Error("No speech detected");
  return text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    await requireUser(req);

    const contentType = req.headers.get("content-type") ?? "";
    let buffer: ArrayBuffer;
    let mimeType = "audio/wav";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("audio");
      if (!file || !(file instanceof File)) return json({ error: "audio required" }, 400);
      buffer = await file.arrayBuffer();
      mimeType = file.type || mimeType;
    } else {
      buffer = await req.arrayBuffer();
      mimeType = contentType || mimeType;
    }

    const text = await transcribe(buffer, mimeType);
    return json({ text, durationMs: 0 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return json({ error: msg }, status);
  }
});
