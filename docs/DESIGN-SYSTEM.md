# Anghkooey — Design System (RAISE Art / Design Track)

**Concept:** *A moving-day archive* — every screen feels like a label you’d stick on a box, not a settings app.

**One-line pitch to judges:** “We designed the interface like physical catalog cards — voice, memory, and find are emotional beats, not form fields.”

---

## Why the current UI loses (honest audit)

| Problem | Why it hurts the track |
|--------|-------------------------|
| Generic dark + gold buttons | Looks like every AI hackathon app |
| System font only | No typographic identity |
| Centered stack of rectangles | No hierarchy, no story, no delight |
| “Find my X” / “Hold to log” | Functional copy, zero personality |
| No motion | Voice product feels dead until mic works |
| Login = same as home | No sense of entering *your* archive |

---

## Creative direction: **Catalog of Forgotten Things**

**Mood:** Kinfolk × library call slip × moving-day Polaroid margin notes  
**Not:** Notion dark mode, fintech, warehouse scanner UI

**Metaphor ladder (use everywhere):**
- Box = **specimen card**
- Item chip = **sticker label**
- Find result = **pull card from drawer**
- Mic = **ink stamp moment** (you’re marking the box)
- Scan = **align the label in the frame**

---

## Color system

Warm paper base (light mode primary — reads as *designed*, not dev-tool):

| Token | Hex | Use |
|-------|-----|-----|
| `paper` | `#F4EDE4` | Screen background |
| `paperDeep` | `#E8DDD0` | Cards, inset areas |
| `ink` | `#1A1614` | Primary text |
| `inkSoft` | `#5C534A` | Secondary text |
| `stamp` | `#C44B37` | Primary CTA, mic active, scan lock |
| `wax` | `#2E5E4E` | Success, “found it”, locate glow |
| `faded` | `#9A8F82` | Placeholders, hints |
| `line` | `#D4C8B8` | Borders, dashed cut guides |

**Dark variant** (optional locate/scan only): `ink` bg + `paper` text — use sparingly for camera screens.

**Category chip colors** (item type):
- electronics → `#4A6670`
- clothing → `#8B6E5A`
- books → `#6B5B7A`
- memorabilia → `#A65D57`
- default → `#5C534A`

---

## Typography

Load via `expo-font` (Google Fonts):

| Role | Font | Weight | Size |
|------|------|--------|------|
| Display / wordmark | **Fraunces** | 700 | 40–48 |
| Screen titles | **Fraunces** | 600 | 28–32 |
| Body / UI | **DM Sans** | 400–600 | 15–17 |
| Labels / caps | **DM Sans** | 600 | 11–12, letter-spacing 1.2 |
| Box numbers | **Fraunces** | 700 | 56 (hero on log screen) |

**Wordmark treatment:** `Anghkooey` with slight negative letter-spacing; subtitle always human: *“Where your stuff remembers you.”*

---

## Layout & shape language

- **Page margin:** 24px; **card padding:** 20px
- **Radius:** cards `16`, chips `999`, primary buttons `14`
- **Borders:** 1px `line`; **dashed** `line` for “cut here” / demo zones
- **Shadow (RN):** soft offset `{ width: 0, height: 2 }`, opacity 0.08 — paper lifting off desk
- **Safe areas:** always respect; home uses bottom-weighted layout (thumb zone)

---

## Motion (minimal but memorable)

| Moment | Animation |
|--------|-----------|
| Chips after voice log | Stagger fade + slide up 8px, 40ms apart |
| Find result | Card “slides out” from bottom, 200ms ease-out |
| Mic hold | Stamp ring pulse (scale 1 → 1.06), `stamp` color |
| Locate match | Corner brackets + soft `wax` glow pulse |
| Screen enter | 150ms fade (no slide — feels calm) |

Use `react-native-reanimated` if time; else `Animated` API.

---

## Screen-by-screen

### 1. Login — *“Open your archive”*
- Top: small caps `YOUR BOX MEMORY`
- Hero: Fraunces wordmark + one-line poem subtitle
- Form inside **Archive Card** (paperDeep, border, shadow)
- Primary: full-width **stamp** button “Enter archive”
- Secondary link: understated, not blue hyperlink style
- Remove default Expo header “login” text (`headerShown: false`)

### 2. Home — *“Two doors, one story”*
- **Not** two equal buttons stacked
- Layout:
  - Top third: wordmark + tagline
  - **Hero card — Scan** (large, stamp accent left bar, icon + “Scan a label” + subcopy)
  - **Secondary card — Find** (paperDeep, magnifier metaphor)
  - Footer: dashed box “Demo · Box #14” (hackathon path)
- Sign out: tiny inkSoft text, top-right — not center bottom

### 3. Log (voice) — *“The killer moment”*
- Giant **Box #14** as display number (Fraunces 56)
- Sub: “Tell this box what’s inside.”
- **Mic:** circular 160px, stamp when idle → deeper pulse when recording
- Copy while recording: “Listening…” in caps label style
- Transcript: **quote block** with left border (like pulled from journal)
- Chips: category-colored pills, wrap with gap
- Demo script: dashed border button “Use demo voice” (judge fallback)
- Success: subtle wax check + “Saved to Box #14”

### 4. Find — *“Pull the right drawer”*
- Title: “What did you forget?”
- Input: large, no harsh rectangle — soft paper inset
- Suggested chips: “Canon camera”, “HDMI cables”, “postcard from Sarah”
- Result **Specimen Card:**
  - Box label + last touched date
  - Italic snippet from *their* voice log
  - Full-width **Locate** button (wax)

### 5. Scan — *“Align the label”*
- Camera full bleed
- **Viewfinder:** four corner brackets (not full overlay dim)
- Bottom sheet (paper): “Point at your Anghkooey label”
- Demo skip: dashed pill at bottom

### 6. Locate — *“There it is”*
- Same viewfinder; on match → brackets turn **wax** + haptic
- Top banner: “Box #14 · found” slides down

---

## Shared components (build once)

```
components/
  Screen.tsx          — paper bg, safe area, optional grain
  ArchiveCard.tsx     — elevated paper card
  PrimaryButton.tsx   — stamp fill
  GhostButton.tsx     — bordered
  ItemChip.tsx        — category color + name
  BoxSpecimenCard.tsx — find result
  MicButton.tsx       — hold-to-record + states
  LabelFrame.tsx      — scan/locate corners
  SectionLabel.tsx    — caps micro typography
```

---

## QR print sheet (brand extension)

Match app: Fraunces box numbers, dashed cut lines, `paper` background, small Anghkooey wordmark. Judges see **one system** from sticker → app.

---

## Judge-facing demo narrative (90s)

1. **Login** — “Designed like opening a catalog, not signing into SaaS.”
2. **Home** — “Two intentional actions — scan while packing, find when forgetting.”
3. **Log** — hold mic → chips land like stickers → *designed confirmation*
4. **Find** — specimen card with *your words* quoted back
5. **Locate** — camera frame locks — *physical + digital meet*

---

## Implementation order (~3–4 hours)

| Phase | Time | Deliver |
|-------|------|---------|
| **A** | 45m | `theme.ts`, fonts, `Screen`, `ArchiveCard`, `PrimaryButton` |
| **B** | 45m | Login + Home redesign |
| **C** | 60m | Log + Find + chips + specimen card |
| **D** | 45m | Scan/locate frames + micro-motion |
| **E** | 30m | Print sheet HTML match + polish pass |

---

## Do / Don’t

**Do:** warm paper, serif display, category color, quoted transcripts, dashed “demo” zones  
**Don’t:** purple gradients, generic “AI assistant” bubbles, dashboard grids, cold pure black UI

---

## Reference mood (for implementation)

- Moving day sunlight on cardboard
- Library checkout slip typography
- Muji label restraint
- One bold accent (`stamp`) used sparingly
