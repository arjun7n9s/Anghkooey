# Anghkooey — Product Ideation (RAISE 2026)

**One line:** Account-bound QR labels + voice logging = find anything in your physical stuff without Sharpies or memory.

---

## 1. The problem (real, universal, daily-ish)

Everyone with a home, move, garage, or storage unit lives this loop:

1. Pack a box → write `MISC` on it  
2. Stack it somewhere  
3. Weeks/months later: *"Where's the Canon charger / winter coats / that book Sarah gave me?"*  
4. Open wrong boxes → give up → buy duplicate  

**Existing apps (Sortly, etc.):** photo + manual typing. Wrong interface while hands are full, tape in mouth, alone in a garage.

**Anghkooey's bet:** The label is **account-bound QR**. The log is **voice**. The find is **semantic search + camera**. Same physical workflow — redesigned interface.

---

## 2. Product thesis

| Layer | What it is |
|-------|------------|
| **Identity** | Every QR/NFC sticker maps to `(account_id, box_id)` — globally unique, non-guessable token |
| **Capture** | Scan → speak → structured items — bound to that box |
| **Recall** | "Find my X" across all boxes — not grep on titles |
| **Locate** | Camera highlights the right QR in the room (AR or simple overlay) |
| **Share** | Private by default; family / box / public modes |

**Not:** a spreadsheet, a photo album, or a chatbot over PDFs.

---

## 3. User journey (five beats — each is a designed moment)

```
PRINT → PACK → FORGET → FIND → SHARE
```

### Beat A — Print (once)
- Sign up → generate **A4 sheet** (24 QRs) tied to account  
- Cut, stick on boxes (or order NFC stickers later)  
- **Design:** printable sheet feels official — Anghkooey wordmark, box numbers, cut guides  

### Beat B — Pack (killer moment)
- Scan QR → mic opens immediately (no form)  
- Speak while taping: *"Canon body, two HDMI cables, charger, college hoodie, Siddhartha, postcard from Sarah"*  
- Gradium STT → LLM parses → **chips confirm** each item  
- Optional: Gradium voice clone replays your log later  

**Why voice wins:** hands busy, eyes on box, cognitive load on *what* not *how to type*.

### Beat C — Forget (default state)
- User does nothing. Data sits in Supabase. Box last-touched timestamp updates on scan/log.

### Beat D — Find (demo moment #2)
- Voice or text: *"Find the old Canon camera"*  
- App returns: **Box #14 · last touched Mar 12 · quote from your log**  
- Tap **Find it** → camera mode  

### Beat E — Share
- Invite partner → they see allowed boxes  
- Or share one box link for a move helper  
- Scan still proves physical box; permissions prove digital access  

---

## 4. What makes Anghkooey different (competitive wedge)

| | Sortly / manual apps | Anghkooey |
|--|----------------------|-----------|
| Input while packing | Tap-type items | **Voice-first** |
| Label | Barcode you buy / DIY | **Account-bound QR you print** |
| Find | Scroll lists | **Semantic "find my X"** |
| Locate in room | ❌ | **Camera + QR lock** (AR story) |
| Share | Weak / export | **First-class permissions** |
| Intimacy | ❌ | **Voice clone re-read** (Gradium) |

**Open territory:** voice-logged physical inventory with **your** QR namespace — not enterprise asset tracking.

---

## 5. Hackathon reality check (honest)

### Disqualification risks from RAISE rules

| Rule | Anghkooey risk | Mitigation |
|------|----------------|------------|
| **Dashboard as main feature** | ⚠️ High if demo opens web grid | **Lead demo on phone:** scan → voice → find. Dashboard = 15s B-roll only |
| **Basic RAG** | ⚠️ "Find camera" as one embedding call | **Structured search agent:** parse intent → SQL filter → semantic rank → cite box + quote |
| **Image analyzer** | ⚠️ if product is "AI sees objects" | **QR is identity**, camera finds **your sticker**, not generic object ID |
| Streamlit | Don't use | Next.js or Expo only |

### Scope vs 24–30h

Ruthless split:

**P0 — must demo (90 sec):**
1. Auth + account  
2. QR generate (PDF or on-screen) + scan  
3. Voice log → items → save to box  
4. Text/voice find → one result card  
5. Pre-recorded AR clip OR live QR highlight in frame  

**P1 — if ahead:**
6. Family share (one invite flow)  
7. Dashboard grid (motion)  
8. Voice clone playback  

**P2 — pitch slides only:**
- NFC stickers  
- Public box  
- Cognee cross-box patterns  
- Stats dashboard  

### AR honesty

- **Live demo:** voice log + find + **simple camera QR detection** (bounding box glow when token matches)  
- **Judge video:** polished AR sweep clip for Beat 4  
- Say: *"Location in room via QR lock; full AR path on roadmap"*

---

## 6. Architecture (recommended)

```
┌─────────────────────────────────────────────────────────┐
│  Mobile (Expo / React Native)          PRIMARY PRODUCT   │
│  Scan · Voice log · Find · Camera locate               │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Backend (Supabase + Edge Functions OR small API)        │
│  Auth · boxes · items · qr_tokens · shares               │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   Gradium STT/TTS   Gemma/Vultr LLM   Postgres
   (parse list)     (find + rank)     (source of truth)

┌─────────────────────────────────────────────────────────┐
│  Web dashboard (Next.js + Framer Motion)  COMPANION     │
│  Print sheet · grid browse · desktop find · share admin   │
└─────────────────────────────────────────────────────────┘
```

**QR token model:**
```
qr_payload = sign(account_id, box_id, nonce)  // or UUID in DB
scan → resolve token → auth check → box detail
```

**Item parse prompt (Gemma):**
- Input: transcript  
- Output: JSON `[{ name, category?, notes? }]`  
- Store raw transcript for "find" citations  

**Find agent (not basic RAG):**
1. Parse query → entities + intent  
2. SQL: items ILIKE + full-text on transcript  
3. LLM rerank top-k boxes with **quote** from original voice log  
4. Return box_id, label, last_touched, snippet  

**Optional Cognee:** cross-box queries (*"what haven't I opened in 2 years?"*) — post-MVP slide.

---

## 7. Interaction design (what judges feel)

### Mobile — dark, calm, physical
- **Scan screen:** full-bleed camera, minimal chrome  
- **Voice log:** large waveform (Gradium stream), chips **pop in** as parsed (Reanimated spring)  
- **Find result:** card feels like a **shipping label** — box #, date, your words quoted  
- **Camera locate:** pulsing ring on detected QR — not cluttered AR mesh  

### Dashboard — motion-rich but not the hero
- Box grid **blooms** when new box logged (Framer Motion layoutId)  
- Category chips filter with shared element transition  
- **Voice bar** at top for desktop find (Gradium STT in browser)  
- Print sheet: clean A4 PDF generator  

### Sound
- Success: soft chime when items saved  
- Find: TTS reads result (Gradium calm voice)  
- Clone (P1): same line in user's voice — *"intimate moment"*  

---

## 8. Sharing model (keep simple for MVP)

| Mode | MVP | Behavior |
|------|-----|----------|
| **Private** | ✅ default | Only account owner |
| **Family** | P1 | Invite email → role `viewer` on all boxes |
| **Box share** | P1 | Share link scoped to `box_id` |
| **Public box** | P2 slide | Community pantry etc. |

Permission check on every scan: token → box → ACL.

---

## 9. 90-second demo (refined)

| Beat | Time | Live vs recorded |
|------|------|------------------|
| Title | 0–10s | **Anghkooey** — *A memory layer for your physical stuff* |
| Scan + voice log | 10–25s | **Live phone** |
| Find voice query | 25–40s | **Live** (pre-seeded account) |
| Camera locate | 40–60s | **Pre-recorded clip** OR live QR glow |
| Share invite | 60–75s | **UI mock** or 1-tap invite sent |
| Close | 75–90s | Title card |

**Stage props:** real box, printed QR sheet, phone.  
**Pre-seed:** account with 10–15 boxes; Box #14 has Canon items from script.

---

## 10. Stack (locked for hackathon)

| Piece | Choice | Why |
|-------|--------|-----|
| Mobile | **Expo (RN)** | One codebase, camera + mic, booth demo |
| Web | **Next.js + Framer Motion** | Dashboard + print PDF |
| Backend | **Supabase** | Auth magic link, Postgres, RLS, fast |
| Voice | **Gradium** | STT + TTS + clone (P1) |
| LLM | **Gemma @ Crusoe** or **Vultr** | Parse list + find rerank |
| Build | **Cursor** | Track sponsor |
| Skip MVP | Cognee, NFC, full AR SLAM | Slides |

---

## 11. Name & narrative

**Anghkooey** — memory for physical things. A memory layer for the stuff you boxed up and forgot.

Pitch close:
> *"Sharpies forget. Spreadsheets lie. Anghkooey remembers what you said when you packed the box."*

Subtitle (demo cards):
> *A memory layer for your physical stuff.*

---

## 12. Open decisions (decide before build)

1. **Mobile-only demo** vs mobile + dashboard split screen? → **Recommend mobile live, dashboard on laptop side screen**  
2. **QR format:** URL `anghkooey.app/b/{token}` vs custom scheme `anghkooey://b/{token}` → **URL works in demo + print**  
3. **Live camera locate:** expo-camera + QR library only (no ARKit mesh) → **Yes for MVP**  
4. **Team size?** → drives parallel plan next doc  

---

## 13. Next doc (when ready to build)

- `ANGHKOOEY-PARALLEL-PLAN.md` — streams: Mobile / Backend / Voice / Web / Demo seed  
- Supabase schema SQL  
- QR PDF generator spec  

---

*Dear Diary planning archived in `/hangover` (gitignored).*
