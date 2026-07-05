import { boxSortKey } from "./qr";

export type QrSize = "small" | "medium" | "large";

export type QrSheetBox = { label: string; qrToken: string };

const APP_SCHEME = "anghkooey://b";

// Columns per A4 row for each size. Smaller QR => more columns => more per page.
export const SIZE_COLUMNS: Record<QrSize, number> = {
  small: 6,
  medium: 4,
  large: 3,
};

export const SIZE_LABELS: Record<QrSize, string> = {
  small: "Small · 6 per row",
  medium: "Medium · 4 per row",
  large: "Large · 3 per row",
};

// Rough per-page capacity for the download hint.
export function perPage(size: QrSize): number {
  return { small: 42, medium: 20, large: 12 }[size];
}

function qrImg(token: string, px: number): string {
  const data = encodeURIComponent(`${APP_SCHEME}/${token}`);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${px}x${px}&margin=0&data=${data}`;
}

export function buildQrSheetHtml(boxes: QrSheetBox[], size: QrSize, autoPrint = false): string {
  const cols = SIZE_COLUMNS[size];
  const px = { small: 90, medium: 140, large: 200 }[size];
  const labelSize = { small: 11, medium: 14, large: 16 }[size];

  const sorted = [...boxes].sort((a, b) => boxSortKey(a.label) - boxSortKey(b.label));

  const cells = sorted
    .map(
      (b) => `<div class="cell">
  <img alt="qr" src="${qrImg(b.qrToken, px)}" />
  <div class="label">${escapeHtml(b.label)}</div>
  <div class="token">${escapeHtml(b.qrToken)}</div>
</div>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Anghkooey QR Labels</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; background: #FE3C00; color: #151210; padding: 24px; margin: 0; }
  .head { margin-bottom: 20px; }
  h1 { font-family: 'Fraunces', serif; font-size: 34px; margin: 0 0 4px; letter-spacing: -0.02em; }
  p { color: #151210; opacity: 0.8; margin: 0; font-size: 14px; }
  .grid { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 14px; }
  .cell {
    border: 2px dashed #151210; padding: 10px; text-align: center;
    background: #FFF3E0; border-radius: 12px; page-break-inside: avoid;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .cell img { width: 100%; height: auto; max-width: ${px}px; }
  .label { font-family: 'Fraunces', serif; font-weight: 700; font-size: ${labelSize}px; }
  .token { font-size: 8px; color: #7a6f63; word-break: break-all; }
  @media print { body { background: #fff; padding: 0; } .cell { background: #fff; } }
</style></head><body>
<div class="head">
  <h1>Anghkooey</h1>
  <p>Cut along the dashed lines. Stick one on each box, then scan with the app to log by voice.</p>
</div>
<div class="grid">${cells}</div>
${autoPrint ? "<script>window.onload=()=>window.print()</script>" : ""}
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
