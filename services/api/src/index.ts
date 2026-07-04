import cors from "cors";
import express from "express";
import multer from "multer";
import {
  DEMO_ACCOUNT_ID,
  type FindRequest,
  type IngestVoiceRequest,
} from "../../../packages/shared/src/index.js";
import {
  findItems,
  generateQrSheet,
  getAllBoxes,
  getBoxByToken,
  saveVoiceLog,
} from "./store.js";
import { parseItemsWithLlm, transcribeAudio } from "./voice.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "anghkooey-api" });
});

app.get("/qr/resolve/:token", (req, res) => {
  const box = getBoxByToken(req.params.token);
  if (!box) return res.status(404).json({ error: "Unknown QR" });
  res.json({ box });
});

app.get("/boxes", (req, res) => {
  const accountId = (req.query.accountId as string) ?? DEMO_ACCOUNT_ID;
  res.json({ boxes: getAllBoxes(accountId) });
});

app.post("/ingest/voice", async (req, res) => {
  const body = req.body as IngestVoiceRequest;
  if (!body.qrToken || !body.transcript) {
    return res.status(400).json({ error: "qrToken and transcript required" });
  }
  const items = await parseItemsWithLlm(body.transcript);
  const box = saveVoiceLog(body.qrToken, body.transcript, items);
  if (!box) return res.status(404).json({ error: "Unknown QR" });
  res.json({ box, items });
});

app.post("/voice/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "audio required" });
  const text = await transcribeAudio(req.file.buffer, req.file.mimetype || "audio/webm");
  res.json({ text, durationMs: 0 });
});

app.post("/find", async (req, res) => {
  const body = req.body as FindRequest;
  if (!body.query) return res.status(400).json({ error: "query required" });
  const accountId = body.accountId ?? DEMO_ACCOUNT_ID;
  const results = findItems(body.query, accountId);
  const top = results[0];
  const voiceReply = top
    ? `${top.label}, last touched ${new Date(top.lastTouched).toLocaleDateString()}. You said: ${top.snippet.slice(0, 80)}...`
    : "I couldn't find that in your boxes.";
  res.json({ results, voiceReply });
});

app.post("/qr/generate", (req, res) => {
  const count = Math.min(Number(req.body.count) || 24, 48);
  const accountId = req.body.accountId ?? DEMO_ACCOUNT_ID;
  const boxes = generateQrSheet(accountId, count);
  res.json({ boxes });
});

app.get("/print/sheet", (req, res) => {
  const accountId = (req.query.accountId as string) ?? DEMO_ACCOUNT_ID;
  const boxes = getAllBoxes(accountId).slice(0, 24);
  const baseUrl = process.env.PUBLIC_APP_URL ?? "https://anghkooey.app";

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Anghkooey QR Sheet</title>
  <style>
    body{font-family:system-ui;padding:24px}
    h1{font-size:20px;margin-bottom:8px}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
    .cell{border:1px dashed #999;padding:12px;text-align:center;page-break-inside:avoid}
    .label{font-weight:600;margin-top:8px;font-size:12px}
    .token{font-size:9px;color:#666;word-break:break-all}
  </style></head><body>
  <h1>Anghkooey — QR Sheet</h1><p>Cut and stick on your boxes. Scan with the app to log by voice.</p>
  <div class="grid">${boxes
    .map(
      (b) => `<div class="cell">
      <img alt="qr" width="100" height="100" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${baseUrl}/b/${b.qrToken}`)}"/>
      <div class="label">${b.label}</div>
      <div class="token">${b.qrToken}</div>
    </div>`
    )
    .join("")}</div>
  <script>window.onload=()=>window.print()</script>
  </body></html>`;

  res.type("html").send(html);
});

const port = Number(process.env.API_PORT) || 8787;
app.listen(port, () => {
  console.log(`Anghkooey API http://127.0.0.1:${port}`);
});
