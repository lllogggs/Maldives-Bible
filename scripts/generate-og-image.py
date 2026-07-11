from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-image.jpg"
FONT_BOLD = ROOT / "scripts" / "assets" / "fonts" / "pretendard" / "Pretendard-Bold.otf"
FONT_MEDIUM = ROOT / "scripts" / "assets" / "fonts" / "pretendard" / "Pretendard-Medium.otf"
CANVAS_SIZE = (1200, 630)

BACKGROUND = (255, 255, 255)
TITLE_COLOR = (15, 23, 42)
TAGLINE_COLOR = (15, 118, 110)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if not path.exists():
        raise FileNotFoundError(f"Font not found: {path}")
    return ImageFont.truetype(str(path), size)


def generate() -> Image.Image:
    image = Image.new("RGB", CANVAS_SIZE, BACKGROUND)
    draw = ImageDraw.Draw(image)

    title_font = font(FONT_BOLD, 100)
    tagline_font = font(FONT_MEDIUM, 52)

    draw.text(
        (CANVAS_SIZE[0] // 2, 260),
        "몰디브 바이블",
        font=title_font,
        fill=TITLE_COLOR,
        anchor="mm",
    )
    draw.text(
        (CANVAS_SIZE[0] // 2, 370),
        "리조트 비교를 더 쉽게",
        font=tagline_font,
        fill=TAGLINE_COLOR,
        anchor="mm",
    )
    return image


def main() -> None:
    final_image = generate()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    final_image.save(OUTPUT, "JPEG", quality=95, optimize=True, progressive=True)
    print(f"Generated {OUTPUT} ({CANVAS_SIZE[0]}x{CANVAS_SIZE[1]})")


if __name__ == "__main__":
    main()
