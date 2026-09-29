# Round-2 Design Review — grind validation, checkpoints/gate/cross-load (2026-09-29)

Lens: designer (progression, fairness). Scope: validate the grind table in
`docs/AI-DISPATCH.md` (2026-09-29 00:10 MT entry — second from top; topmost is
the header-merge QA note) against `game/game.js` formulas, judge
checkpoints / Holy Land gate / cross-load, propose smallest fixes.

## 1. Grind-table validation: formula and per-world rows all correct

Code truth (`game/game.js`):
- `generateCrosses` :2716 — `count = max(3, crossCount + crossBonus + floor(index/2))`,
  `index` = 0-based stage within the current world run (`startStage`, :2359).
- `difficultySettings` :701-703 — easy 5❤/crossBonus −1, regular 3❤/+0, hard 2❤/+1.
- Base `crossCount` per world (`worldStages` :750-1864): Colorado [6,7,5,5],
  Juárez [6,7,8,8,7,7], US East [6,7,8,8,9,8], El Paso [6,7,8,7,9,8],
  Guadalajara [6,7,8,8,9,8], Mexico City [6,7,8,8,9,8],
  Bedtime/elcoco [7,8,8,7,9,9,9,9], Holy Land [7,8,8,9,9,9],
  Saints [7,8,8], El Rancho [7,8,8,7,9,9,9].

Recomputed every cell independently: all 10 rows × (total, worst-stage) × 3
difficulties match the dispatch table exactly. Gate note "7 worlds (all minus
locked ranch)" also correct: `finalWorldRequiredKeysAll` :98 has 8 keys and
filters out `elrancho` while `ranchWorldPublicReady = false` (:97-101).

Related claims confirmed:
- Lives reset per world run, death at 0 = full-world replay: `reset()` :2329-2333
  sets `stageIndex = 0` + `lives`; `startStage` never refills; `loseLife` :2591
  at 0 → `finish(false)` → end screen → `againButton` → title (:5126). No
  checkpoint state anywhere (no `lives +=`, no stage resume).
- Mitigator worth keeping in mind: non-fatal `loseLife` keeps collected crosses
  (:2610-2613 resets only danger) and repositions player/enemy — only the final
  death wipes progress.
- "86-cross / 2-life no-checkpoint Bedtime run" on hard: correct (86 recomputed,
  hard lives = 2).

## 2. Two arithmetic slips in the summary line (rows themselves are right)

"Full regular run to endgame ≈ 439 crosses / 53 stages; hard ≈ 517."

- Regular 439 is correct **only including the Saints bonus** (415 through Holy
  Land clear + 24 Saints). Fine, but say so.
- Stage count 53 matches nothing: 48 stages to Holy Land clear
  (4+6+6+6+6+6+8+6), 51 including Saints (+3). Correct to **51** (or 48 to
  endgame-clear).
- Hard 517 is wrong: recomputed 463 through Holy Land + 27 Saints = **490**.
  The 517 overstates by exactly one Saints-hard (27) — likely double-count.
- Suggested correction: "439 crosses / 51 stages incl. Saints bonus (415/48 to
  Holy Land clear); hard 490."

## 3. Judgments

**Checkpoints (P1, worst problem).** A boss death discards the whole world run —
up to 78 crosses (regular Bedtime) with zero credit. Lives also never refill
within a run, so long worlds are strictly harder per life: crosses-per-life on
regular ranges 8.3 (Colorado) → 26 (Bedtime); on hard, Bedtime is 43/life.
Late-stage pressure compounds: enemy speed ramps `1 + index*0.09` (:2364) and
seeded fires grow `2 + index + fireBonus` (:2384), so the longest worlds are
also the spikiest at the tail. For a kid/family game this is the most likely
quit point, and it sits directly on the mandatory path (Bedtime gates Holy Land).

**Gate (P1).** 7-of-7 with zero partial credit (`isFinalWorldUnlocked` :2088-2090
uses `.every`), and the longest world (Bedtime, 8 stages) is mandatory. Two
compounding notes: (a) when the ranch flag flips, the gate silently becomes
8-of-8 (`finalWorldRequiredKeysAll` includes `elrancho`) — the grind gets worse
on release day; (b) the reward behind the full gate is the thinnest world
(Saints: 3 stages, per round-1 finding). Gate strictness and payoff point in
opposite directions.

**Cross-load (P2).** The curve shape is sound (round-1 designer already found
speeds/breathers healthy); the issue is only the Bedtime tail: `floor(index/2)`
reaches +3 only in the 8-stage world, stacking with base 9s to produce 12/13-
cross stages under 3/2-life fail pressure. Hard `crossBonus +1` adds +8 crosses
across Bedtime on top of hard's speed/hazard multipliers — it double-taxes the
hardest mode on the longest world.

## 4. Smallest fixes, ranked (pick one per row; all are Owner calls per board)

1. **Boss-retry (smallest checkpoint fix).** In the `lives <= 0` path, if the
   current stage is a boss, restart that stage with 1 life instead of `finish(false)`.
   One branch, no new state, kills the worst wipe (boss death after a full clear).
2. **+1 life per stage clear, capped at difficulty max.** One line in
   `completeStage`/`advanceStage`. Directly answers the crosses-per-life spread
   without touching any counts; easy stays easy, Bedtime becomes survivable.
3. **Gate N-of-M.** Change `.every` to a count threshold: 6-of-7 now (lets one
   hard/long world slide), 7-of-8 when the ranch goes live. One-line logic +
   lock copy tweak (:2111-2112). Keeps endgame earned while removing the single-
   world veto.
4. **Hard `crossBonus` 1→0.** One constant (:703). Hard keeps its identity via
   speed 1.24 / hazards / fireBonus; removes the +8 Bedtime surcharge. Alternatively
   cap `floor(index/2)` at +2 — same tail effect, slightly more code.
5. **Do not ship 8-of-8 silently.** If the gate stays full-clear, exclude the
   ranch from `finalWorldRequiredKeysAll` deliberately or announce the 8-world
   gate before flipping `ranchWorldPublicReady`.

Explicit non-recommendation: re-tuning base `crossCount`s or the curve shape —
validation shows the shape is fine; the pain is checkpoints/gate/tail-cap, all
cheaper to fix.

## Evidence index (all bodies inspected)

- `docs/AI-DISPATCH.md` :27-48 (grind entry); :13-24 (top entry is header QA)
- `game/game.js` :90-101 (gate keys), :260-335 (world/stage counts),
  :700-704 (difficulties), :750-1864 (bases, sampled every world block),
  :2088-2098 + :2100-2143 (unlock/lock/select), :2323-2357 (reset),
  :2359-2421 (start/advance), :2591-2652 (loseLife/finish),
  :2715-2744 (generateCrosses), :5126 (again→title)
- `docs/reviews/M-A-PERSONA-ROUNDTABLE-2026-09-28.md` :90-99, :128-129, :139
  (round-1 design P1s/P2s this validates)
