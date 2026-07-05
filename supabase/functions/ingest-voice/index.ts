import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { parseItemsFromTranscript } from "../_shared/parse.ts";
import { json, options } from "../_shared/cors.ts";
import { loadBox, requireUser } from "../_shared/db.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const { supabase, user } = await requireUser(req);
    const body = await req.json();
    const { qrToken, transcript, mode = "replace" } = body as {
      qrToken?: string;
      transcript?: string;
      mode?: "replace" | "append";
    };

    if (!qrToken || !transcript) {
      return json({ error: "qrToken and transcript required" }, 400);
    }

    const box = await loadBox(supabase, qrToken);
    if (!box) return json({ error: "Unknown QR" }, 404);
    if (box.accountId !== user.id) {
      return json({ error: "Only the box owner can edit contents" }, 403);
    }

    const parsed = parseItemsFromTranscript(transcript);
    const now = new Date().toISOString();

    if (mode === "append") {
      const existingNames = new Set(box.items.map((i) => i.name.toLowerCase()));
      const newItems = parsed.filter((p) => !existingNames.has(p.name.toLowerCase()));
      if (newItems.length > 0) {
        const { error: insertErr } = await supabase.from("box_items").insert(
          newItems.map((p) => ({ box_id: box.id, name: p.name, category: p.category ?? null })),
        );
        if (insertErr) throw insertErr;
      }
      const mergedTranscript = box.rawTranscript
        ? `${box.rawTranscript} · ${transcript.trim()}`
        : transcript.trim();
      await supabase
        .from("boxes")
        .update({ raw_transcript: mergedTranscript, last_touched: now })
        .eq("id", box.id);
    } else {
      await supabase.from("box_items").delete().eq("box_id", box.id);
      const { error: insertErr } = await supabase.from("box_items").insert(
        parsed.map((p) => ({ box_id: box.id, name: p.name, category: p.category ?? null })),
      );
      if (insertErr) throw insertErr;
      await supabase
        .from("boxes")
        .update({ raw_transcript: transcript.trim(), last_touched: now })
        .eq("id", box.id);
    }

    const updated = await loadBox(supabase, qrToken);
    return json({ box: updated, items: updated?.items ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return json({ error: msg }, status);
  }
});
