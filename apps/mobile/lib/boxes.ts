import type { Box } from "./types";
import { supabase } from "./supabase";
import { boxSortKey } from "./qr";

export type BoxSummary = {
  id: string;
  label: string;
  qrToken: string;
  lastTouched: string;
  locationHint?: string;
  itemCount: number;
  preview?: string;
};

function mapRow(row: {
  id: string;
  label: string;
  qr_token: string;
  last_touched: string;
  location_hint?: string | null;
  raw_transcript?: string | null;
  box_items?: { count: number }[];
}): BoxSummary {
  return {
    id: row.id,
    label: row.label,
    qrToken: row.qr_token,
    lastTouched: row.last_touched,
    locationHint: row.location_hint ?? undefined,
    itemCount: row.box_items?.[0]?.count ?? 0,
    preview: row.raw_transcript?.slice(0, 80),
  };
}

export async function listBoxes(): Promise<BoxSummary[]> {
  const { data, error } = await supabase
    .from("boxes")
    .select("id, label, qr_token, last_touched, location_hint, raw_transcript, box_items(count)")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapRow).sort((a, b) => boxSortKey(a.label) - boxSortKey(b.label));
}

export async function updateBoxMeta(
  qrToken: string,
  patch: { locationHint?: string; label?: string },
): Promise<void> {
  const update: Record<string, string> = {};
  if (patch.locationHint !== undefined) update.location_hint = patch.locationHint;
  if (patch.label !== undefined) update.label = patch.label;

  const { error } = await supabase.from("boxes").update(update).eq("qr_token", qrToken);
  if (error) throw error;
}

export async function deleteBoxItem(itemId: string): Promise<void> {
  const { error } = await supabase.from("box_items").delete().eq("id", itemId);
  if (error) throw error;
}

export async function loadBoxByToken(qrToken: string): Promise<Box | null> {
  const { data: box, error } = await supabase.from("boxes").select("*").eq("qr_token", qrToken).maybeSingle();
  if (error) throw error;
  if (!box) return null;

  const { data: items, error: itemErr } = await supabase
    .from("box_items")
    .select("id, name, category")
    .eq("box_id", box.id);

  if (itemErr) throw itemErr;

  return {
    id: box.id,
    accountId: box.account_id,
    label: box.label,
    qrToken: box.qr_token,
    lastTouched: box.last_touched,
    locationHint: box.location_hint ?? undefined,
    rawTranscript: box.raw_transcript ?? undefined,
    items: (items ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category ?? undefined,
    })),
  };
}
