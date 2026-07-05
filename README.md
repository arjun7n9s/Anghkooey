# Anghkooey

Voice-logged physical inventory — scan your QR, say what's inside, find it later.

## Cloud + Android APK (hackathon demo)

No laptop on stage. Deploy Supabase + build APK:

See **[docs/SUPABASE-DEPLOY.md](docs/SUPABASE-DEPLOY.md)** for:

- `supabase login` → `supabase link --project-ref pdbtnwekwxcoxktfnsbt`
- `supabase db push` + `supabase functions deploy`
- `eas build -p android --profile preview`

Mobile uses **Supabase Auth** (email/password) + Edge Functions (Gradium STT, regex parse, find).

## Quick start (local dev)

```powershell
# Terminal 1 — API (optional fallback)
cd services/api
npm install
npm run dev

# Terminal 2 — Mobile
cd apps/mobile
npm install
copy .env.example .env
npx expo start
```

**QR print sheet (local):** http://127.0.0.1:8787/print/sheet

## Demo path (real app flow)

1. Sign in → **Print your labels** (24 QRs tied to your account)
2. Stick labels on boxes → **Scan & log by voice** (or type items + save location hint)
3. **My boxes** — see everything logged
4. **Find something** → tap result → **Locate** with camera + your saved location hint

## Demo path (quick test)

## Monorepo

| Path | Purpose |
|------|---------|
| `services/api` | Express API (local dev fallback) |
| `apps/mobile` | Expo app + Supabase auth |
| `packages/shared` | Shared types |
| `supabase/migrations` | Postgres schema + RLS |
| `supabase/functions` | Edge Functions (cloud API) |
| `docs/SUPABASE-DEPLOY.md` | Deploy checklist |

## Stack

Gradium STT · regex item parse · Supabase Auth + Edge Functions · Expo · Cursor
