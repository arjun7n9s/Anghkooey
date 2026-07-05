import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { requireUser } from "../_shared/db.ts";

const APP_SCHEME = "anghkooey://b";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { supabase } = await requireUser(req);
    const { data: boxes, error } = await supabase
      .from("boxes")
      .select("label, qr_token")
      .order("created_at", { ascending: true })
      .limit(24);

    if (error) throw error;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Anghkooey QR Sheet</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet"/>
<style>
  *{box-sizing:border-box}
  body{font-family:'DM Sans',sans-serif;background:#F4EDE4;color:#1A1614;padding:24px;margin:0}
  h1{font-family:'Fraunces',serif;font-size:32px;margin:0 0 4px;letter-spacing:-0.02em}
  p{color:#5C534A;margin:0 0 24px;font-size:14px}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .cell{border:1px dashed #9A8F82;padding:12px;text-align:center;background:#fff;border-radius:8px;page-break-inside:avoid}
  .label{font-family:'Fraunces',serif;font-weight:600;margin-top:8px;font-size:14px}
  .token{font-size:8px;color:#9A8F82;word-break:break-all;margin-top:4px}
  @media print{body{padding:12px}}
</style></head><body>
<h1>Anghkooey</h1>
<p>Cut along dashed lines. Stick on your boxes, then scan with the app to log by voice.</p>
<div class="grid">${(boxes ?? [])
      .map(
        (b) => `<div class="cell">
<img alt="qr" width="100" height="100" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${APP_SCHEME}/${b.qr_token}`)}"/>
<div class="label">${b.label}</div>
<div class="token">${b.qr_token}</div>
</div>`,
      )
      .join("")}</div>
<script>window.onload=()=>window.print()</script>
</body></html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return new Response(JSON.stringify({ error: msg }), {
      status: msg === "Unauthorized" ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
