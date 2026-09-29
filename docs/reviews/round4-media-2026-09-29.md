# Round-4 media audio inventory (2026-09-29, live v127)

Closes the round-2 a11y §2d blocker ("mp4 binaries not inspected") and the
round-2 parent §5 video-audio caveat with ffprobe evidence. Method: `ffprobe
-show_entries stream=codec_type` over every mp4 under `video-intro/` +
`video-demo/`, intersected with the 77 `video-intro/*.mp4` literals referenced
by `game/game.js`. No player bytes touched.

## Inventory

- **101 mp4s on disk**, **77 played** by game.js (`introVideo`/`finalVideo`
  assignments, game.js:5322-5323/5449-5450).
- **19 played clips are silent** (video stream only — captions provably N/A):
  `world1` × 7 (don-lalo, gaspa-raspa, placeholder, tia-more,
  tio-abuelo-cuate, tio-abuelo-original, tio-viktorock), `world4` × 6 and
  `world5` × 6 (same redemption set minus placeholder).
- **58 played clips carry an audio stream.** Spot durations ~8–10s (main
  intro `crux-sacra-game-intro-sora-audio-2-clean-fill.mp4` 9.96s, saints
  ending + el-coco intro 8.0s). Speech-vs-music **unverified by ear** — a
  probe cannot honestly separate them, so this stays a listening pass.
- **24 disk files unreferenced**, incl. the demo trailer, 5 alt main intros
  (`game-intro.mp4`, `game-intro-v2.mp4`, `game-intro-voice.mp4`,
  `sora-audio-1.mp4`, `sora-audio-2*.mp4` minus the played clean-fill), and
  redemption variants (lady-seferina, mr-domingo, mr-hernandez, padrino,
  `final-redemption.mp4`, `before-whatsapp-song`). Deployed but never
  fetched; prune-or-keep is an Owner call (alts may be future use).
- **`startIntroSpeech` still dead on v127** (single occurrence in game.js):
  no speech-synthesis transcript needed unless re-armed (parent §5 stands).

## Concrete next step (Owner/AG, ~15 min)

Listening pass over the 58 audio-bearing played clips (or STT draft): mark
speech-bearing clips, then caption tracks + Owner wording approval for the
caption text. The 19 silent played clips need nothing. Suggested priority:
main intro first (every player sees it), then world intros, then redemption
clips.

## Recheck: help-list separator already fixed

Round-2 child §5.5 flagged the El Rancho help entry joining EN+ES with ". "
instead of " / " — verified on v127 (index.html:224) it now uses " / " like
all siblings. No action.
