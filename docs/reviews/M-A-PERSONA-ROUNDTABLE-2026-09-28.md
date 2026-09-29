# M-A Persona Roundtable — 2026-09-28 (Crux Sacra 1 / Garme)

**Owner:** Jesús Botello
**Lane:** Muse Code (coordinator)
**Tree tip at analysis:** `4d298f5` (main, live **v109** + DOC-001 Help→guide link)
**Live URLs:** https://crux-sacra.fjfaithandfamily.com/game/ and https://crux-sacra-game.pages.dev/game/
**Coordination:** `docs/AI-DISPATCH.md` (no cloud agents)

## Facts gathered (do not invent)

| Fact | Evidence |
|------|----------|
| Live version | v109 (`game.js?v=109`, `ASSET_VERSION "109"`), both hosts 200, zero drift |
| `npm run gate` | PASS (ranch flag present, unlock cheats absent, LOCKED/BLOQUEADO present) |
| El Rancho | Public-locked (`ranchWorldPublicReady = false`); Help + guide say reserved |
| Credits | Muse Code on all 5 surfaces (README, manual EN+ES, provenance EN+ES, in-game title+modal, guide EN+ES) |
| Help→guide link | Live both hosts (`./guide.html`, new tab); DOC-001 ACCEPTED |
| Persona payloads | 5/5 recovered complete from run journal (35 findings); workflow synthesis step failed on ref-passing, consolidated by coordinator instead (see Method) |
| Spot-verified by coordinator | P0 aria-hidden block, Angie/Nangie drift, travel-banner code path, EN-only message sample |

---

## Executive verdict

### Ship-worthy, with a bilingual-debt and a11y backlog: **Almost**

**Why Almost (not Ready, not Blocked):**
- **Ready enough to keep live:** v109 is stable, locked, cheat-free, documented; no crashers or exploits found; difficulty curve is sound (designer: monotonic ramps + breather stages — keep).
- **Not Ready to call done:** ~50/57 level intros + all defeat hints are English-only (breaks the bilingual promise where kids need it most); touch controls ship inside `aria-hidden`; travel banner can advertise locked El Rancho; guide says "Angie" but the game shows "Nangie".
- **Not Blocked:** nothing red on live, gate, or drift. Ranked packets below are sized for AG implement + Muse verify.

---

## 1. Child Player Advocate (8yo, bilingual)

**Lens:** fun, clear, fair for a Spanish-dominant 8-year-old.

| Finding | Evidence | Severity |
|---------|----------|----------|
| ~50 of ~57 level intro messages are English-only; story hints missed in Spanish | game.js:760-1855 (e.g. :815, :851, :870, :889); few carry ES (:760, :797, :908) | **P1** |
| Every defeat/hint message English-only; retry appends English "Lives left:" | game.js:2491-2516, :2607 via :4617-4629 | **P1** |
| Difficulty menu gives no rules (real effects hide in code); "Baby" label can insult an 8yo | index.html:72-88; game.js:702-706; guide.html:62 punts to parents | **P1** |
| HUD English-only, shrinks to 11px on phones | game.js:2745-2750; index.html:271-284; style.css:75-85,983-990 | P2 |
| Pause overlay English-only and keyboard-only ("P to resume") — phone kids lack keys | game.js:4631-4643; index.html:288-292 | P2 |
| Help Powers/Hazards sections English-only (unlike Goal/Controls); missing accents model wrong Spanish | index.html:202-205,221-224; game.js:703-705,723,797,2106 | P2 |
| Menu overload: 29 hero buttons, lock reason only in 9px badge; El Rancho looks tappable but JS-dead | index.html:50-53,93-122; game.js:96,2090-2108; style.css:732-746 | P2 |
| Tacalache intro line menaces naughty kids; canvas message bar can clip long lines | game.js:5266-5276, :4617-4629; index.html:214-216 | P3 |

**Verdict:** Playable and charming, but Spanish-dominant kids lose the story and the teaching moments. Bilingual pass is the highest kid-impact work.

---

## 2. Parent / Guardian Advocate

**Lens:** safety, values, screen-time, guide parents can trust.

| Finding | Evidence | Severity |
|---------|----------|----------|
| Guide says "Angie" but game shows "Nangie" — parents can't follow unlock steps (coordinator CONFIRMED: game.js:625, index.html:94,127) | game.js:625; index.html:94,127 vs manual:57,64 + guide:68-69 | P2 |
| Manual omits Mr Chuy→Don Maro mapping; one redemption path undiscoverable | game.js:66 + :5226-5235 vs manual:58-69 | P2 |
| No in-game content note for frightening material (Devil, Tacalache threat, Llorona/Coco) | index.html:217; game.js:4678, :5269; guidance only in guide | P2 |
| No in-game break/session reminder; guidance lives only in guide text | manual:80; guide:62; no timer logic in game.js | P3 |
| Title-screen credit line shorter than full credits (omits Image Generation + approval) | index.html:26 vs :257, manual:27 | P3 |
| Reset Progress sits beside Start; single confirm guards full wipe | index.html:159-164; game.js:2047,2050-2051 | P3 |
| El Rancho button lacks pre-JS locked markup; brief selectable flash possible | index.html:50-53 vs game.js:94-100,2090-2123 | P3 |

**Verdict:** Values and safety posture are good; the guide needs the Nangie + Don Maro corrections before parents hit them.

## 3. Skeptic QA

**Lens:** locks, cheats, state bugs, edge cases — falsify the safety story.

| Finding | Evidence | Severity |
|---------|----------|----------|
| Travel banner advertises locked El Rancho after Guadalajara (banner uses lock-blind `nextWorldSketch`, routing skips ranch) — coordinator CONFIRMED code path | game.js:2412, :2442-2447 vs :2457, :2463-2466; adjacency :298-315 | **P1** |
| El Rancho button ships unlocked in HTML; renders selectable until JS locks it (no exploit — selectWorld refuses) | index.html:50 vs :62,66; game.js:2096-2099, :2120-2123 | P2 |
| Clearing a world as a redeemed hero shows "became X" but persists no unlock (fallback keys fail persist guard) | game.js:5235-5237, :77, :5218-5221, :2625-2626 | P3 |
| `closeFinalSequence` has no re-entrancy guard (skip-click + video-ended); double invoke replays victory audio | game.js:5250-5251, :5193-5208, :2614 | P3 |

**Verdict:** Lock/cheat story holds (no exploits); the travel banner is the one player-visible logic bug. pages.dev second-host check timed out from the reviewer sandbox only — coordinator verifies pages.dev healthy separately.

---

## 4. Game Designer

**Lens:** progression pacing, unlock economy, difficulty curve, reward feel.

| Finding | Evidence | Severity |
|---------|----------|----------|
| No mid-world checkpoint: boss death forces full-world replay (worst on 8-stage elcoco) | game.js:2322, :2348-2377, :2580-2583, :5037 | **P1** |
| Holy Land gate demands all 7 active regular worlds, zero partial credit — long grind to endgame | game.js:97-100, :2078-2079, :2082-2084 | **P1** |
| One unlock per full clear vs ~20 locked slots forces heavy replay; redeemed replays recycle fallback pool | game.js:5215-5223, :78-90, :2463-2466 | P2 |
| Surprise-pair rules mostly undocumented (only Don Lalo in guide; angeliux + srJoe/lordSanty/donaNene chains code-only) | game.js:5226-5233, :59; guide:69-70; index.html:110-118 | P2 |
| Late cross-load spike: hard elcoco boss can demand 13 crosses/stage under fail pressure | game.js:2701, :1537, :3177, :3192-3198, :2916-2918 | P2 |
| Saints endgame is thin (3 stages, one bg, below-peak speeds) after the all-worlds gate | game.js:328-332, :1676-1719 vs :1536, :1659 | P3 |
| No persistent score/totals; reward feel rests on unlock videos alone | game.js:2747, :2323, :2333-2334, :2981, :2991 | P3 |
| Difficulty curve itself is sound — keep the shape, fix checkpoints/gates around it | speeds 58→102, bosses 120→194; breathers :906,:1116,:1460,:1795 | — |

**Verdict:** Core loop and curve are right; soften the grind (checkpoints, gate credit) before adding content.

---

## 5. Mobile + Accessibility Advocate

**Lens:** touch, viewports, keyboard/aria, bilingual UI, contrast.

| Finding | Evidence | Severity |
|---------|----------|----------|
| Touch buttons hidden from assistive tech: `aria-hidden=true` wraps 4 focusable buttons (coordinator CONFIRMED static markup; needs runtime-toggle check) | index.html:285-291; #stick :286 no role/keyboard | **P0** |
| Pinch-zoom + text selection blocked globally | index.html:5; style.css:19-20 | **P1** |
| Canvas + HUD have no accessible alternative or announcements (one live region only) | index.html:17, :271-284, :165 | **P1** |
| Selection state color-only, no pressed semantics; overlays lack dialog roles (~70-button tab order) | index.html:30,75,93; style.css:710-717; index.html:18,167 | **P1** |
| Touch targets below 44px in compact breakpoints (32–42px) | style.css:1088-1096, :1222-1235, :938-942 | **P1** |
| Bilingual gaps: HUD/end/help EN-only strings; guide declares lang=en over Spanish half | index.html:272-283, :267-268, :203-204; guide.html:2, :80 | P2 |
| Short-landscape hides context, shrinks text; dimmed controls hurt legibility | style.css:208-214, :1051-1054, :1178-1188, :954, :1203 | P2 |
| Contrast risks on locked/dimmed/translucent text | style.css:719-746, :172-176, :345-349 | P2 |

**Verdict:** Biggest structural gap in the roundtable. A focused a11y pass (controls exposure, zoom, targets, live regions) before any feature work.

## Consolidated backlog (ranked by severity, then kid-impact)

| # | Item | Source | Packet |
|---|------|--------|--------|
| 1 | Expose touch controls to assistive tech (fix `aria-hidden` over focusable buttons; role/keyboard for stick) | a11y P0 | RT-A11Y-1 |
| 2 | Travel banner must skip locked worlds (reuse lock-aware routing) | QA P1 | RT-LOGIC-1 |
| 3 | Level intros + defeat/hint/retry messages bilingual (ES for ~50 intros, all hints) | child P1 ×2 | RT-I18N-1 |
| 4 | Difficulty menu: show real rules per tier; reconsider "Baby" label | child P1 | RT-I18N-1 |
| 5 | Mid-world checkpoint (or boss-retry without full replay) | design P1 | RT-DESIGN-1 (needs Owner tuning call) |
| 6 | Holy Land gate partial credit (e.g. N-of-7) | design P1 | RT-DESIGN-1 (needs Owner tuning call) |
| 7 | Allow pinch-zoom; relax global text-selection block | a11y P1 | RT-A11Y-1 |
| 8 | Canvas/HUD accessible alternative + live announcements | a11y P1 | RT-A11Y-2 |
| 9 | Selection pressed-semantics + dialog roles for overlays | a11y P1 | RT-A11Y-2 |
| 10 | 44px touch targets in compact breakpoints | a11y P1 | RT-A11Y-2 |
| 11 | Fix "Angie"→"Nangie" + add Mr Chuy→Don Maro in manual/guide (EN+ES) | parent P2 ×2 | RT-DOCS-1 (quick) |
| 12 | HUD/pause/help bilingual completion + accent fixes + guide `lang=es` | child/a11y P2 | RT-I18N-2 |
| 13 | Document surprise pairs/chains (angeliux, srJoe/lordSanty/donaNene) or hint in-menu | design P2 | RT-DOCS-1 |
| 14 | Pre-JS locked markup for El Rancho button (match Holy Land/Saints) | QA/parent P2-P3 | RT-LOGIC-1 |
| 15 | In-game content note for frightening material + break reminder | parent P2-P3 | RT-DOCS-2 (Owner voice) |
| 16 | Unlock-per-clear economy + cross-load spike review | design P2 | RT-DESIGN-2 (Owner tuning call) |
| 17 | Message/persist mismatch on redeemed-hero replay; final-sequence guard | QA P3 ×2 | RT-LOGIC-2 |
| 18 | Reset-button placement; title-credit parity; Saints/score ideas | parent/design P3 | backlog, no packet yet |

## Next packets (boarded one at a time)

- **RT-DOCS-1** (AG): Nangie + Don Maro doc fix + surprise-chain docs (EN+ES, manual + guide). Small, safe, first.
- **RT-LOGIC-1** (AG): travel-banner lock skip + pre-JS El Rancho locked markup. Player-visible bug.
- **RT-I18N-1** (AG): bilingual level intros/defeat/difficulty. Largest kid-impact; needs careful ES copy.
- **RT-A11Y-1/2, RT-DESIGN-1/2**: queued; DESIGN items need Owner tuning calls first.

## Method note

Five persona reviewers ran read-only (shared checkout) and submitted structured findings (35 total, 0 unresolved except one sandbox-only curl timeout, closed by coordinator). The workflow's synthesis step received only placeholder ref summaries, so the coordinator consolidated from the run journal instead and spot-verified the four highest-risk claims in source. Future rounds: reviewers must write findings to files and return paths (refs do not carry payload bodies).

