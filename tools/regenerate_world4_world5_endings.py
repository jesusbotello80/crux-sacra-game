from __future__ import annotations

import math
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PY_FFMPEG = Path("/opt/homebrew/bin/ffmpeg")
FPS = 12
DURATION = 8
W, H = 1280, 720


REDEEMED = {
    "dona-carmelina": ("Doña Carmelina", "character-sprites/dona-carmelina/dona-carmelina-transparent.png"),
    "tan": ("Tío Tan", "character-sprites/tan/tan-transparent.png"),
    "mr-zuil": ("Mr Zuil", "character-sprites/mr-zuil/mr-zuil-transparent.png"),
    "mr-hernandez": ("Mr Hernandez", "character-sprites/mr-hernandez/mr-hernandez-transparent.png"),
    "mr-domingo": ("Mr. Domingo", "character-sprites/mr-domingo/mr-domingo-transparent.png"),
    "don-maro": ("Don Maro", "character-sprites/don-maro/don-maro-transparent.png"),
    "lady-seferina": ("Lady Seferina", "character-sprites/lady-seferina/lady-seferina-transparent.png"),
    "mr-tio": ("Mr Tío", "character-sprites/mr-tio/mr-tio-transparent.png"),
    "father-v": ("Father V", "character-sprites/father-v/father-v-transparent.png"),
    "father-m": ("Father M", "character-sprites/father-m/father-m-transparent.png"),
    "padrino": ("Padrino", "character-sprites/tacalache-redeemed/tacalache-redeemed-transparent.png"),
}

WORLDS = {
    "world4": {
        "prefix": "crux-sacra-el-paso-redemption",
        "background": "video-demo/backgrounds/el-paso/playable/bg-el-paso-level-4.png",
        "villain": ("El Chupacabras", "character-sprites/el-chupacabras/el-chupacabras-cutout.png"),
        "accent": "#c77eff",
        "city": "El Paso",
    },
    "world5": {
        "prefix": "crux-sacra-guadalajara-redemption",
        "background": "video-demo/backgrounds/guadalajara/playable/bg-guadalajara-level-1.png",
        "villain": ("El Charro Negro", "character-sprites/el-charro-negro/el-charro-negro-cutout.png"),
        "accent": "#ff4b4f",
        "city": "Guadalajara",
    },
}


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            pass
    return ImageFont.load_default()


FONT_TITLE = font(44)
FONT_BODY = font(28)


def fit_cover(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    im = im.convert("RGB")
    scale = max(size[0] / im.width, size[1] / im.height)
    new = im.resize((round(im.width * scale), round(im.height * scale)), Image.Resampling.LANCZOS)
    left = (new.width - size[0]) // 2
    top = (new.height - size[1]) // 2
    return new.crop((left, top, left + size[0], top + size[1]))


def fit_height(im: Image.Image, height: int) -> Image.Image:
    im = im.convert("RGBA")
    width = round(im.width * height / im.height)
    return im.resize((width, height), Image.Resampling.LANCZOS)


def paste_shadow(base: Image.Image, sprite: Image.Image, x: int, y: int, alpha: float = 0.38) -> None:
    shadow = Image.new("RGBA", sprite.size, (0, 0, 0, 0))
    shadow_alpha = sprite.getchannel("A").filter(ImageFilter.GaussianBlur(10))
    shadow.putalpha(shadow_alpha.point(lambda p: int(p * alpha)))
    base.alpha_composite(shadow, (x + 10, y + 18))
    base.alpha_composite(sprite, (x, y))


def draw_panel(draw: ImageDraw.ImageDraw, text: str, y: int) -> None:
    padding_x = 34
    bbox = draw.textbbox((0, 0), text, font=FONT_BODY)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (W - tw) // 2
    panel = (x - padding_x, y - 16, x + tw + padding_x, y + th + 20)
    draw.rounded_rectangle(panel, radius=18, fill=(8, 12, 24, 178), outline=(255, 244, 168, 210), width=2)
    draw.text((x, y), text, font=FONT_BODY, fill=(255, 248, 211, 255))


def make_frame(world: dict, redeemed: tuple[str, str], t: float) -> Image.Image:
    bg = fit_cover(Image.open(ROOT / world["background"]), (W, H)).convert("RGBA")
    bg = ImageEnhance.Color(bg).enhance(1.06)
    bg = ImageEnhance.Contrast(bg).enhance(1.04)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 36))
    bg.alpha_composite(overlay)

    jesus = fit_height(Image.open(ROOT / "character-sprites/jesus/jesus-divine-mercy-transparent.png"), 330)
    villain_name, villain_path = world["villain"]
    villain = fit_height(Image.open(ROOT / villain_path), 245 if world["city"] == "El Paso" else 360)
    redeemed_name, redeemed_path = redeemed
    redeemed_sprite = fit_height(Image.open(ROOT / redeemed_path), 285 if "lady" not in redeemed_path else 245)

    pulse = 0.5 + 0.5 * math.sin(t * math.pi * 2)
    light = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(light)
    ld.ellipse((430 - 95, 116 - 95, 430 + 95, 116 + 95), fill=(255, 244, 168, int(56 + pulse * 28)))
    ld.ellipse((375, 156, 615, 560), fill=(255, 244, 168, int(32 + pulse * 20)))
    light = light.filter(ImageFilter.GaussianBlur(28))
    bg.alpha_composite(light)

    paste_shadow(bg, jesus, 345, 145, 0.28)
    vx = 760 + round(math.sin(t * math.pi * 1.7) * 8)
    vy = 260 + round(math.sin(t * math.pi * 1.1) * 5)
    villain = ImageEnhance.Brightness(villain).enhance(0.78)
    paste_shadow(bg, villain, vx, vy, 0.34)
    rx = 130 + round(math.sin(t * math.pi * 2.0) * 6)
    paste_shadow(bg, redeemed_sprite, rx, H - redeemed_sprite.height - 42, 0.32)

    draw = ImageDraw.Draw(bg)
    draw_panel(draw, f"{villain_name} was touched by the grace of God", 36)
    draw_panel(draw, f"and became {redeemed_name}", 624)

    cross_x, cross_y = 590, 228
    draw.line((cross_x, cross_y, cross_x, cross_y + 82), fill=(255, 248, 211, 230), width=10)
    draw.line((cross_x - 36, cross_y + 32, cross_x + 36, cross_y + 32), fill=(255, 248, 211, 230), width=10)
    return bg.convert("RGB")


def render_video(world_key: str, suffix: str, redeemed_key: str) -> None:
    world = WORLDS[world_key]
    out_dir = ROOT / "video-intro" / world_key
    out_name = f"{world['prefix']}-{suffix}.mp4" if suffix != "placeholder" else f"{world['prefix']}-placeholder.mp4"
    out_path = out_dir / out_name
    redeemed = REDEEMED[redeemed_key]

    with tempfile.TemporaryDirectory(prefix=f"{world_key}-ending-") as tmp:
        frame_dir = Path(tmp) / "frames"
        frame_dir.mkdir()
        for frame in range(FPS * DURATION):
            t = frame / (FPS * DURATION - 1)
            make_frame(world, redeemed, t).save(frame_dir / f"{frame:04d}.jpg", quality=92)
        silent = Path(tmp) / "video.mp4"
        subprocess.run(
            [
                str(PY_FFMPEG),
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                "-framerate",
                str(FPS),
                "-i",
                str(frame_dir / "%04d.jpg"),
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-t",
                str(DURATION),
                str(silent),
            ],
            check=True,
        )
        if out_path.exists():
            muxed = Path(tmp) / "muxed.mp4"
            result = subprocess.run(
                [
                    str(PY_FFMPEG),
                    "-y",
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-i",
                    str(silent),
                    "-i",
                    str(out_path),
                    "-map",
                    "0:v:0",
                    "-map",
                    "1:a:0?",
                    "-c:v",
                    "copy",
                    "-c:a",
                    "aac",
                    "-shortest",
                    str(muxed),
                ]
            )
            shutil.copyfile(muxed if result.returncode == 0 and muxed.exists() else silent, out_path)
        else:
            shutil.copyfile(silent, out_path)
    print(out_path.relative_to(ROOT))


def main() -> None:
    jobs = {
        "dona-carmelina": "dona-carmelina",
        "tan": "tan",
        "mr-zuil": "mr-zuil",
        "mr-hernandez": "mr-hernandez",
        "mr-domingo": "mr-domingo",
        "don-maro": "don-maro",
        "lady-seferina": "lady-seferina",
        "mr-tio": "mr-tio",
        "father-v": "father-v",
        "father-m": "father-m",
        "padrino": "padrino",
        "placeholder": "padrino",
    }
    for world_key in WORLDS:
        for suffix, redeemed_key in jobs.items():
            render_video(world_key, suffix, redeemed_key)


if __name__ == "__main__":
    main()
