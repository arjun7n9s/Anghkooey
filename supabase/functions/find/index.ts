import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, options } from "../_shared/cors.ts";
import { loadBox, requireUser } from "../_shared/db.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const { supabase } = await requireUser(req);
    const body = await req.json();
    const query = (body as { query?: string }).query?.trim();
    if (!query) return json({ error: "query required" }, 400);

    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter((w) => w.length > 2);

    const { data: boxes, error } = await supabase
      .from("boxes")
      .select("id, label, qr_token, last_touched, location_hint, raw_transcript")
      .order("last_touched", { ascending: false });

    if (error) throw error;

    const { data: allItems, error: itemsErr } = await supabase
      .from("box_items")
      .select("id, box_id, name, category");

    if (itemsErr) throw itemsErr;

    const itemsByBox = new Map<string, { id: string; name: string; category?: string }[]>();
    for (const item of allItems ?? []) {
      const list = itemsByBox.get(item.box_id) ?? [];
      list.push({ id: item.id, name: item.name, category: item.category ?? undefined });
      itemsByBox.set(item.box_id, list);
    }

    const results: {
      boxId: string;
      label: string;
      qrToken: string;
      lastTouched: string;
      locationHint?: string;
      snippet: string;
      items: { id: string; name: string; category?: string }[];
      score: number;
    }[] = [];

    for (const box of boxes ?? []) {
      const itemList = itemsByBox.get(box.id) ?? [];
      const haystack = [
        box.label,
        box.location_hint ?? "",
        box.raw_transcript ?? "",
        ...itemList.map((i) => i.name),
      ]
        .join(" ")
        .toLowerCase();

      const exact = haystack.includes(q);
      const wordHits = words.filter((w) => haystack.includes(w)).length;
      const itemExact = itemList.some((i) => i.name.toLowerCase().includes(q));
      const itemWordHits = itemList.filter((i) =>
        words.some((w) => i.name.toLowerCase().includes(w)),
      ).length;

      if (!exact && wordHits === 0 && !itemExact && itemWordHits === 0) continue;

      const score =
        (exact ? 25 : 0) +
        wordHits * 10 +
        (itemExact ? 20 : 0) +
        itemWordHits * 8 +
        (box.raw_transcript?.toLowerCase().includes(q) ? 12 : 0);

      results.push({
        boxId: box.id,
        label: box.label,
        qrToken: box.qr_token,
        lastTouched: box.last_touched,
        locationHint: box.location_hint ?? undefined,
        snippet:
          (box.raw_transcript?.slice(0, 120) ??
            itemList.map((i) => i.name).join(", ")) ||
          "No items logged yet",
        items: itemList,
        score: score || 1,
      });
    }

    results.sort((a, b) => b.score - a.score);
    const top = results[0];
    const when = top ? new Date(top.lastTouched).toLocaleDateString() : "";
    const where = top?.locationHint ? ` · ${top.locationHint}` : "";
    const voiceReply = top
      ? `${top.label}, last touched ${when}${where}. You said: "${top.snippet.slice(0, 80)}…"`
      : "I couldn't find that in your boxes. Try scanning and logging a box first.";

    return json({ results, voiceReply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return json({ error: msg }, status);
  }
});
