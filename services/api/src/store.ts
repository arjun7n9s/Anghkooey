import type { Box, BoxItem, FindResult } from "../../../packages/shared/src/index.js";
import { DEMO_ACCOUNT_ID, DEMO_BOX_14_TOKEN } from "../../../packages/shared/src/index.js";
import { v4 as uuid } from "uuid";

const boxes = new Map<string, Box>();
const byToken = new Map<string, string>();

function seedDemo() {
  const boxId = uuid();
  const items: BoxItem[] = [
    { id: uuid(), name: "Old Canon camera body", category: "electronics" },
    { id: uuid(), name: "Two HDMI cables", category: "electronics" },
    { id: uuid(), name: "Battery charger", category: "electronics" },
    { id: uuid(), name: "College hoodie", category: "clothing" },
    { id: uuid(), name: "Paperback of Siddhartha", category: "books" },
    { id: uuid(), name: "Postcard from Sarah", category: "memorabilia" },
  ];
  const box: Box = {
    id: boxId,
    accountId: DEMO_ACCOUNT_ID,
    label: "Box #14",
    qrToken: DEMO_BOX_14_TOKEN,
    lastTouched: "2026-03-12T10:00:00Z",
    locationHint: "Top shelf, far right",
    rawTranscript:
      "Old Canon camera body, two HDMI cables, the battery charger, my college hoodie, a paperback of Siddhartha, and a postcard from Sarah.",
    items,
  };
  boxes.set(boxId, box);
  byToken.set(box.qrToken, boxId);

  for (let i = 1; i <= 13; i++) {
    const id = uuid();
    const token = `demo-box-${i}`;
    const b: Box = {
      id,
      accountId: DEMO_ACCOUNT_ID,
      label: `Box #${i}`,
      qrToken: token,
      lastTouched: "2026-01-15T10:00:00Z",
      items: [{ id: uuid(), name: "Misc household items" }],
    };
    boxes.set(id, b);
    byToken.set(token, id);
  }
}

seedDemo();

export function getBoxByToken(token: string): Box | null {
  const id = byToken.get(token);
  if (!id) return null;
  return boxes.get(id) ?? null;
}

export function getAllBoxes(accountId: string): Box[] {
  return [...boxes.values()].filter((b) => b.accountId === accountId);
}

export function createBox(accountId: string, label: string): Box {
  const id = uuid();
  const token = `qr-${uuid().slice(0, 8)}`;
  const box: Box = {
    id,
    accountId,
    label,
    qrToken: token,
    lastTouched: new Date().toISOString(),
    items: [],
  };
  boxes.set(id, box);
  byToken.set(token, id);
  return box;
}

export function saveVoiceLog(token: string, transcript: string, items: BoxItem[]): Box | null {
  const box = getBoxByToken(token);
  if (!box) return null;
  box.rawTranscript = transcript;
  box.items = items;
  box.lastTouched = new Date().toISOString();
  boxes.set(box.id, box);
  return box;
}

export function findItems(query: string, accountId: string): FindResult[] {
  const q = query.toLowerCase();
  const results: FindResult[] = [];

  for (const box of boxes.values()) {
    if (box.accountId !== accountId) continue;
    const haystack = [
      box.label,
      box.rawTranscript ?? "",
      ...box.items.map((i) => i.name),
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(q) && !q.split(/\s+/).some((w) => w.length > 3 && haystack.includes(w))) {
      continue;
    }

    const score =
      (box.rawTranscript?.toLowerCase().includes(q) ? 10 : 0) +
      box.items.filter((i) => i.name.toLowerCase().includes(q)).length * 5;

    results.push({
      boxId: box.id,
      label: box.label,
      qrToken: box.qrToken,
      lastTouched: box.lastTouched,
      snippet: box.rawTranscript?.slice(0, 120) ?? box.items.map((i) => i.name).join(", "),
      items: box.items,
      score: score || 1,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

export function generateQrSheet(accountId: string, count: number): Box[] {
  const created: Box[] = [];
  for (let i = 0; i < count; i++) {
    created.push(createBox(accountId, `Box #${boxes.size + 1}`));
  }
  return created;
}
