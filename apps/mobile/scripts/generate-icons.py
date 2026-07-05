"""Generate Expo app icon PNGs from the Anghkooey mark (yellow circle + black A)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "assets"
SIZE = 1024

ORANGE = "#FE3C00"
YELLOW = "#ECD94C"
NIGHT = "#151210"

FONT_CANDIDATES = [
    Path("C:/Windows/Fonts/arialbd.ttf"),
    Path("C:/Windows/Fonts/calibrib.ttf"),
    Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
]


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_CANDIDATES:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def draw_mark(
    draw: ImageDraw.ImageDraw,
    cx: float,
    cy: float,
    radius: float,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    *,
    ring: float = 0.04,
) -> None:
    r = radius
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=YELLOW)
    stroke = max(8, int(r * ring))
    draw.ellipse(
        (cx - r, cy - r, cx + r, cy + r),
        outline=NIGHT,
        width=stroke,
    )
    bbox = draw.textbbox((0, 0), "A", font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((cx - tw / 2, cy - th / 2 - th * 0.08), "A", fill=NIGHT, font=font)


def make_icon() -> Image.Image:
    img = Image.new("RGB", (SIZE, SIZE), ORANGE)
    draw = ImageDraw.Draw(img)
    font = load_font(int(SIZE * 0.42))
    draw_mark(draw, SIZE / 2, SIZE / 2, SIZE * 0.36, font, ring=0.035)
    return img


def make_adaptive_foreground() -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    font = load_font(int(SIZE * 0.34))
    # Android safe zone ~66% — keep mark inside center 640px
    draw_mark(draw, SIZE / 2, SIZE / 2, SIZE * 0.28, font, ring=0.045)
    return img


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    icon = make_icon()
    adaptive = make_adaptive_foreground()
    icon.save(ROOT / "icon.png", "PNG")
    adaptive.save(ROOT / "adaptive-icon.png", "PNG")
    print(f"Wrote {ROOT / 'icon.png'}")
    print(f"Wrote {ROOT / 'adaptive-icon.png'}")


if __name__ == "__main__":
    main()
