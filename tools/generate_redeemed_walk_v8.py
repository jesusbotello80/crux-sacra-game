from __future__ import annotations

import math
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "character-sprites/redeemed-sheets-v8"
CELL_W = 280
CELL_H = 400
FRAMES = 8


CHARACTERS = {
    "tan": "character-sprites/tan/tan-transparent.png",
    "mr-hernandez": "character-sprites/mr-hernandez/mr-hernandez-transparent.png",
    "mr-domingo": "character-sprites/mr-domingo/mr-domingo-transparent.png",
    "don-maro": "character-sprites/don-maro/don-maro-transparent.png",
    "lady-seferina": "character-sprites/lady-seferina/lady-seferina-transparent.png",
    "dona-carmelina": "character-sprites/dona-carmelina/dona-carmelina-transparent.png",
    "mr-zuil": "character-sprites/mr-zuil/mr-zuil-transparent.png",
    "mr-tio": "character-sprites/mr-tio/mr-tio-transparent.png",
    "father-v": "character-sprites/father-v/father-v-transparent.png",
    "father-m": "character-sprites/father-m/father-m-transparent.png",
    "padrino": "character-sprites/tacalache-redeemed/tacalache-redeemed-transparent.png",
    "angeliux": "character-sprites/angeliux/angeliux-transparent-clean.png",
    "sr-joe": "character-sprites/sr-joe/sr-joe-transparent.png",
    "lord-santy": "character-sprites/lord-santy/lord-santy-transparent.png",
    "dona-nene": "character-sprites/dona-nene/dona-nene-transparent.png",
}


ROBE_KEYS = {"father-v", "father-m", "dona-carmelina", "dona-nene", "mr-zuil"}


def crop_and_fit(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    scale = min(205 / im.width, 360 / im.height)
    return im.resize((round(im.width * scale), round(im.height * scale)), Image.Resampling.LANCZOS)


def paste_center(dst: Image.Image, src: Image.Image, cx: float, y: float) -> None:
    dst.alpha_composite(src, (round(cx - src.width / 2), round(y)))


def rotate(part: Image.Image, angle: float) -> Image.Image:
    return part.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)


def squash(part: Image.Image, sx: float, sy: float) -> Image.Image:
    w = max(1, round(part.width * sx))
    h = max(1, round(part.height * sy))
    return part.resize((w, h), Image.Resampling.BICUBIC)


def walk_frame(sprite: Image.Image, key: str, frame_index: int) -> Image.Image:
    phase = (frame_index / FRAMES) * math.tau
    stride = math.sin(phase)
    counter = math.sin(phase + math.pi)
    lift = abs(stride)
    bob = -round(lift * 8)
    sway = round(stride * 4)

    hip = round(sprite.height * (0.57 if key not in ROBE_KEYS else 0.50))
    mid = sprite.width // 2
    frame = Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))
    base_x = CELL_W // 2 + sway
    base_y = CELL_H - sprite.height - 12 + bob

    if key in ROBE_KEYS:
        upper = sprite.crop((0, 0, sprite.width, hip + round(sprite.height * 0.12)))
        robe = sprite.crop((0, hip, sprite.width, sprite.height))
        robe = squash(robe, 1.0 + lift * 0.025, 1.0 - lift * 0.015)
        robe = rotate(robe, stride * 2.8)
        paste_center(frame, robe, base_x + stride * 7, base_y + hip + lift * 3)
        paste_center(frame, upper, base_x, base_y)
        return frame

    upper = sprite.crop((0, 0, sprite.width, hip + 10))
    left_leg = sprite.crop((0, hip, mid + 8, sprite.height))
    right_leg = sprite.crop((mid - 8, hip, sprite.width, sprite.height))

    # Draw each leg once. The upper body is clipped above the hips, so old leg pixels
    # cannot remain underneath and create the third-leg artifact.
    left_angle = -stride * 15
    right_angle = -counter * 15
    left = rotate(left_leg, left_angle)
    right = rotate(right_leg, right_angle)
    leg_y = base_y + hip + round(lift * 2)
    frame.alpha_composite(left, (round(base_x - mid - 3 - stride * 13), leg_y))
    frame.alpha_composite(right, (round(base_x - 8 + stride * 13), leg_y + round(abs(counter) * 2)))

    pelvis = sprite.crop((max(0, mid - 42), hip - 8, min(sprite.width, mid + 42), min(sprite.height, hip + 44)))
    paste_center(frame, pelvis, base_x, base_y + hip - 8)

    body = rotate(upper, stride * 2.2)
    paste_center(frame, body, base_x, base_y)
    return frame


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for key, rel in CHARACTERS.items():
        sprite = crop_and_fit(ROOT / rel)
        sheet = Image.new("RGBA", (CELL_W * FRAMES, CELL_H), (0, 0, 0, 0))
        for frame_index in range(FRAMES):
            sheet.alpha_composite(walk_frame(sprite, key, frame_index), (frame_index * CELL_W, 0))
        out = OUT / f"{key}-walk-sheet-v8.png"
        sheet.save(out)
        print(out.relative_to(ROOT))


if __name__ == "__main__":
    main()
