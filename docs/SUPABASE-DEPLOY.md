# Supabase deploy (Anghkooey)

Project ref: `pdbtnwekwxcoxktfnsbt`

## 1. Install CLI

```powershell
npm i -g supabase
```

## 2. Login and link

```powershell
supabase login
cd C:\Users\arjun\Desktop\RAISE
supabase link --project-ref pdbtnwekwxcoxktfnsbt
```

## 3. Copy secrets locally

Copy `.env.example` → `.env` and fill in:

- `SUPABASE_SERVICE_ROLE_KEY` — Dashboard → Settings → API
- `DATABASE_URL` — replace `[YOUR-PASSWORD]` with your DB password
- `GRADIUM_API_KEY` — **rotate the key you pasted in chat**; set fresh key only in `.env`

## 4. Push database schema

```powershell
supabase db push
```

## 5. Set Edge Function secrets

```powershell
supabase secrets set GRADIUM_API_KEY=your_rotated_key
```

Supabase injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` automatically in production.

## 6. Deploy functions

```powershell
supabase functions deploy resolve-qr
supabase functions deploy ingest-voice
supabase functions deploy find
supabase functions deploy transcribe
supabase functions deploy ensure-boxes
```

## 7. Enable email auth

Dashboard → Authentication → Providers → Email → enable sign-up.

Confirmations are disabled in `supabase/config.toml` for fast hackathon signup.

## 8. Android APK (no PC at demo)

```powershell
cd apps\mobile
npm install
copy .env.example .env
npx eas login
npx eas build -p android --profile preview
```

Install the APK from the EAS build page. Sign up in-app → boxes auto-seed → scan/log/find/locate.

## Demo flow

1. Sign up / sign in
2. Tap **Demo: open Box #14** (or scan your printed QR)
3. Hold to log (Gradium STT) or **Use demo script**
4. **Find something** → “Canon camera”
5. **Find it → camera** for locate glow

## Local dev (optional)

Express API still works for laptop demos:

```powershell
# root
npm run dev:api
cd apps\mobile
# point EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8787 in .env if testing on device
npm start
```

Cloud path uses Supabase Edge Functions only — no laptop required on stage.
