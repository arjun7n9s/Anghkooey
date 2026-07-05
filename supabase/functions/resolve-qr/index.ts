import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, options } from "../_shared/cors.ts";
import { ensureUserBoxes, loadBox, requireUser } from "../_shared/db.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();

  try {
    const { supabase, user } = await requireUser(req);
    await ensureUserBoxes(supabase, user.id);

    const url = new URL(req.url);
    const token = url.searchParams.get("token") ?? url.pathname.split("/").pop();
    if (!token || token === "resolve-qr") {
      return json({ error: "token required" }, 400);
    }

    const box = await loadBox(supabase, decodeURIComponent(token));
    if (!box) return json({ error: "Unknown QR" }, 404);
    return json({ box });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return json({ error: msg }, status);
  }
});
