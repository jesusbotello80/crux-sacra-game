from __future__ import annotations

import math
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
FFMPEG = Path("/opt/homebrew/bin/ffmpeg")
FPS = 12
INTRO_DURATION = 8
ENDING_DURATION = 8
W, H = 1280, 720


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
    ):
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            pass
    return ImageFont.load_default()


FONT_TITLE = font(54)
FONT_SUBTITLE = font(32)
FONT_SMALL = font(25)


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


def fit_width(im: Image.Image, width: int) -> Image.Image:
    im = im.convert("RGBA")
    height = round(im.height * width / im.width)
    return im.resize((width, height), Image.Resampling.LANCZOS)


def paste_shadow(base: Image.Image, sprite: Image.Image, x: int, y: int, alpha: float = 0.35) -> None:
    shadow = Image.new("RGBA", sprite.size, (0, 0, 0, 0))
    shadow_alpha = sprite.getchannel("A").filter(ImageFilter.GaussianBlur(12))
    shadow.putalpha(shadow_alpha.point(lambda p: int(p * alpha)))
    base.alpha_composite(shadow, (x + 12, y + 18))
    base.alpha_composite(sprite, (x, y))


def draw_centered(draw: ImageDraw.ImageDraw, text: str, y: int, fnt, fill=(255, 248, 211, 255)) -> None:
    bbox = draw.textbbox((0, 0), text, font=fnt)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), text, font=fnt, fill=fill)


def draw_panel(draw: ImageDraw.ImageDraw, text: str, y: int, fnt=FONT_SUBTITLE) -> None:
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (W - tw) // 2
    draw.rounded_rectangle((x - 30, y - 16, x + tw + 30, y + th + 22), radius=18,
                           fill=(7, 12, 23, 182), outline=(255, 228, 112, 210), width=2)
    draw.text((x, y), text, font=fnt, fill=(255, 248, 211, 255))


def load_sprite(path: str, height: int | None = None, width: int | None = None) -> Image.Image:
    im = Image.open(ROOT / path).convert("RGBA")
    if height:
        return fit_height(im, height)
    if width:
        return fit_width(im, width)
    return im


def make_intro_frame(t: float) -> Image.Image:
    backgrounds = [
        "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-1-ejido.png",
        "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-3-torreon-stadium.png",
        "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-4-lerdo-church.png",
        "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-7-monterrey-boss.png",
    ]
    idx = min(len(backgrounds) - 1, int(t * len(backgrounds)))
    local_t = (t * len(backgrounds)) % 1
    bg = fit_cover(Image.open(ROOT / backgrounds[idx]), (W, H)).convert("RGBA")
    bg = ImageEnhance.Color(bg).enhance(1.08)
    bg = ImageEnhance.Contrast(bg).enhance(1.06)
    bg.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, 55)))

    villain = load_sprite("character-sprites/la-aparecida-carretera/la-aparecida-carretera-cutout.png", height=410)
    vx = 820 + round(math.sin(t * math.tau * 1.3) * 16)
    vy = 180 + round(math.sin(t * math.tau * 1.8) * 8)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((vx - 70, vy - 35, vx + villain.width + 90, vy + villain.height + 70),
               fill=(85, 226, 218, 45 + round(24 * local_t)))
    bg.alpha_composite(glow.filter(ImageFilter.GaussianBlur(24)))
    paste_shadow(bg, villain, vx, vy, 0.42)

    timmy = load_sprite("character-sprites/timmy/timmy-front-full-reference.png", height=165)
    paste_shadow(bg, timmy, 110 + round(math.sin(t * math.tau) * 8), 505, 0.28)

    draw = ImageDraw.Draw(bg)
    draw_panel(draw, "El Rancho / La Comarca Lagunera", 40, FONT_TITLE)
    draw_panel(draw, "La Aparecida de la Carretera ronda los caminos", 620, FONT_SUBTITLE)
    return bg.convert("RGB")


def make_ending_frame(t: float) -> Image.Image:
    bg = fit_cover(Image.open(ROOT / "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-4-lerdo-church.png"), (W, H)).convert("RGBA")
    bg = ImageEnhance.Color(bg).enhance(1.08)
    bg = ImageEnhance.Contrast(bg).enhance(1.04)
    bg.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, 38)))

    pulse = 0.5 + 0.5 * math.sin(t * math.tau * 2)
    light = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(light)
    ld.ellipse((432, 94, 758, 612), fill=(255, 244, 168, 34 + round(pulse * 24)))
    ld.ellipse((300, 0, 900, 720), fill=(255, 244, 168, 16 + round(pulse * 12)))
    bg.alpha_composite(light.filter(ImageFilter.GaussianBlur(28)))

    jesus = load_sprite("character-sprites/jesus/jesus-divine-mercy-transparent.png", height=335)
    mary = load_sprite("character-sprites/saints/st-mary-reference.png", height=210)
    villain = load_sprite("character-sprites/la-aparecida-carretera/la-aparecida-carretera-cutout.png", height=310)
    redeemed = load_sprite("character-sprites/tacalache-redeemed/tacalache-redeemed-transparent.png", height=275)

    paste_shadow(bg, jesus, 455, 145, 0.25)
    paste_shadow(bg, mary, 322, 280, 0.22)
    sad = ImageEnhance.Brightness(villain).enhance(0.70)
    paste_shadow(bg, sad, 780 + round(math.sin(t * math.tau) * 5), 250, 0.28)
    paste_shadow(bg, redeemed, 125 + round(math.sin(t * math.tau * 1.4) * 5), 360, 0.28)

    draw = ImageDraw.Draw(bg)
    draw_panel(draw, "La Aparecida was touched by the grace of God", 42, FONT_SUBTITLE)
    draw_panel(draw, "and the family roads were filled with peace", 624, FONT_SUBTITLE)
    cross_x, cross_y = 638, 230
    draw.line((cross_x, cross_y, cross_x, cross_y + 82), fill=(255, 248, 211, 230), width=10)
    draw.line((cross_x - 36, cross_y + 32, cross_x + 36, cross_y + 32), fill=(255, 248, 211, 230), width=10)
    return bg.convert("RGB")


def render(kind: str, maker, duration: int, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=f"el-rancho-{kind}-") as tmp:
        frame_dir = Path(tmp) / "frames"
        frame_dir.mkdir()
        total = FPS * duration
        for frame in range(total):
            t = frame / max(1, total - 1)
            maker(t).save(frame_dir / f"{frame:04d}.jpg", quality=92)
        silent = Path(tmp) / "silent.mp4"
        subprocess.run([
            str(FFMPEG), "-y", "-hide_banner", "-loglevel", "error",
            "-framerate", str(FPS), "-i", str(frame_dir / "%04d.jpg"),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-t", str(duration), str(silent),
        ], check=True)
        audio = ROOT / "audio/ending-song-8s-fade.m4a"
        if audio.exists():
            subprocess.run([
                str(FFMPEG), "-y", "-hide_banner", "-loglevel", "error",
                "-i", str(silent), "-i", str(audio),
                "-map", "0:v:0", "-map", "1:a:0",
                "-c:v", "copy", "-c:a", "aac", "-shortest", str(out_path),
            ], check=True)
        else:
            shutil.copyfile(silent, out_path)
    print(out_path.relative_to(ROOT))


def main() -> None:
    render("intro", make_intro_frame, INTRO_DURATION, ROOT / "video-intro/world9/crux-sacra-el-rancho-intro.mp4")
    render("ending", make_ending_frame, ENDING_DURATION, ROOT / "video-intro/world9/crux-sacra-el-rancho-redemption-placeholder.mp4")


if __name__ == "__main__":
    main()
