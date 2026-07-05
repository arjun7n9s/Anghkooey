# Pre-Demo Checklist

Run through this **30 minutes before** you present.

## Environment

- [ ] Web dev server running: `cd apps/mobile && npx expo start --web --port 8082`
- [ ] Browser open at http://localhost:8082 (logged in)
- [ ] Second monitor / projector shows **Dashboard** route
- [ ] Phone charged, APK installed (or use browser responsive mode)

## Supabase / API

- [ ] `EXPO_PUBLIC_SUPABASE_URL` and anon key in `apps/mobile/.env`
- [ ] `GRADIUM_API_KEY` set in Supabase Edge Function secrets
- [ ] Edge functions deployed: `resolve-qr`, `ingest-voice`, `find`, `transcribe`, `share-box`, `ensure-account`
- [ ] Shared boxes migration applied (`shared_with` column exists)

## Demo accounts

- [ ] Primary account signed in (your account)
- [ ] Partner account exists: `partner-demo@anghkooey.com` / `demo-password-123`
- [ ] At least **2 boxes logged** with items + location hints (or use existing Box #14 data)

## Physical setup

- [ ] **24 QR labels printed** from Print sheet (or at least 3–4 for locate demo)
- [ ] QRs stuck on real boxes or printed on paper for camera sweep
- [ ] Good lighting for camera locate

## Rehearsal

- [ ] Ran full demo flow once end to end
- [ ] Timed under 95 seconds
- [ ] Share flow tested: A shares → B scans A's QR → B sees items
- [ ] Find returns results for "camera" or "cables"
- [ ] Dashboard shows stats + grid on big screen

## APK (optional, for phone demo)

- [ ] Rebuilt after latest changes: `eas build -p android --profile preview`
- [ ] APK installed on demo phone
- [ ] Phone on Wi‑Fi (not airplane mode)

## Post-demo security

- [ ] Rotate any secrets pasted in chat (Gradium, Supabase service role, DB password)
