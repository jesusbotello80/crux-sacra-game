# Region audio + lantern pilot provenance (v142)

All 17 files under `audio/` shipped for the region-audio pass are
generated — no third-party recordings, samples, or libraries were used.
This slice ports the crux-sacra-2-saints Phase 3 (audio) + Phase 5
(environment pilot) treatment to this game, adapted to its engine
(top-down collector, no platforming jump; bilingual-everywhere strings).

## Regions

| Region | Worlds | Loop |
|---|---|---|
| 1 North | colorado, juarez, useast, elpaso | `region-1-loop.m4a` (C major, home) |
| 2 Mexico | guadalajara, elrancho, mexicocity, elcoco | `region-2-loop.m4a` (A minor, reflective — lantern pilot block) |
| 3 Holy | holymountain, saints | `region-3-loop.m4a` (C major, radiant) |

## Sources

| Asset | Method | Seed / input |
|---|---|---|
| `region-{1,2,3}-loop.m4a` (24s stereo) | `scripts/generate-audio.py` (numpy sine-partial synth) + ffmpeg AAC 96k | This game's stage-1 bed C–E–G–C–G–E (the first melody every player hears, `defaultThemes[0]` in `scheduleMusicNote`), stated twice per 6s phrase and re-harmonized per region (C/G-leaning/A-min/C) |
| `sfx-{jump,land,pickup,hurt,rescue,celebration}.m4a` | Same script + ffmpeg AAC 64k mono (`--only-kind` for singles) | Pure synthesis (sweeps, chime partials, soft noise tap) |
| `narr-colorado-{park,snow,church,boss}-{es,en}.m4a` | `scripts/render-narration.sh` (macOS `say` + ffmpeg AAC 64k mono) | Exact Colorado stage strings (`{name-half}. {message-half}`): names split on ` / `, messages split on the EN/ES sentence boundary; nothing reworded. Voices Paulina (es-MX) / Samantha (en-US); boss reads slower (rate 160 vs 175) |

SFX triggers: pickup = Lux/star/rosary collect; hurt = villain
contact + cross blast; rescue = prayer + rosary; celebration = stage
clear + victory; jump/land = travel-transition depart/arrive (this game
has no platforming jump — the between-stage hop is the leap). The title
screen carries a Voice / Voz switch (EN | ES, persisted on-device as
`cruxSacraVoiceLang`); unset, the device language (`navigator.language`
starting with `es`) picks the narration half. Switching stops any live
clip; the new voice applies going forward. UI strings stay
bilingual-everywhere — the switch covers narration only.

Regeneration is deterministic: re-running the two scripts reproduces
equivalent files (narration bytes depend on installed voice data versions).

## Playback and fallbacks

- File-first everywhere: each file path returns early on success and only
  falls through when the file is missing or errors (loop error releases
  the loop, SFX error marks that kind dead, narration error stays silent).
- Fallbacks are the existing oscillator stage bed and `tone()` SFX —
  never overlapping the file. Narration has NO live voice-synth
  fallback: the v129 dead-speech purge stays in force (release-gate
  Check 20 pins it), so the on-screen bilingual plaque text is the
  narration fallback.
- No-overlap guards: narration stops any prior clip on stage entry,
  finish, title return, and pause; the region loop pauses off `playing`
  and stops on finish/title; the victory sample plays over silence.

## Environment pilot (region 2 only)

`REGION_MECHANIC = {2: "lantern"}` — dusk darkness overlay with a
lantern radius around the hero (un-got crosses re-stamp bright as
beacons), cross danger fills faster, and the villain chases faster
while Lux is empty. All keys off the region number; other regions read
null and play exactly as before. Tunables (pilot estimates for the
owner/Family fun judgment): `dangerMul 1.5`, `chaseMul 1.12`,
`radiusLit 290`, `radiusDark 150`, `edgeAlpha 0.82`. Remaining regions
file as follow-ups only after fun-confirm.

## Rights

- Music/SFX: computed waveforms — no rights holder, no license needed.
- Narration: rendered with macOS system voices from game-owned strings.
- The pre-existing `audio/ending-song-8s-fade.m4a` is untouched by this
  slice (still unreferenced).

## Authorization and review

- Zero-budget agent-created audio, same terms as the 2-saints Phase 3
  treatment port. Faith & Family music review: PENDING — recorded here
  honestly; stays pending until sign-off.
- Playback levels (loop .12, sfx .15, narration 1.0) were calibrated
  blind with bed < sfx < voice balance. Owner ear-check on speakers +
  iPhone pending (kid-playtest lane), plus lantern fun judgment.

## Verification

- `node scripts/region-audio-gate.mjs`: all 17 files present,
  size-budgeted (<5MB total), region map covers all 10 worlds,
  file/fallback needles, no-overlap guards, dead-speech purge holds.
- `node scripts/region-mechanic-gate.mjs`: pilot scope locked to
  region 2, config-driven with tunables, no per-world branches,
  bilingual hint.
- Loop seams measured 0.0018–0.0038 full-scale on the render WAVs
  (P4 breathes its final beat; circular echo taps; no tail/head
  crossfade). `npm run gate` + `npm run smoke` + audits green;
  live `/audio/` route to be proven at deploy verify.
