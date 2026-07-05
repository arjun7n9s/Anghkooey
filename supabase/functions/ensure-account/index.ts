import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, options } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const { email, password } = await req.json();
    if (!email || !password) return json({ error: "email, password required" }, 400);

    const adminUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users`;
    const adminKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!adminKey) throw new Error("Service role not configured");

    const res = await fetch(adminUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminKey}`,
        apikey: adminKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim(), password, email_confirm: true }),
    });

    const data = await res.json();
    if (!res.ok) {
      if (data?.msg?.includes("already") || data?.error_code === "email_exists") {
        return json({ ok: true, existed: true });
      }
      return json({ error: data?.msg ?? data?.message ?? "create failed" }, res.status);
    }

    return json({ ok: true, userId: data.id });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});
