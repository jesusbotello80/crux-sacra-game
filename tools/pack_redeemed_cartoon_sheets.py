from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "character-sprites/redeemed-cartoon-v1/source"
OUT = ROOT / "character-sprites/redeemed-cartoon-v1/processed"
CELL_W = 280
CELL_H = 400
FRAMES = 8


def remove_chroma(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    key_r, key_g, key_b, _ = im.getpixel((0, 0))
    green_key = key_g > key_r * 1.3 and key_g > key_b * 1.3
    magenta_key = key_r > key_g * 1.3 and key_b > key_g * 1.3
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            dist = ((r - key_r) ** 2 + (g - key_g) ** 2 + (b - key_b) ** 2) ** 0.5
            greenish = green_key and g > 125 and g > r * 1.35 and g > b * 1.25
            magentaish = magenta_key and r > 160 and b > 140 and g < 130 and r > g * 1.3 and b > g * 1.3
            if dist < 70 or greenish or magentaish:
                px[x, y] = (r, g, b, 0)
            elif a:
                # Despill a little without flattening the generated color.
                if green_key:
                    excess = max(0, g - max(r, b) - 18)
                    if excess:
                        px[x, y] = (r, max(0, g - excess), b, a)
                elif magenta_key:
                    excess = max(0, min(r, b) - g - 24)
                    if excess:
                        px[x, y] = (max(0, r - excess), g, max(0, b - excess), a)
    return im


def component_boxes(alpha: Image.Image) -> list[tuple[int, int, int, int]]:
    mask = alpha.point(lambda p: 255 if p > 24 else 0)
    w, h = mask.size
    seen = bytearray(w * h)
    pix = mask.load()
    boxes = []
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if seen[idx] or pix[x, y] == 0:
                continue
            q = deque([(x, y)])
            seen[idx] = 1
            minx = maxx = x
            miny = maxy = y
            area = 0
            while q:
                cx, cy = q.popleft()
                area += 1
                minx = min(minx, cx)
                maxx = max(maxx, cx)
                miny = min(miny, cy)
                maxy = max(maxy, cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if nx < 0 or ny < 0 or nx >= w or ny >= h:
                        continue
                    nidx = ny * w + nx
                    if not seen[nidx] and pix[nx, ny] != 0:
                        seen[nidx] = 1
                        q.append((nx, ny))
            bw = maxx - minx + 1
            bh = maxy - miny + 1
            if area > 2500 and bw > 45 and bh > 120:
                boxes.append((minx, miny, maxx + 1, maxy + 1))
    boxes.sort(key=lambda b: b[0])
    return boxes


def remove_small_fragments(im: Image.Image, min_area: int = 900) -> Image.Image:
    alpha = im.getchannel("A")
    mask = alpha.point(lambda p: 255 if p > 24 else 0)
    w, h = mask.size
    seen = bytearray(w * h)
    mask_px = mask.load()
    im_px = im.load()
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if seen[idx] or mask_px[x, y] == 0:
                continue
            q = deque([(x, y)])
            pts = [(x, y)]
            seen[idx] = 1
            while q:
                cx, cy = q.popleft()
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if nx < 0 or ny < 0 or nx >= w or ny >= h:
                        continue
                    nidx = ny * w + nx
                    if not seen[nidx] and mask_px[nx, ny] != 0:
                        seen[nidx] = 1
                        pts.append((nx, ny))
                        q.append((nx, ny))
            if len(pts) < min_area:
                for px, py in pts:
                    r, g, b, _ = im_px[px, py]
                    im_px[px, py] = (r, g, b, 0)
    return im


def split_fallback(im: Image.Image) -> list[tuple[int, int, int, int]]:
    boxes = []
    step = im.width / FRAMES
    for i in range(FRAMES):
        crop = im.crop((round(i * step), 0, round((i + 1) * step), im.height))
        bbox = crop.getbbox()
        if not bbox:
            continue
        boxes.append((round(i * step) + bbox[0], bbox[1], round(i * step) + bbox[2], bbox[3]))
    return boxes


def pack(path: Path) -> Path:
    im = remove_small_fragments(remove_chroma(Image.open(path)))
    boxes = component_boxes(im.getchannel("A"))
    if len(boxes) != FRAMES:
        boxes = split_fallback(im)
    if len(boxes) != FRAMES:
        raise RuntimeError(f"{path.name}: expected 8 frames, found {len(boxes)}")

    sheet = Image.new("RGBA", (CELL_W * FRAMES, CELL_H), (0, 0, 0, 0))
    for i, box in enumerate(boxes[:FRAMES]):
        pad = 10
        x0, y0, x1, y1 = box
        crop = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))
        bbox = crop.getbbox()
        if bbox:
            crop = crop.crop(bbox)
        scale = min(235 / crop.width, 360 / crop.height)
        crop = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.LANCZOS)
        x = i * CELL_W + round((CELL_W - crop.width) / 2)
        y = CELL_H - crop.height - 12
        sheet.alpha_composite(crop, (x, y))

    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / path.name.replace("-cartoon-green.png", "-cartoon-sheet.png").replace("-cartoon-magenta.png", "-cartoon-sheet.png")
    sheet.save(out)
    return out


def main() -> None:
    for path in sorted(SRC.glob("*-cartoon-green.png")):
        print(pack(path).relative_to(ROOT))


if __name__ == "__main__":
    main()
