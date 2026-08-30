# CRUX SACRA Prototype

Playable browser prototype for laptop and iPhone Safari.

## Run On This Mac

Open:

```text
index.html
```

Or serve from the `outputs` folder:

```bash
cd /Users/jesusbotello/Documents/Codex/2026-07-09/hatch-pet-users-jesusbotello-codex-skills-2/outputs
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

Choose any hero and any companion before starting. The prototype supports every combination against El Tacalache.

Available heroes:

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

Available companions:

- Angie
- Elayitas
- Ñaña
- Timmy
- Guardian Angel
- St Michael
- Mrs Favi
- Mr Chuy

Most selectable characters now use real movement frames from their sprite sheets. Some motion is still prototype-level, but it is no longer only static sliding.

## Character Roster Update (v1.1)

Daroe and Mamel are permanent main characters. New redeemable characters are Tía More, Tío Abuelo Original, Tío Abuelo Cuate, GaspaRaspa, and Tío Viktorock. Mr Chuy and Mrs Favi together unlock the surprise character Don Lalo; either selection order works.

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

The prototype now has four simple stages:

1. Summer Park / Parque
2. Winter Snow / Nieve
3. Pater Noster / Padre Nuestro
4. Boss: El Tacalache

For stages 1-3, collect all Saint Benedict crosses to complete the stage and advance automatically.

For the boss stage, collect all crosses to build Lux. When El Tacalache gets close, use the cross light:

```text
Crux Sacra Sit Mihi Lux
```

Push El Tacalache back with the cross light to complete the game.

## Cross Danger Logic

If El Tacalache gets too close to an uncollected cross, that cross starts glowing red. Reach it with the good character before the red glow fills up.

If the red cross explodes, the game ends.

After a win or loss, the restart button returns to character selection so you can choose a new hero and companion combination.

## Extra Hazards

El Tacalache can spit small moving hazards from his mouth. Avoid them.

Small fire patches can appear around the level. They are intentionally small, but touching one ends the run.

Cross explosions now show a flash, shockwave ring, sparks, and screen shake before the game-over screen appears.
