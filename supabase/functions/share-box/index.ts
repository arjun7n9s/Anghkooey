import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, options } from "../_shared/cors.ts";
import { requireUser } from "../_shared/db.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const { supabase, user } = await requireUser(req);
    const { qrToken, email, action } = await req.json();

    if (!qrToken || !email || !["add", "remove"].includes(action)) {
      return json({ error: "qrToken, email, action required" }, 400);
    }

    const { data: box, error: ownerErr } = await supabase
      .from("boxes")
      .select("id, account_id, shared_with")
      .eq("qr_token", qrToken)
      .eq("account_id", user.id)
      .single();

    if (ownerErr || !box) return json({ error: "Box not found or not yours" }, 403);

    const { data: targetId, error: lookupErr } = await supabase.rpc("account_id_for_email", {
      addr: email.trim(),
    });
    if (lookupErr) throw lookupErr;
    if (!targetId) {
      return json({ error: "No account with that email — ask them to sign up first" }, 404);
    }
    if (targetId === user.id) return json({ error: "That's your own email" }, 400);

    const current: string[] = box.shared_with ?? [];
    const next =
      action === "add"
        ? Array.from(new Set([...current, targetId as string]))
        : current.filter((id: string) => id !== targetId);

    const { error: upErr } = await supabase.from("boxes").update({ shared_with: next }).eq("id", box.id);
    if (upErr) throw upErr;

    return json({ shared_with: next, action });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return json({ error: msg }, status);
  }
});
