# Crux Sacra — Asset Provenance / Procedencia de Recursos

Where the game's art, video, and audio come from. Short on purpose: only what the repo itself evidences. No per-file catalog — binary outputs are checked in; sources below regenerate or direct them.

De dónde vienen el arte, el video y el audio del juego. Solo lo que el propio repositorio demuestra.

## Source map / Mapa de fuentes

| Asset family / Familia | Lives in / Vive en | Made with / Hecho con |
|---|---|---|
| Character sprites (PNG) | `character-sprites/` | AI image generation (see Credits), plus procedural walk-sheet packers in `tools/` |
| World backgrounds (PNG) | `video-demo/backgrounds/` | AI image generation; El Coco set built as SVG by `tools/generate_el_coco_assets.mjs` |
| Redeemed walk sheets | `character-sprites/redeemed-sheets-v8/`, `character-sprites/redeemed-cartoon-v1/processed/` | `tools/generate_redeemed_walk_v8.py`, `tools/pack_redeemed_cartoon_sheets.py` (PIL, from checked-in transparent PNGs) |
| Intro / ending videos | `video-intro/`, world ending outputs | `tools/generate_el_rancho_videos.py`, `tools/regenerate_world4_world5_endings.py` (PIL + ffmpeg assemblies); intro filenames record Sora direction |
| Trailer / demo video + poster | `video-demo/crux-sacra-demo-trailer.mp4`, `video-demo/*.png` | Directed with `video-demo/crux-sacra-sora-director-prompt.md` (Sora) |
| Posters | `posters/` | Composites of actual in-repo assets (filenames say `actual-assets` / `hybrid`) |
| Audio (`ending-song-8s-fade.m4a`) | `audio/` | Source undocumented in-repo — checked-in binary; origin not stated, do not assume |
| Brand logo | `game/assets/brand/fj-botello-faith-family-logo.png` | FJ Botello Faith & Family identity asset, referenced by Help screen and title |

## Credits (match README + in-game Help)

Created by Jesús B. · Ideas by Elías B. AI helpers: OpenAI Codex, OpenAI Image Generation, OpenCode, and Muse Code, guided and approved by Jesús B.

Creado por Jesús B. · Ideas de Elías B. Ayudantes de IA: OpenAI Codex, OpenAI Image Generation, OpenCode y Muse Code, guiados y aprobados por Jesús B.

## Rule / Regla

New art goes through `tools/` or records its generator here. Never silently replace a binary without noting its source.

El arte nuevo pasa por `tools/` o registra su origen aquí. Nunca reemplaces un binario sin anotar su fuente.
