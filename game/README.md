# CRUX SACRA

Playable bilingual family browser game for laptop and iPhone Safari.

## Play

**Canonical public URL:** https://crux-sacra.fjfaithandfamily.com/game/

Also available via Cloudflare Pages and GitHub Pages; the FJ Faith & Family custom domain is primary.

## Run Locally

Open:

```text
index.html
```

Or serve from the repository root:

```bash
cd /path/to/crux-sacra-game
python3 -m http.server 8765 --bind 0.0.0.0
```

Then open:

```text
http://127.0.0.1:8765/game/index.html
```

For iPhone on the same Wi-Fi, replace `127.0.0.1` with the Mac's local IP address.

## Controls

- Mac: Arrow keys or WASD to move.
- Mac: Space bar to pray / use cross light.
- iPhone: left joystick to move.
- iPhone: cross button to pray / use cross light.

## Character Select

Choose any available hero and companion before starting.

Available heroes include:

- Elayitas
- Angie
- Titín
- Abba
- Ñaña
- Mrs Favi
- Mr Chuy
- Timmy
- Guardian Angel
- St Michael
- Daroe
- Mamel

Available companions include:

- Angie
- Elayitas
- Ñaña
- Timmy
- Guardian Angel
- St Michael
- Mrs Favi
- Mr Chuy

Most selectable characters use real movement frames from their sprite sheets.

## Character Roster Update (v1.1)

Daroe and Mamel are permanent main characters. Redeemable characters include Tía More, Tío Abuelo Original, Tío Abuelo Cuate, GaspaRaspa, and Tío Viktorock. Surprise redeemed faces appear locked until earned through play (for example, Mr Chuy and Mrs Favi together unlock Don Lalo; either selection order works).

## Music And Sounds

The browser version includes procedural music and sound effects:

- Background music changes by stage.
- Cross pickup chimes.
- Prayer / Crux Sacra glow sound.
- Stage clear fanfare.
- Boss/victory/danger sounds.

Browsers only allow game audio after a user action, so sound starts after pressing Start or the cross button.

## Phone Controls

- Tap or drag on the playfield to move the hero toward your finger.
- Use the left joystick if you prefer thumb control.
- Tap `✚` to pray when Lux is available.
- Tap `★` to use spray against rats, cockroaches, or fire.
- Spray starts with 4 uses for the whole game. Each level has one blue `+1` star refill in the play area.

## Goal

Protect glowing Crux Sacras across campaign worlds. Collect crosses to progress; use prayer light, Holy Water, and Rosary power as needed. Unlocks and surprise redemption paths are part of progression.

## Cross Danger Logic

If a threat gets too close to an uncollected cross, that cross starts glowing red. Reach it with the good character before the red glow fills up.

If the red cross explodes, the game ends.

After a win or loss, restart returns to character selection so you can choose a new hero and companion combination.

## Extra Hazards

Hazards can appear in levels (for example spit projectiles or fire patches). Avoid them; touching some ends the run.

Cross explosions show a flash, shockwave ring, sparks, and screen shake before the game-over screen appears.
