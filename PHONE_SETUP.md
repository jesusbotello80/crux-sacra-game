# CRUX SACRA Phone Setup

Mobile-ready browser / PWA guidance for families. Prefer the public game when possible.

## Play Online (recommended)

Open the canonical URL on iPhone Safari:

```text
https://crux-sacra.fjfaithandfamily.com/game/
```

Then tap Share → Add to Home Screen for a full-screen home-screen icon.

## Run On iPhone From a Local Mac (developers)

1. Connect the Mac and iPhone to the same Wi-Fi.
2. From this repository root, open Terminal and run:

```bash
cd /path/to/crux-sacra-game
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

Or serve locally from the repository root:

```bash
cd /path/to/crux-sacra-game
python3 -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765/game/index.html
```

## Notes

- Audio starts after tapping Start because mobile browsers require a user gesture.
- This is a web/PWA experience, not an App Store IPA.
- Begin in landscape when possible, tap the game once if controls do not respond, and keep browser chrome from covering the play area.
