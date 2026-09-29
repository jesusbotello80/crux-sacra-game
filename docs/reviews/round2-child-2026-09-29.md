# Round 2 review — child player lens (ES-dominant, 8yo) — 2026-09-29

Repo: `/tmp/cs-game-work`, branch fwd5, live v118. All findings inspected in file bodies (game.js, index.html, style.css, guide.html).

## 1. Wrapped message plaque readability — PASS with notes
- Plaque wraps bilingual text at 606px, 24px bold cream on dark translucent box, left-aligned bottom-left (game.js:4659-4698). Grows upward so it never clips the playfield bottom.
- Notes for an 8yo ES-dominant reader:
  - English always comes first, so the Spanish half lands mid-plaque or on later wrapped lines; a kid scanning for Spanish must skip the English every time. ES-first (or a line break between languages) would help.
  - Defeat lines append "Lives left / Vidas restantes: N" (game.js:2619), making the longest plaques 4–6 wrapped lines of dense text. Consider shortening defeat lines for kids.
  - On phones the 1280×720 canvas scales down, so 24px plaque type gets small; acceptable, but no larger-type option exists.

## 2. Difficulty rules caption clarity — NEEDS FIX
- Caption text itself is clear and bilingual (game.js:5079-5083), e.g. "5 lives · 5 Holy Water · slower foes / 5 vidas · 5 aguas benditas · enemigos más lentos".
- Issues:
  - Caption is 12px, the smallest type on the title screen (style.css:659-664) — hard for an 8yo to read on a phone.
  - Difficulty buttons are English-only: "Baby / Easy", "Young / Regular", "Expert / Hard" (index.html:77-89). No Spanish equivalents (Bebé/Fácil, Normal, Difícil), so an ES-dominant child cannot match the button to the caption's Spanish half. The labels are also confusing pairs (Baby?=Easy, Young?=Regular).
  - "5 aguas benditas" plural is odd vs the singular "Agua Bendita" used everywhere else (HUD, help, guide).

## 3. Load progress — PASS with one gap
- Bilingual counter "Loading N/M / Cargando N/M" with live region, hidden when done, bilingual error message (game.js:1916-1941, game.js:5386-5391; index.html:28). Good.
- Gap: Start button is never disabled during load (game.js:5109-5111, no gating in playIntroSequence game.js:5131-5157). An impatient 8yo can tap Start before assets finish loading. Disable Start (or show "wait") until load completes. Numbers-only progress (no bar) is fine for this age.

## 4. Pause tap-hint — NEEDS FIX
- Overlay shows "Tap ▶ to resume / Toca ▶ para seguir." (game.js:4711) and the pause button does toggle to ▶ when paused (game.js:4724) — consistent.
- Issues:
  - The desktop line "P to resume · Q to quit. P seguir · Q salir." (game.js:4710) is ungrammatical Spanish ("P seguir" lacks a verb; should be "Pulsa P para seguir · Q para salir") and "Q to quit" has no touch equivalent — a phone-only child has no visible way back to character select (guide says "Pause, then return" but no on-screen return button exists during pause).
  - Young kids may not connect the ▶ glyph in text with the small pause button; an arrow/position cue ("toca el botón ▶ abajo") would help.

## 5. Story ES quality — PASS with fixes
Inspected all stage messages (game.js:758-1853), defeat/projectile lines (game.js:2503-2551), redemption/finish lines (game.js:2623-2646, 5337-5340), intro speech (game.js:5358-5368), help (index.html:170-241), guide ES (guide.html:90-135).
- Overall: Spanish is natural, tú-form, well-accented, kid-appropriate; intro speech ("Yo soy el Tacalache… ¿Quién como Dios? La Crux Sacra protege a los niños") is excellent for the audience.
- Fixes, by severity:
  1. Pronoun flip: "Stay together… Sigan juntos…" (game.js:1364) uses ustedes; every other line uses tú ("Quédate", "Sigue", "Mantén"). → "Sigue junto a tu compañero" / "Quédate junto…".
  2. Gender agreement: redemption line "fue tocado" (game.js:5339) is masculine even when the villain is feminine (La Llorona, La Aparecida). → "fue tocada/o" or rephrase ("la gracia de Dios lo/la tocó").
  3. Pause Spanish "P seguir · Q salir" ungrammatical (game.js:4710) — see §4.
  4. EN/ES mismatch in travel line: "Traveling to {label} / Viajando al siguiente mundo" (game.js:2451-2453) — English names the world, Spanish is generic. → "Viajando a {mundo}".
  5. Help list: El Rancho entry joins EN+ES with ". " instead of " / " like all siblings (index.html:223).
  6. "Danger meter" ("antes de que se llene el peligro", game.js:2527) names a meter never labeled in the HUD; HUD chips are English-only ("Lives 3", "Holy Water 4", "Rosary 0", index.html:290-293; set in game.js:2786) — an ES-dominant 8yo gets no Spanish HUD. Consider bilingual chips ("Vidas", "Agua") or icons.
  7. Trivia: "Plam, plam" (game.js:5361) reads like a typo for "Pam/Pum"; harmless if intentional SFX.

## Verdict
Playable and welcoming for an ES-dominant 8yo, but the difficulty buttons (EN-only), 12px rules caption, ungrammatical pause Spanish, missing touch-quit path, and Start-during-load gap should be fixed before calling this child-ready. Top story fix: "Sigan juntos" → tú form.
