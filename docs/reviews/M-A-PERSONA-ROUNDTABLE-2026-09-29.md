# M-A Persona Roundtable — 2026-09-29 (Crux Sacra 1 / Garme)

**Owner:** Jesús Botello
**Lane:** Muse Code (coordinator)
**Tree under review:** `/tmp/cs-game-work`, branch fwd5, live **v118**
**Inputs:** `docs/reviews/round2-{child,parent,qa,design,a11y}-2026-09-29.md` (11 tops)

## Facts gathered (do not invent)

| Fact | Evidence |
|------|----------|
| Live version | v118 (`game.js?v=118`, `ASSET_VERSION 118`) |
| Locks | HOLD — triple enforcement (`updateWorldLocks` + `selectWorld` + `nextWorldKeyAfter`), pre-locked HTML (qa §1) |
| Cheats / cache | Unlock tokens absent; sole `?world=` lock-checked; every cached ref versioned incl. ~70 mp4 literals (qa §2–3) |
| Grind table | All 30 cells + gate note validated against `generateCrosses`/bases; only summary line slips (design §1–2) |
| Reset safety | Bilingual confirm, clears keys+memory, title-only; proportionate (parent §4) |
| 44px targets / live regions | All targets ≥44px; live regions polite, gated, bilingual (a11y §1, §3) |
| Persona payloads | 5/5 round-2 files inspected in full; 11 tops consolidated below |

---

## Executive verdict

### Child-ready and gate-healthy work remains: **Almost**

**Why Almost (not Ready, not Blocked):**
- **Ready enough to keep live:** locks, cheat absence, cache versioning, persistence, reset safety, 44px targets, and live regions all survive falsification; no crashers or exploits; Spanish story quality is good overall.
- **Not Ready to call done:** an ES-dominant 8yo can't match EN-only difficulty buttons to the Spanish rules in a 12px caption; phone-only kids have no touch quit path and meet ungrammatical pause Spanish; boss death still wipes whole world runs behind a 7-of-7 gate; installed PWA locks landscape + fullscreen.
- **Not Blocked:** nothing red on live, locks, or drift. Ranked packets below are sized for AG implement + Muse verify; design items need an Owner tuning call first.

---

## 1. Child Player Advocate (ES-dominant 8yo)

| Finding | Evidence | Severity |
|---------|----------|----------|
| Difficulty buttons EN-only ("Baby/Easy"…); rules caption 12px, smallest on title | index.html:77-89; style.css:659-664; game.js:5079-5083 | **P1** |
| Pause: no touch quit path for phone-only kids; desktop line ungrammatical ("P seguir · Q salir") | game.js:4710-4711, :4724 | **P1** |
| Story: "Sigan juntos" ustedes-flip (all else tú); "tocado" masculine for feminine villains | game.js:1364, :5339 | P2 |
| Start never disabled during load — impatient tap starts before assets ready | game.js:5109-5111, :5131-5157 | P2 (merged w/ QA §4) |
| Travel line EN names world / ES generic; help separator; HUD chips EN-only; "5 aguas benditas" plural | game.js:2451-2453, :2527; index.html:223, :290-293 | P3 |

**Verdict:** Playable and welcoming, but difficulty buttons, caption size, pause Spanish, touch-quit, and Start-during-load must be fixed before calling this child-ready.

---

## 2. Parent / Guardian Advocate

| Finding | Evidence | Severity |
|---------|----------|----------|
| Guide omits Don Maro / Mrs Favi exclusion: "play Mr Chuy to get Don Maro" fails when companion is Mrs Favi (pair override first) | game.js:5318-5321 vs manual:72,79; guide:79-80 | P2 |
| Tacalache "take naughty children" voice line is unreachable dead code (`startIntroSpeech` never called) — delete or rewrite before any re-enable | game.js:5346-5374, :5131-5157; no `introButton` in index.html | P3 |
| Guides don't repeat in-game content note; Bedtime Rooms (closets/bedrooms) unmentioned next to "never to frighten" | index.html:183-186 vs guide:51, manual:91-93; game.js:1396-1536 | P3 |
| Nangie→Doña Carmelina buried under "etc." in guide.html (manual documents both hops) | game.js:62, :5324; guide:79-80; manual:71,81 | P3 |
| No in-game break reminder (guide/manual text only) | no timer in game.js | P3 (unchanged r1) |

**Verdict:** Good and improved since round 1 (content note exists, Nangie consistent, Don Maro path documented). Remaining items are small guide-truth gaps + one dead-code watch item. No blocker.

---

## 3. Skeptic QA

| Finding | Evidence | Severity |
|---------|----------|----------|
| `loadStatus` error path dead-ends: `Promise.all` fails all 129 on one miss; Start stays enabled, no retry; post-failure Start → playable-looking dead end | game.js:1922-1925, :5386-5392; draw unguarded :3270, :4492 | P2 (minor) |
| Flag-flip warning: ranch→true grows gate to 8 keys, re-locks Holy Land for completers | game.js:96-101 | Release note (merged w/ design gate) |
| Ranch/final/bonus locks HOLD; cheats absent; `?v=` full coverage; persistence HOLDS | qa §1–3, §5 | — (verified, no action) |
| Character locks UI-only (`disabled`, no handler re-check; devtools-only bypass) | game.js:5061-5076 | Note (accepted) |

**Verdict:** Locks, cheat absence, cache versioning, and persistence all survive falsification. One minor finding (loadStatus dead-end) + one release note (ranch flag re-lock).

---

## 4. Game Designer

| Finding | Evidence | Severity |
|---------|----------|----------|
| No checkpoint: boss death discards whole run (up to 78 crosses regular Bedtime); crosses/life 8.3→26 regular, 43/life hard Bedtime | game.js:2329-2333, :2591, :2716; speeds :2364; fires :2384 | **P1** |
| Gate 7-of-7 zero partial credit (`.every`), longest world mandatory; ranch flip silently → 8-of-8; reward behind gate is thinnest world (Saints 3 stages) | game.js:2088-2090, :98-101 | **P1** |
| Bedtime tail: `floor(index/2)` +3 only in 8-stage world → 12/13-cross stages; hard `crossBonus` +1 double-taxes hardest mode on longest world | game.js:2716, :703 | P2 |
| Grind summary slips (rows all correct): 53 stages → 51 (48 to clear); hard 517 → 490; regular 439 incl. Saints — say so | dispatch :27-48 vs recompute | P3 (docs) |

**Verdict:** Curve shape is sound — keep it; the pain is checkpoints/gate/tail-cap, all cheaper to fix than re-tuning counts. Explicit non-recommendation: do not re-tune base `crossCount`s.

---

## 5. Mobile + Accessibility Advocate

| Finding | Evidence | Severity |
|---------|----------|----------|
| Manifest `orientation:landscape` locks installed app (WCAG 1.3.4 fail); `display:fullscreen` hides a11y chrome; no 192px/maskable icons | manifest 21 lines; index.html:6-12 | **P1** |
| Dialogs lack focus trap + `inert` background; Escape closes help only; videos lack caption tracks; intro speech lines lack transcript | game.js:4953, :5115-5121, :5358-5367; index.html:242-254 | P2 |
| `touch-action:none` on html/body + `preventDefault` blocks pinch-zoom; locked labels 0.38 opacity + 9–10px suffix ≈2–2.5:1 (informative state) | style.css:12-21, :67, :759-786; game.js:4975-5057 | P2 |
| `.title-actions` 4-col grid unstacked ≤820px (~85px cols on portrait phones); portrait HUD degraded-but-usable | style.css:232-238, :1139-1143, :1081 | P3 |

**Verdict:** PASS with 4 fixes (orientation, focus trap, pinch-zoom, locked contrast). No 44px failures. No live-region spam.

---

## Consolidated backlog (ranked by severity, then kid-impact; deduped)

| # | Item | Source | Packet |
|---|------|--------|--------|
| 1 | Boss-retry checkpoint: on boss-stage wipe, restart that stage with 1 life (one branch, no new state); optionally +1 life/stage-clear capped at max | design P1 | RT2-DESIGN-1 (Owner tuning call) |
| 2 | Gate N-of-M: 6-of-7 now (7-of-8 at ranch launch) + lock-copy tweak; never ship silent 8-of-8 — announce or exclude ranch | design P1 + qa release note | RT2-DESIGN-1 (Owner tuning call) |
| 3 | Difficulty buttons bilingual (Bebé/Fácil, Normal, Difícil) + caption ≥ readable size; fix "5 aguas benditas" plural | child P1 | RT2-KID-1 |
| 4 | Pause: on-screen touch quit path (return to select) + position cue for ▶ button | child P1 | RT2-KID-1 |
| 5 | Manifest: `orientation:any`, `display:standalone`, add 192px + maskable icons (+`id`/`scope` optional) | a11y P1 | RT2-A11Y-1 |
| 6 | ES-copy sweep: "Pulsa P para seguir · Q para salir", "Sigue junto…" (tú), "tocada/o" or rephrase, "Viajando a {mundo}", help `/` separator | child P1/P2 | RT2-COPY-1 (smallest, first) |
| 7 | Dialogs: focus trap + `inert` background + Escape-all; caption tracks + intro-speech transcript | a11y P2 | RT2-A11Y-2 |
| 8 | Scope `touch-action:none` to canvas+stick (`manipulation` elsewhere); stack `.title-actions` below ~560px | a11y P2/P3 | RT2-A11Y-1 |
| 9 | Guides (EN+ES): Don Maro/Mrs Favi exclusion clause; expand "etc." (Nangie→Carmelina, Chuy→Maro); repeat/link content note + Bedtime preview line | parent P2/P3 | RT2-COPY-1 (smallest, first) |
| 10 | Boot: disable Start until load settles; retry button on `loadStatus` error; correct grind summary (51 stages, hard 490) | qa P2 + child gap + design P3 | RT2-KID-1 + RT2-COPY-1 |
| 11 | Hard `crossBonus` 1→0 (or cap `floor(index/2)` at +2) — keep hard identity via speed/hazards | design P2 | RT2-DESIGN-1 (Owner tuning call) |
| 12 | Locked labels: opacity ≥0.60, LOCKED/BLOQUEADO ≥11px bold, same hue | a11y P2 | RT2-A11Y-1 |
| 13 | Tacalache dead code: delete `startIntroSpeech`/`speakLine` OR rewrite threat line before any re-enable (Owner call); check "Plam, plam" typo | parent P3 + child note | RT2-DEAD-1 (Owner call) |
| 14 | Backlog, no packet: in-game break reminder; bilingual HUD chips / portrait-compact HUD; danger-meter label | parent/child/a11y P3 | — |

**Dedupes applied:** Start-gating (child §3 + qa §4) → #10; ranch re-lock note (qa + design) → #2; "P seguir" (child §4 + §5) → #6; Tacalache/"Plam" (parent §5 + child §5) → #13.

**HOLDs needing no work:** world locks, cheat absence, `?v=` coverage, persistence, reset safety, 30 grind cells, 44px targets, live regions.

## Next packets (boarded one at a time)

- **RT2-COPY-1** (AG — smallest next packet, first): ES-copy sweep (#6) + guide-truth + grind-summary numbers (#9, #10-docs). Strings/docs only, no logic risk.
- **RT2-KID-1** (AG): bilingual difficulty buttons + caption size (#3), pause touch-quit (#4), Start gating + load retry (#10-code). Title/pause shell.
- **RT2-A11Y-1** (AG): manifest (#5), touch-action scope + title-actions stack (#8), locked labels (#12).
- **RT2-A11Y-2** (AG): dialog trap/inert/Escape + captions/transcript (#7).
- **RT2-DESIGN-1** (needs Owner tuning call): boss-retry (#1), gate N-of-M (#2), hard bonus (#11).
- **RT2-DEAD-1** (Owner call: delete vs rewrite): Tacalache dead code (#13).

## Gaps (carried, not verified)

- Intro/final video (mp4) audio content not inspected — any spoken lines there are outside this review.
- No live-device VoiceOver/TalkBack/keyboard-only pass (read-only review, no device run).
- Contrast ratios estimated from inspected alpha values, not instrumented (no axe/Lighthouse run).
- Installed-PWA orientation/fullscreen behavior not executed, inferred from manifest body.

## Method note

Five persona reviewers ran read-only (shared checkout) and wrote findings to `docs/reviews/round2-*-2026-09-29.md`. The coordinator inspected all five bodies in full and consolidated the 11 tops into the 14-item ranked backlog above (4 HOLDs verified, 4 dedupes, 6 packets). No git commands run.
