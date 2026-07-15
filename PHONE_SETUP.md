# CRUX SACRA Phone Setup

This export is a mobile-ready browser game bundle.

## Run On iPhone From This Mac

1. Connect the Mac and iPhone to the same Wi-Fi.
2. On the Mac, open Terminal and run:

```bash
cd /Users/jesusbotello/Documents/Codex/2026-07-09/hatch-pet-users-jesusbotello-codex-skills-2/outputs/mobile-export/crux-sacra-game
python3 -m http.server 8765 --bind 0.0.0.0
```

3. Find the Mac local IP address:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

4. On the iPhone, open Safari:

```text
http://YOUR-MAC-IP:8765/game/index.html
```

Example:

```text
http://192.168.1.25:8765/game/index.html
```

5. In Safari, tap Share, then Add to Home Screen.

## Run On This Mac

Open:

```text
game/index.html
```

Or serve locally:

```bash
cd /Users/jesusbotello/Documents/Codex/2026-07-09/hatch-pet-users-jesusbotello-codex-skills-2/outputs/mobile-export/crux-sacra-game
python3 -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765/game/index.html
```

## Notes

- Audio starts after tapping Start because mobile browsers require a user gesture.
- This is still a web/PWA prototype, not an App Store IPA.
- A native iPhone/Mac version can be built next in Xcode with SpriteKit using the same assets and game logic.
