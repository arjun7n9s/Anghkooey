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
  accountId?: string;
  isShared?: boolean;
};

export type BoxDetail = BoxSummary & {
  items: { name: string; category?: string }[];
};

function itemCountFromRelation(items: unknown): number {
  if (!items || !Array.isArray(items) || items.length === 0) return 0;
  const first = items[0] as { count?: number; name?: string };
  if (typeof first.count === "number") return first.count;
  return items.length;
}

function mapRow(row: {
  id: string;
  label: string;
  qr_token: string;
  last_touched: string;
  location_hint?: string | null;
  raw_transcript?: string | null;
  account_id?: string;
  box_items?: { count: number }[] | { id: string; name: string; category?: string | null }[];
}, userId?: string): BoxSummary {
  const itemCount = itemCountFromRelation(row.box_items);

  return {
    id: row.id,
    label: row.label,
    qrToken: row.qr_token,
    lastTouched: row.last_touched,
    locationHint: row.location_hint ?? undefined,
    itemCount,
    preview: row.raw_transcript?.slice(0, 80),
    accountId: row.account_id,
    isShared: userId ? row.account_id !== userId : undefined,
  };
}

export async function listBoxes(): Promise<BoxSummary[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  const { data, error } = await supabase
    .from("boxes")
    .select("id, label, qr_token, last_touched, location_hint, raw_transcript, account_id, box_items(count)")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row, userId)).sort((a, b) => boxSortKey(a.label) - boxSortKey(b.label));
}

export async function listBoxesDetailed(): Promise<BoxDetail[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  const { data, error } = await supabase
    .from("boxes")
    .select("id, label, qr_token, last_touched, location_hint, raw_transcript, account_id, box_items(name, category)")
    .order("last_touched", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const summary = mapRow(row, userId);
    const rawItems = (row.box_items ?? []) as { name: string; category?: string | null }[];
    return {
      ...summary,
      items: rawItems.map((i) => ({ name: i.name, category: i.category ?? undefined })),
    };
  });
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
