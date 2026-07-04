# Anghkooey — 5 Hour Parallel Sprint

**Goal:** Demo-ready P0 — scan QR → voice log → chips → find → camera highlight

| Hour | Gate |
|------|------|
| 0:00 | Scaffold + types + schema committed |
| 1:00 | API: ingest + find (mock OK) |
| 2:00 | Mobile: scan + log UI wired |
| 3:00 | Gradium STT + LLM parse live |
| 4:00 | Find + seed Box #14 + QR print |
| 5:00 | Rehearse 90s demo |

## Streams (parallel)

| Stream | Owner | Folder |
|--------|-------|--------|
| S0 | Lead | `packages/shared` |
| S1 | Backend | `supabase/` + `services/api` |
| S2 | Mobile | `apps/mobile` |
| S3 | Voice/LLM | `services/api/src/voice`, `parse` |
| S4 | Demo | `scripts/seed-demo.ts`, QR print |

## P0 only (everything else cut)

- [x] Account: demo user via env (skip OAuth for 5h)
- [ ] QR tokens + scan resolve
- [ ] Voice log → items → save
- [ ] Find query → box card
- [ ] Camera QR glow (target box)
- [ ] Print A4 sheet (HTML print)
- [ ] Pre-seed Box #14 Canon items

## CUT

- Dashboard motion grid
- Family share
- Voice clone
- AR pre-record (use QR glow)
- Cognee
