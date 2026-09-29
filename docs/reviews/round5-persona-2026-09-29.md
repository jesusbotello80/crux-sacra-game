# Round-5 Persona Review — 2026-09-29 (Crux Sacra 1, live v129)

**Owner:** Jesús Botello
**Lane:** Muse Code (coordinator)
**Tree under review:** v129 (`game.js?v=129`, SHA `fcb57267…`, zero drift both hosts)
**Inputs:** `/tmp/persona-r5-{child,parent,design,art}.md` (4/4 complete, 0 unresolved),
prior `M-A-PERSONA-ROUNDTABLE-2026-09-29.md` + `round3-kid-qa` + `round3-art-cycles`
(dedupe baseline — closed items stay closed).
**Method:** 4 read-only persona children, file artifacts, no synthesis child
(round-2 learning); coordinator read all 4 bodies in full and independently
re-verified every P1/P2 + the art P2/P3s against current code before consolidating.

## Executive verdict: Almost — one P1 blocks a clean phone-first prod call

v129 mechanics, privacy, content-note, gate, and art-cycle health all survive
falsification (details under Holds). But landscape phones — the natural
stick+buttons posture — hide the difficulty rules AND every end-screen message
(R5-01), so do not call v129 prod-ready for phone-first kids until that CSS-only
fix ships. Behind it: two kid-confusion P2s (silent locked taps with no gate
readout; "Try Again" defeat with no retry), a "Game Complete" overstatement, and
v128/v129 docs debt. One art P2 (Mexico City ≡ Bedtime Rooms videos, md5-identical
with empty per-hero maps, so the dup always plays) needs an Owner accept-or-replace
call. Everything else is P3 polish or explicit Owner tuning calls.

## 1. Child Player Advocate (ES-dominant 8yo, phone-first)

| Finding | Evidence | Sev |
|---------|----------|-----|
| Landscape hides difficulty rules + end messages (`.overlay p{display:none}`) | style.css:1108-1111; index.html:19,91,276-279 | **P1** → R5-01 |
| Locked-world taps dead silent on touch; reason only in hover tooltip | game.js:2186-2209; style.css:788 | P2 → R5-02 |
| Non-boss "Try Again" offers only Select Characters | game.js:2722,2731-2742; index.html:280-281 | P2 → R5-03 |
| Break reminder defaults masculine ("campeón") | game.js:3054 | P3 → R5-08 |
| "Reintentar Jefe" lacks article | index.html:280 | P3 → R5-08 |
| Help omits ✕ row; "Resumed / Continúa" tense mismatch | index.html:200-209; game.js:4857 | P3 → R5-08 |

**Verdict:** warm, fully playable in Spanish, kind boss defeat — fix R5-01 before prod.

## 2. Parent / Guardian Advocate

| Finding | Evidence | Sev |
|---------|----------|-----|
| Boss-retry undocumented (incl. true lives easy5/reg3/hard2) | game.js:2731-2751,:2749,:700-702; guides silent | P2 → R5-05 |
| 25-min reminder undocumented (guides say generic "take breaks") | game.js:3050-3056; guide:62; manual:91,187 | P3 → R5-05 |
| Reminder single-channel, missable mid-action; re-surface on pause | game.js:3050-3056; pause paths silent | P3 → R5-10 |
| Manifest lacks maskable icon (all `purpose:any`) | manifest:11-30 | P3 → R5-11 |
| Campaign lists name El Rancho unqualified (qualifier 2 heads below) | guide:60/:81; manual:50/:83-85 | P3 → R5-05 |

**Verdict:** trust in good shape; ship R5-05 docs before/with launch, fast-follow R5-10/R5-11.

## 3. Game Design / Playability Advocate

Curve quantified-monotonic (enemy 58→194 + `1+index*0.09` ramp × 0.82/1/1.24;
hard Bedtime boss max 12 crosses, +2 cap holds; gate pool 42 stages, any-6).

| Finding | Evidence | Sev |
|---------|----------|-----|
| One-world win shows "Game Complete" | game.js:2722 via advanceStage :2493-2510 | P2 → R5-04 |
| Non-boss "Try Again" dumps to title (same as child §3) | game.js:2722,2731-2734,:5338 | P2 → R5-03 |
| No N/6 gate readout; "6 worlds" hover-only; progressStatus reset-only | game.js:2186-2187,:2154-2158 | P2 → R5-02 |
| Non-boss wipe discards whole run (up to 8 stages, no checkpoint) | game.js:2678-2680,:2732 | P2 → R5-06 |
| Retry economy generous+infinite (full lives, ammo persists) | game.js:2746-2752; startStage :2445-2476 | P3 → Owner call |
| Saints 3 stages share one bg; "6 El Rancho" numbering collides w/ gate | game.js:334-339,:1671-1729; index.html:53-56 | P3 → R5-09 |

**Dead-ends: none.** Saints reachable, ranch excluded+locked, triple enforcement holds.
**Verdict:** ship-ready mechanics with copy debt; R5-02..04 ride the next packet.

## 4. Art / Animation / Presentation Advocate

RT3-ART-1 verified: all 8 cycle drops match prescription exactly, contact strips
eyeball healthy (leg-swing/stride alternation), sprite-audit ALL PASS (129/129).

| Finding | Evidence | Sev |
|---------|----------|-----|
| Mexico City ≡ Bedtime Rooms intro+redemption videos (md5-identical; per-hero maps EMPTY so dup always plays) | game.js:5350-5356,:5460-5461; md5 `c788cce1…` + `2b820627…`; maps `{}` :5449-5450 | P2 → R5-07 |
| Companion marches in place on hero idle (`moving=true` unconditional) | game.js:3501 vs :3496 | P3 → R5-12 |
| Saints final caption EN-only; siblings bilingual | game.js:5482-5486 | P3 → R5-08 |
| Pause "Paused. Pausado." vs help "Pause / Pausa" | game.js:4830,:4849; index.html:205 | P3 → R5-08 |
| Dead art code: 2 uncalled villain painters + redeemedWalk path | game.js:3714,:3817 (0 calls); :430,:3510-3516 (no def sets) | P3 → R5-13 |

**Verdict:** near-prod; R5-07 needs the Owner accept-or-replace call, rest is small packets.

## Consolidated backlog (ranked; deduped)

| # | Item | Source | Packet |
|---|------|--------|--------|
| R5-01 | Landscape overlay hide: exempt `#difficultyRules,#endCopy` (CSS-only) | child P1 | RT5-KID-1 |
| R5-02 | Visible gate progress (N/6 line) + locked-tap feedback | child+design P2 | RT5-KID-1 |
| R5-03 | Non-boss defeat honesty: retitle or Retry-World button | child+design P2 | RT5-KID-1 |
| R5-04 | "Game Complete" → "World Complete" (keep for final worlds) | design P2 | RT5-STRINGS-1 |
| R5-05 | Guides EN+ES: retry lives truth, 25-min reminder, rancho qualifier | parent P2/P3 | RT5-DOCS-1 |
| R5-06 | Non-boss checkpoint (retry any stage / +1 life per clear) | design P2 | Owner tuning call |
| R5-07 | Mexico City ≡ Bedtime videos: distinct or accepted reuse | art P2 | Owner call → asset swap |
| R5-08 | Strings sweep: campeona/article/help/Resumed/saints caption/Pausa/ranch suffix | child+art P3 | RT5-STRINGS-1 |
| R5-09 | Saints per-stage bgs when art exists (ranch suffix rides R5-08) | design P3 | art-dependent |
| R5-10 | Re-surface break reminder on pause overlay | parent P3 | RT5-POLISH-1 |
| R5-11 | Maskable manifest icon | parent P3 | RT5-POLISH-1 |
| R5-12 | Companion idle: pass hero `moving` (1-line draw) | art P3 | RT5-POLISH-1 |
| R5-13 | Delete dead villain painters + redeemedWalk branches | art P3 | Owner call |

**Dedupes:** non-boss defeat copy (child §3 + design §2) → R5-03; gate visibility
(child §2 + design §3) → R5-02; rancho suffix (parent §5 + design §6) → R5-08/05.
**Owner calls (no packet unless wanted):** retry economy (full lives infinite —
kind to kids, dilutes hard prestige), videos, checkpoint scope, dead-code delete.

## Holds (verified, no action)

Locks/cheats/persistence/reset; bilingual difficulty buttons + 15px caption;
pause touch-quit; boss-retry wiring/focus/lives; tú-form ES story incl. fixes;
threat-line purge; gate math + EN+ES copy; privacy (2 localStorage keys, zero
network); walk cycles (8/8 drops + eyeball); thumbs↔bg coherence; 44px targets;
EN-only HUD chips (round-3 Owner hold, untouched by design).

## Gaps (carried)

No live-device VoiceOver/TalkBack/keyboard-only pass; mp4 speech content
untranscribed (58 audio-bearing clips, round-4 scope); contrast estimated, not
instrumented; installed-PWA behavior inferred from manifest.
