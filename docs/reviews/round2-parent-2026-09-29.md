# Round 2 — Parent / Guardian Review (2026-09-29)

- **Lens:** safety, values, guide parents can trust
- **Target:** `/tmp/cs-game-work`, branch fwd5, live v118 (`game.js?v=118`, `guide.html`, `docs/user-manual.md`, `game/index.html`)
- **Scope:** content-note accuracy, guide vs game truth (Nangie chains, Don Maro), reset-progress safety, Tacalache voice
- **Method:** every cited claim inspected in the file body (search located, reads verified). No git commands run.

## Verdict

Parent posture is **good and improved since round 1**: the in-game content note now exists, Nangie naming is consistent everywhere, and the Don Maro path is documented in the manual. Remaining items are small guide-truth gaps (Don Maro pairing exclusion, Nangie chain absent from guide.html examples) and one dead-code watch item (unreachable Tacalache threat line). No blocker.

## 1. Content-note accuracy — PASS (with two narrow gaps)

**In-game note exists and is accurate for reachable content** (`game/index.html:183-186`):
EN: *"villains include spooky figures (ghosts, El Coco, the Devil in Holy Land) and mild menace in villain lines… No ads, no chat, no purchases; progress stays on this device."* ES mirrors it.

Verified against `game/game.js`:
- Spooky-roster claim TRUE: La Llorona ghost hands/tears (`:2541-2542`), El Coco closet whispers/shadow socks (`:2524-2525`), the Devil as Holy Land boss with dark chains + temptation flames (`:325`, `:2518-2519`), all named in Help (`index.html:217-228`).
- "Mild menace in villain lines" is now CONSERVATIVE (overstates, safe direction): all reachable stage messages (`game.js:758-1698`) and defeat messages (`:2503-2528`) are gentle/instructional ("Collect Lux, then pray near…", "Use Holy Water before it reaches you"). There are zero reachable spoken or text villain taunts.
- "No ads, no chat, no purchases" TRUE: no `fetch`/XHR/WebSocket/purchase/chat code in `game.js`; "progress stays on this device" TRUE: only two localStorage keys, `cruxSacraUnlockedRedeemed` + `cruxSacraWorldsPassed` (`game.js:91-92, :2031-2050`).

**Gaps:**
1. **P3 — Guides don't repeat the content note.** `game/guide.html` "Family play" (`:51`) and `docs/user-manual.md` (`:91-93`) say "parent guidance encouraged" / "family-safe imaginative play" but never name the Devil, ghosts, El Coco, or bedroom settings. A parent who reads only the guide never learns what the in-game note discloses. Recommend one line in each guide pointing at (or repeating) the note.
2. **P3 — Bedtime-world framing unmentioned.** El Coco levels are set in children's bedrooms with closets/nightlights (`game.js:1396-1536`, Help `index.html:225`). True to the theme, but a "never to frighten" claim (`index.html:184`) sits next to a closet-monster world some toddlers will find scary at bedtime. Recommend the note add "Bedtime Rooms may feel close to home for small children; preview it first."

## 2. Guide vs game truth — Nangie chains: TRUE in manual, PARTIAL in guide.html

Game truth (`game/game.js`):
- `angie → donaCarmelina` (`:62`), then `donaCarmelina → lordSanty` via the deep-chain special case (`:5324`), which runs before the generic map so it is not shadowed. Full chain **Nangie → Doña Carmelina → Lord Santy** works as documented.
- No pairing override involves Nangie, so the first hop always fires regardless of companion.

Docs:
- `docs/user-manual.md:71,81` documents BOTH hops (EN+ES) — CORRECT.
- `game/guide.html:80` documents the second hop (`Doña Carmelina → Lord Santy`) but the first hop (Nangie → Doña Carmelina) is buried under "etc." in the examples (`:79`). **P3:** add Nangie to the guide.html example list so both guides match.

## 3. Guide vs game truth — Don Maro: TRUE with one undocumented exclusion

Game truth (`game/game.js`):
- `mrChuy → donMaro` (`:67`) — the round-1 omission is fixed in the manual (`user-manual.md:72,168` EN+ES).
- **BUT the Don Lalo pairing overrides it:** `redeemedKeyForHero()` checks the Mr Chuy + Mrs Favi pair FIRST (`:5318-5321`) and returns `donLalo`, so "Mr Chuy unlocks Don Maro" is true **only when the companion is NOT Mrs Favi**. Neither guide states this exclusion (`user-manual.md:72,79`; `guide.html:79-80` lists both facts side by side without noting the interaction).
- **P2 (parent lens):** a child following the guide literally ("play Mr Chuy to get Don Maro") while Mrs Favi is the default-ish companion can "fail" through no fault of their own — confusing and trust-eroding. Recommend one clause in both guides: *"Mr Chuy unlocks Don Maro (with any companion except Mrs Favi — pairing Mr Chuy with Mrs Favi unlocks Don Lalo instead)."*
- guide.html also omits Don Maro from its unlock examples (`:79`, "etc.") — same fix as Nangie covers it.

## 4. Reset-progress safety — PASS

`game/index.html:166` + `game/game.js:2056-2086`:
- Bilingual `confirm()` naming exactly what is wiped (unlocked worlds + redeemed characters, this device) (`:2057`); cancel path returns without touching anything (`:2058`).
- Clears both localStorage keys AND in-memory sets, resets hero/companion/world selections to defaults, re-applies locks, and shows a bilingual status message that auto-clears (`:2080-2085`).
- Button lives on the title screen only — unreachable mid-level, so no accidental gameplay tap can reach it.
- Residual (accepted P3, unchanged from round 1): it sits beside Start and a single habitual "OK" taps through the confirm. Given the confirm names the consequence bilingually and progress is re-earnable through normal play, this is proportionate — no change recommended.

## 5. Tacalache voice — SILENT in v118 (dead-code watch item)

- The line `"Yo soy el Tacalache, y me llevo a los niños traviesos. Plam, plam, plam…"` at low pitch 0.65 (`game.js:5361`) is the only menacing villain voice in the codebase — **but `startIntroSpeech()` is defined and never called** (single occurrence in `game.js`; `playIntroSequence` `:5131-5157` plays video only; the `introButton` hook `:5127` has no matching element in `index.html`). The round-1 P3 concern cannot currently reach any child.
- **Recommendation (P3, owner call):** either delete `startIntroSpeech`/`speakLine` (`game.js:5346-5374`) so the threat line can't be re-armed by accident, or — if it is ever re-enabled — rewrite the line first: the current text threatens to *take naughty children*, which contradicts the content note's "never to frighten" and uses behavior-based fear ("traviesos") the game's redemption values reject. The follow-up prayer lines (`:5362-5363`) are fine.
- Unverified: intro/final **video** audio tracks (mp4 binaries) were not inspected — spoken content there, if any, is outside this review.

## Round-1 parent-item recheck

| Round-1 item | v118 status |
|---|---|
| "Angie" vs "Nangie" | FIXED — "Nangie" in `game.js:623`, `index.html:97,130`, manual `:64,71`, guide `:78` |
| Manual omits Mr Chuy→Don Maro | FIXED in manual (`:72,168`); guide.html still "etc."-only — see §3 |
| No in-game content note | FIXED — `index.html:183-186` bilingual |
| No in-game break reminder | OPEN — guidance only in guide/manual text; no timer in `game.js` (P3, unchanged) |
| Reset beside Start, single confirm | UNCHANGED — assessed proportionate, see §4 |
| El Rancho pre-JS locked markup | FIXED — `index.html:52` now `class="world-choice locked"` + `disabled` |

## Recommended doc edits (all small, EN+ES)

1. Both guides: add the Don Maro / Mrs Favi exclusion clause (§3). Highest parent value.
2. `guide.html:79`: expand "etc." to name Nangie→Doña Carmelina and Mr Chuy→Don Maro.
3. Both guides: repeat (or link) the in-game content note; add the Bedtime Rooms preview suggestion.
