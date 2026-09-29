# Round-3 kid + QA sweep (2026-09-29, live v125)

Focused lenses after the art-cycle sweep (round3-art) and PERF-1 (round3-perf).

## Kid lens (ES-dominant 8yo)

- **HUD chips still EN-only** (`Lives 3`, `Holy Water 4`, `Rosary 0`, game.js
  `updateHud` + index.html static fallbacks). Full bilingual text does NOT fit
  the compact-HUD grid (`minmax(112px,1fr) repeat(2,auto)` ≤820px, nowrap
  chips) — needs an Owner wording/layout call, not a unilateral hack.
  Queued for Owner with the sketch: compact `Lives/Vidas 3` style or
  emoji + bilingual accessible names.
- **Travel line already bilingual** (`Traveling to X / Viajando: X`) —
  RT2-COPY-1 fixed it; verified, no action.
- **Break reminder still guide/manual-text-only** (no in-game timer). A
  reminder toast is a new user-facing surface → Owner call. Queued.
- **Front portraits post-PERF-1:** all 29 fronts verified transparent
  (corner alpha 0, no opaque boxes); oddly-named `mr-chuy-pet-front` and
  `mrs-favi-front-solid` eyeballed — clean full-body poses. Portraits now
  stay on fronts instead of swapping to mid-stride sheet crops (arguably
  better). No action.

## QA lens

- **es-419 self-check on new strings:** `reportTopUpError` uses
  `Revisa tu conexión y recarga` (tú ✓), EN/ES halves match the existing
  boot-error pattern. Gate Check 6 passes.
- **Live drift:** v125 SHA identical local ↔ canonical ↔ pages.dev.
- **Untested seam (accepted risk):** `bootAssetKeys` with a non-default
  `?world=` is exercised only through the same-set select path in smoke,
  not through boot itself (stub has no query support). Code path differs
  only in the `game.world` value. Owner's manual phone check covers it.
- **Fallback redemption (playing an already-redeemed hero):** by design
  redeems nobody new (fallback candidates aren't in the redeemed set);
  end message names a base hero. Not a bug; noted.
