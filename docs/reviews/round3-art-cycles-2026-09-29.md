# Round-3 art sweep — walk-cycle motion screen (2026-09-29, live v123)

Method: for each of the 28 `animated` cycles, cropped every frame rect from its
sheet, downscaled alpha masks to 64×64, and scored consecutive-frame mean-abs
diff (plus last→first wrap). Every flag <0.05 was eyeballed as a contact strip
before any verdict. Probe kept as scratch (`/tmp/cycle-screen.py`, not
committed); durable pins are frame counts in gate Check 8.

## Scores (min consecutive diff; wrap = loop seam)

| minD | cycle | frames | verdict |
|------|-------|--------|---------|
| 0.019 | fatherVWalk | 8→7 | DROP idx6 (dup of idx5) |
| 0.019 | donaNeneWalk | 8→7 | DROP idx1 (dup of idx0) |
| 0.021 | tanWalk | 8→7 | DROP idx1 (dup of idx0) |
| 0.021 | nanaWalk | 7→6 | DROP idx1 (dup of idx0) |
| 0.025 | mrZuilWalk | 8→7 | DROP idx2 (dup of idx1) |
| 0.027 | fatherMWalk | 8→7 | DROP idx5 (dup of idx4) |
| 0.036 | angeliuxWalk | 8 | KEEP — leg swing visible at 0.036 |
| 0.040 | donaCarmelinaWalk | 8 | KEEP (above threshold) |
| 0.046 | donMaroWalk | 8 | KEEP (above threshold) |
| 0.050+ | abba/mamel/srJoe/ttitin/mrsFavi/mrTio/… | — | KEEP, healthy |
| wrap 0.024 | lordSantyWalk | 8→7 | DROP idx7 (dup of idx0 at seam) |
| wrap 0.034 | donMaroWalk | 8 | KEEP — seam legs differ visibly |
| jump 0.405 | michaelMove | 3→2 | DROP idx1 (shield missing = blink) |

Threshold: pairs <0.03 drop only after eyeball confirmation; 0.034+ all showed
real motion on inspection. Fixed-in-RT3-ART-1 cycles re-scored healthy
(daroeWalk 0.170, tioAbueloOriginalWalk 0.076, gaspaRaspaWalk 0.079).

## Incidental find (not fixed — Owner call)

`redeemedWalk` frames (game.js:429) + the `redeemedMotion` squash-stretch path
in `drawFrame` are dead: no `characterDefs` entry sets
`animated: "redeemedWalk"` or `redeemedMotion`, and nothing assigns them
dynamically. Fold into RT2-DEAD-1 (delete vs wire-up for redeemed heroes).

## Fix character (RT3-ART-2)

All 8 drops are second-of-pair (first-of-pair kept, so `idleFrame`/`previewFrame`
0 are untouched) except lordSanty (last frame dropped, index 0 kept). All 8
cycles are single-owner. Code-only — zero PNG bytes touched.
