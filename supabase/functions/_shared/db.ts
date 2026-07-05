import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export function userClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Missing Authorization header");

  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );
}

export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

export async function requireUser(req: Request) {
  const supabase = userClient(req);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return { supabase, user: data.user };
}

type DbBox = {
  id: string;
  account_id: string;
  label: string;
  qr_token: string;
  last_touched: string;
  location_hint?: string | null;
  raw_transcript?: string | null;
};

type DbItem = {
  id: string;
  name: string;
  category?: string | null;
};

export function mapBox(box: DbBox, items: DbItem[]) {
  return {
    id: box.id,
    accountId: box.account_id,
    label: box.label,
    qrToken: box.qr_token,
    lastTouched: box.last_touched,
    locationHint: box.location_hint ?? undefined,
    rawTranscript: box.raw_transcript ?? undefined,
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category ?? undefined,
    })),
  };
}

export async function loadBox(supabase: SupabaseClient, qrToken: string) {
  const { data: box, error } = await supabase
    .from("boxes")
    .select("*")
    .eq("qr_token", qrToken)
    .maybeSingle();

  if (error) throw error;
  if (!box) return null;

  const { data: items, error: itemErr } = await supabase
    .from("box_items")
    .select("id, name, category")
    .eq("box_id", box.id);

  if (itemErr) throw itemErr;
  return mapBox(box as DbBox, (items ?? []) as DbItem[]);
}

export async function ensureUserBoxes(supabase: SupabaseClient, userId: string) {
  const { count, error: countErr } = await supabase
    .from("boxes")
    .select("*", { count: "exact", head: true });

  if (countErr) throw countErr;
  if ((count ?? 0) > 0) {
    const { data: boxes } = await supabase.from("boxes").select("*").order("created_at");
    return boxes ?? [];
  }

  const rows = Array.from({ length: 24 }, (_, i) => ({
    account_id: userId,
    label: `Box #${i + 1}`,
    qr_token: `qr-${crypto.randomUUID().slice(0, 8)}`,
    location_hint: null,
  }));

  const { data: inserted, error } = await supabase.from("boxes").insert(rows).select("*");
  if (error) throw error;
  return inserted ?? [];
}
