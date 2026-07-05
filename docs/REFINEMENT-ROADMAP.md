# Anghkooey — Refinement Roadmap

You have runway. Work in this order — each phase is shippable on its own.

---

## Phase 1 — Polish what exists ✅

- [x] Custom fonts (Fraunces + DM Sans)
- [x] Home stats (boxes logged / total)
- [x] Append vs replace when re-logging a box
- [x] Haptic feedback on locate match
- [x] Hero card contrast fixes
- [x] Pull-to-refresh on home

## Phase 2 — Trust & completeness (in progress)

- [x] Delete individual items from a box
- [x] Rename box label
- [x] Empty states with guided copy on find/boxes
- [ ] Offline banner when Supabase unreachable
- [x] Better parse: quantities ("two HDMI cables")
- [x] Improved find scoring (item-level matching)

## Phase 3 — Design track wow (in progress)

- [x] Fraunces box numbers on log screen (48px hero)
- [x] Specimen card component for find results
- [x] Print sheet matches app typography (Fraunces + DM Sans)
- [ ] Subtle paper grain texture
- [x] Chip stagger animation on save
- [x] Mic pulse ring while recording

## Phase 4 — Demo & judges (+1h)

- [ ] 90-second demo script doc with screen order
- [ ] Pre-demo checklist (Gradium key, APK, printed QRs)
- [ ] Optional: TTS for find reply (`expo-speech`)
- [ ] Rebuild APK after each major phase

## Phase 5 — Stretch (if time)

- [ ] LLM item parsing (OpenAI-compatible endpoint)
- [ ] Share box with partner (RLS + invite)
- [ ] NFC tags alongside QR
- [ ] Deep link `anghkooey.app/b/{token}`

---

## Known issues to watch

| Issue | Fix |
|-------|-----|
| Old APK missing new screens | Rebuild EAS after Phase 1 |
| Account still has demo Box #14 data | Re-log boxes or clear `box_items` in dashboard |
| Web: no camera/mic in browser | Test voice on phone; use typed log on web |
| `sb_publishable` key format | Fall back to JWT anon key if auth breaks |

---

## How to test each phase

1. **Print** → save PDF → scan one QR from phone screen
2. **Log** → voice + location → verify in **My boxes**
3. **Find** → search item → **Locate** → haptic + glow
4. **Append** → log again with new items → old items remain
