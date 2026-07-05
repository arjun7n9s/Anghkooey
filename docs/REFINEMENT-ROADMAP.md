# Anghkooey — Refinement Roadmap

---

## Phase 1 — Polish what exists ✅

- [x] Custom fonts (Fraunces + DM Sans)
- [x] Home stats (boxes logged / total)
- [x] Append vs replace when re-logging a box
- [x] Haptic feedback on locate match
- [x] Hero card contrast fixes
- [x] Pull-to-refresh on home

## Phase 2 — Trust & completeness ✅

- [x] Delete individual items from a box
- [x] Rename box label
- [x] Empty states with guided copy on find/boxes
- [x] Offline banner when Supabase unreachable
- [x] Better parse: quantities ("two HDMI cables")
- [x] Improved find scoring (item-level matching)
- [x] **Shared boxes** — invite by email, RLS read access

## Phase 3 — Design track wow ✅

- [x] Fraunces box numbers on log screen (48px hero)
- [x] Specimen card component for find results
- [x] Print sheet matches app typography (Fraunces + DM Sans)
- [x] Subtle paper grain texture (web)
- [x] Chip stagger animation on save
- [x] Mic pulse ring while recording
- [x] **Browser dashboard** — wordmark, stats, box grid

## Phase 4 — Demo & judges (in progress)

- [x] 90-second demo script doc with screen order
- [x] Pre-demo checklist (Gradium key, APK, printed QRs)
- [x] TTS for find reply (web SpeechSynthesis + expo-speech)
- [ ] Rebuild APK after major phases

## Phase 5 — Stretch (if time)

- [ ] LLM item parsing (OpenAI-compatible endpoint)
- [ ] NFC tags alongside QR
- [ ] Deep link `anghkooey.app/b/{token}`

---

## Known issues to watch

| Issue | Fix |
|-------|-----|
| Old APK missing share + dashboard | Rebuild EAS (`eas build -p android --profile preview`) |
| Web: no camera/mic in browser | Test voice on phone; use typed log on web |
| Partner account | `partner-demo@anghkooey.com` / `demo-password-123` |

---

## How to test

1. **Print** → save PDF → scan one QR
2. **Log** → voice + location → verify in **My boxes**
3. **Find** → search → **Listen** → **Locate**
4. **Share** → partner email → incognito login → scan same QR
5. **Dashboard** → `/dashboard` on big screen
