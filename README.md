# Anghkooey

A memory layer for your physical stuff. Scan a QR, speak what's inside, find it later — and share with anyone.

## The problem

Every adult has boxes they stopped opening. Storage units, garages, parent basements, the closet of winter clothes. When you need something, you don't know where it is. Handwritten labels fade. Photos are too slow. Memory fails, especially after six months.

## The redesign

Stick a QR on a box. Scan with the app. Speak what's inside. The app remembers — every item, every word you said, where you last put the box. Find anything by asking, by scanning, or by pointing your camera at the room. **Share a box with a partner** — they can scan your QR and see what's inside.

## Demo (90 seconds)

See **[docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md)** and **[docs/PRE-DEMO-CHECKLIST.md](docs/PRE-DEMO-CHECKLIST.md)**.

| Beat | Screen |
|------|--------|
| Login | Open your archive |
| Dashboard | Stats + grid of every box (judges' screen) |
| Voice log | Speak 12 items in 20 seconds |
| Find | "Where's the old camera?" → Box + location |
| Locate | Sweep the room — the right box glows |
| Share | Partner scans your QR, sees your items |

## Quick start (local dev)

```powershell
cd apps/mobile
npm install
copy .env.example .env
npx expo start --web --port 8082
```

Open **http://localhost:8082** — dashboard at `/dashboard`.

## Cloud + Android APK

See **[docs/SUPABASE-DEPLOY.md](docs/SUPABASE-DEPLOY.md)** for Supabase deploy + EAS build.

```powershell
eas build -p android --profile preview
```

## Monorepo

| Path | Purpose |
|------|---------|
| `apps/mobile` | Expo app (web + Android) |
| `supabase/functions` | Edge Functions (Gradium STT, find, share) |
| `supabase/migrations` | Postgres schema + RLS |
| `docs/` | Design system, demo script, deploy guide |

## Stack

- **Mobile:** Expo + React Native + expo-router
- **Voice:** Gradium STT · browser/native TTS for find replies
- **Backend:** Supabase Auth + Postgres + Edge Functions + RLS
- **Design:** Fraunces + DM Sans · warm paper palette
