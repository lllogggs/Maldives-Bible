from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-image.jpg"
FONT_BOLD = ROOT / "scripts" / "assets" / "fonts" / "pretendard" / "Pretendard-Bold.otf"
FONT_MEDIUM = ROOT / "scripts" / "assets" / "fonts" / "pretendard" / "Pretendard-Medium.otf"
CANVAS_SIZE = (1200, 630)

BACKGROUND = (250, 248, 242)
TITLE_COLOR = (7, 59, 76)
TAGLINE_COLOR = (82, 105, 107)
TEAL = (15, 118, 110)
MINT = (188, 234, 226)
MINT_STRONG = (121, 211, 199)
MINT_PALE = (230, 244, 240)
CARD_BORDER = (183, 221, 214)
CORAL = (255, 138, 101)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if not path.exists():
        raise FileNotFoundError(f"Font not found: {path}")
    return ImageFont.truetype(str(path), size)


def generate() -> Image.Image:
    image = Image.new("RGB", CANVAS_SIZE, BACKGROUND)
    draw = ImageDraw.Draw(image)

    title_font = font(FONT_BOLD, 86)
    tagline_font = font(FONT_MEDIUM, 44)

    draw.text(
        (108, 252),
        "몰디브 바이블",
        font=title_font,
        fill=TITLE_COLOR,
        anchor="lm",
    )
    draw.text(
        (112, 356),
        "리조트 비교를 더 쉽게",
        font=tagline_font,
        fill=TAGLINE_COLOR,
        anchor="lm",
    )

    left_card = (748, 134, 928, 496)
    right_card = (944, 134, 1124, 496)
    draw.rounded_rectangle(left_card, radius=38, fill=(255, 255, 255), outline=CARD_BORDER, width=3)
    draw.rounded_rectangle(right_card, radius=38, fill=MINT_PALE, outline=(157, 209, 199), width=3)

    draw.ellipse((774, 182, 900, 276), fill=MINT)
    draw.ellipse((813, 208, 866, 250), fill=BACKGROUND)
    draw.ellipse((866, 174, 890, 198), fill=CORAL)

    draw.ellipse((968, 180, 1100, 280), fill=MINT_STRONG)
    draw.ellipse((1005, 207, 1062, 255), fill=(255, 255, 255))

    for x1, x2, y, color in (
        (784, 892, 336, (210, 228, 224)),
        (784, 866, 376, (224, 235, 232)),
        (784, 878, 416, (224, 235, 232)),
        (980, 1088, 336, (154, 209, 199)),
        (980, 1062, 376, (188, 223, 216)),
        (980, 1074, 416, (188, 223, 216)),
    ):
        draw.rounded_rectangle((x1, y, x2, y + 12), radius=6, fill=color)

    draw.ellipse((914, 292, 958, 336), fill=TITLE_COLOR)
    draw.line((924, 307, 943, 307), fill=(255, 255, 255), width=3)
    draw.line((938, 302, 944, 307), fill=(255, 255, 255), width=3)
    draw.line((938, 312, 944, 307), fill=(255, 255, 255), width=3)
    draw.line((948, 321, 929, 321), fill=(255, 255, 255), width=3)
    draw.line((934, 316, 928, 321), fill=(255, 255, 255), width=3)
    draw.line((934, 326, 928, 321), fill=(255, 255, 255), width=3)
    return image


def main() -> None:
    final_image = generate()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    final_image.save(OUTPUT, "JPEG", quality=95, optimize=True, progressive=True)
    print(f"Generated {OUTPUT} ({CANVAS_SIZE[0]}x{CANVAS_SIZE[1]})")


if __name__ == "__main__":
    main()
