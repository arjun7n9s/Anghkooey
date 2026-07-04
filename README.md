# Anghkooey

Voice-logged physical inventory — scan your QR, say what's inside, find it later.

## Quick start (5h sprint)

```powershell
# Terminal 1 — API
cd services/api
npm install
npm run dev

# Terminal 2 — Mobile (use LAN IP for physical device)
cd apps/mobile
npm install
# set EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:8787 in .env or app config
npx expo start
```

**QR print sheet:** http://127.0.0.1:8787/print/sheet  
**Demo token:** `demo-box-14-canonical` (pre-seeded Canon items)

## Demo path

1. Home → **Scan** → skip to Box #14 OR scan printed QR  
2. **Hold to log** (or "Use demo script") → item chips appear  
3. **Find something** → "Canon camera" → Box #14  
4. **Find it → camera** → sweep until QR glows green  

## Monorepo

| Path | Purpose |
|------|---------|
| `services/api` | Express API, in-memory store (+ Supabase later) |
| `apps/mobile` | Expo app |
| `packages/shared` | Shared types |
| `supabase/schema.sql` | Postgres when ready |
| `docs/planning/5H-PARALLEL-PLAN.md` | Sprint plan |

## Stack

Gradium STT · Gemma/Crusoe parse (optional) · Expo · Express · Cursor
