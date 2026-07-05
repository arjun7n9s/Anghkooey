import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, options } from "../_shared/cors.ts";
import { ensureUserBoxes, requireUser } from "../_shared/db.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();

  try {
    const { supabase, user } = await requireUser(req);
    const boxes = await ensureUserBoxes(supabase, user.id);
    return json({ ok: true, count: boxes.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return json({ error: msg }, status);
  }
});
