#!/bin/sh
# World-1 narration renderer — system TTS to AAC files.
#
# Renders the exact Colorado stage strings ("{name-half}. {message-half}")
# for all 4 world-1 stages, ES + EN. Each half is an exact substring of the
# shipped worldStages text in game/game.js (names split on " / ", messages
# split on the EN/ES sentence boundary); nothing is reworded. The boss reads
# slower (mirrors the live weightier feel; say(1) has no pitch control, so
# rate carries it).
#
# Voices: Paulina (es-MX) + Samantha (en-US), macOS system voices.
# Output: audio/narr-colorado-{park,snow,church,boss}-{es,en}.m4a (mono).
# Provenance: rendered by owner-authorized agent run; no third-party
# recordings. Faith & Family music review: pending (see ledger).
set -eu
OUT="audio"
TMP="$(mktemp -d /tmp/cs1-narr.XXXXXX)"
trap 'rm -rf "$TMP"' EXIT

render() { # voice rate file text
  say -v "$1" -r "$2" -o "$TMP/out.aiff" "$4"
  ffmpeg -y -v error -i "$TMP/out.aiff" -c:a aac -b:a 64k -ac 1 \
    -movflags +faststart "$OUT/$3"
  echo "$3: $(afinfo "$OUT/$3" | grep 'estimated duration')"
}

render Paulina 175 narr-colorado-park-es.m4a "Parque. Junta todas las cruces."
render Samantha 175 narr-colorado-park-en.m4a "Level 1 - Summer Park. Collect all crosses."
render Paulina 175 narr-colorado-snow-es.m4a "Nieve. Encuentra las cruces en la nieve."
render Samantha 175 narr-colorado-snow-en.m4a "Level 2 - Winter Snow. Find the crosses in the snow."
render Paulina 175 narr-colorado-church-es.m4a "Padre Nuestro. Reúne la luz de la oración."
render Samantha 175 narr-colorado-church-en.m4a "Level 3 - Pater Noster. Gather prayer light."
render Paulina 160 narr-colorado-boss-es.m4a "Boss - El Tacalache. Junta Lux y reza junto a El Tacalache."
render Samantha 160 narr-colorado-boss-en.m4a "Boss - El Tacalache. Collect Lux, then pray near El Tacalache."
echo OK
