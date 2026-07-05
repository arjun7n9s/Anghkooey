import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, options } from "../_shared/cors.ts";
import { requireUser } from "../_shared/db.ts";

async function transcribe(buffer: ArrayBuffer, mimeType: string): Promise<string> {
  const apiKey = Deno.env.get("GRADIUM_API_KEY");
  if (!apiKey) throw new Error("Voice transcription not configured on server");

  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimeType }), "recording.m4a");
  const res = await fetch("https://api.gradium.ai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Transcription failed (${res.status})`);
  const data = (await res.json()) as { text?: string };
  const text = data.text?.trim();
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
    let mimeType = "audio/m4a";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("audio");
      if (!file || !(file instanceof File)) return json({ error: "audio required" }, 400);
      buffer = await file.arrayBuffer();
      mimeType = file.type || mimeType;
    } else {
      buffer = await req.arrayBuffer();
    }

    const text = await transcribe(buffer, mimeType);
    return json({ text, durationMs: 0 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return json({ error: msg }, status);
  }
});
