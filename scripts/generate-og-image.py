from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts" / "assets" / "og" / "fictional-luxury-maldives-resort.png"
OUTPUT = ROOT / "public" / "og-image.jpg"
FONT_DIR = ROOT / "public" / "fonts" / "nanum-square-neo"
FONT_TITLE = FONT_DIR / "NanumSquareNeoTTF-dEb.woff2"
FONT_TAGLINE = FONT_DIR / "NanumSquareNeoTTF-bRg.woff2"
CANVAS_SIZE = (1200, 630)
SCALE = 3

TITLE_COLOR = (250, 249, 243, 255)
WORDMARK_GOLD = (232, 213, 171, 255)
TAGLINE_COLOR = (228, 241, 237, 255)
SCRIM_COLOR = (0, 47, 61)
CHAMPAGNE_GOLD = (215, 190, 134, 235)


def scale(value: float) -> int:
    return round(value * SCALE)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if not path.exists():
        raise FileNotFoundError(f"Font not found: {path}")
    return ImageFont.truetype(str(path), size * SCALE)


def smoothstep(value: float) -> float:
    clamped = max(0.0, min(1.0, value))
    return clamped * clamped * (3 - 2 * clamped)


def cubic_curve(
    start: tuple[float, float],
    control_a: tuple[float, float],
    control_b: tuple[float, float],
    end: tuple[float, float],
    steps: int = 32,
) -> list[tuple[int, int]]:
    curve: list[tuple[int, int]] = []
    for index in range(steps + 1):
        progress = index / steps
        inverse = 1 - progress
        x = (
            inverse**3 * start[0]
            + 3 * inverse**2 * progress * control_a[0]
            + 3 * inverse * progress**2 * control_b[0]
            + progress**3 * end[0]
        )
        y = (
            inverse**3 * start[1]
            + 3 * inverse**2 * progress * control_a[1]
            + 3 * inverse * progress**2 * control_b[1]
            + progress**3 * end[1]
        )
        curve.append((scale(x), scale(y)))
    return curve


def add_text_scrim(image: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    solid_until = scale(470)
    fade_until = scale(810)
    for x in range(image.width):
        if x <= solid_until:
            alpha = 184
        elif x >= fade_until:
            alpha = 0
        else:
            progress = (x - solid_until) / (fade_until - solid_until)
            alpha = round(184 * (1 - smoothstep(progress)))
        draw.line(((x, 0), (x, image.height)), fill=(*SCRIM_COLOR, alpha))

    return Image.alpha_composite(image, overlay)


def add_brand_details(image: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    line_width = scale(1.6)

    # An original open-book mark whose pages also read as a shell and lagoon.
    draw.ellipse(
        (scale(100.5), scale(143), scale(107.5), scale(150)),
        fill=CHAMPAGNE_GOLD,
    )
    draw.line(
        cubic_curve((104, 158), (97, 151), (88, 150), (80, 155)),
        fill=CHAMPAGNE_GOLD,
        width=line_width,
        joint="curve",
    )
    draw.line(
        cubic_curve((104, 158), (111, 151), (120, 150), (128, 155)),
        fill=CHAMPAGNE_GOLD,
        width=line_width,
        joint="curve",
    )
    draw.line(
        cubic_curve((80, 155), (82, 168), (88, 180), (104, 187)),
        fill=CHAMPAGNE_GOLD,
        width=line_width,
        joint="curve",
    )
    draw.line(
        cubic_curve((128, 155), (126, 168), (120, 180), (104, 187)),
        fill=CHAMPAGNE_GOLD,
        width=line_width,
        joint="curve",
    )
    draw.line(
        cubic_curve((85, 161), (91, 157), (98, 157), (104, 162)),
        fill=CHAMPAGNE_GOLD,
        width=line_width,
        joint="curve",
    )
    draw.line(
        cubic_curve((123, 161), (117, 157), (110, 157), (104, 162)),
        fill=CHAMPAGNE_GOLD,
        width=line_width,
        joint="curve",
    )
    draw.line(
        cubic_curve((104, 158), (103, 168), (103, 179), (104, 187)),
        fill=CHAMPAGNE_GOLD,
        width=line_width,
        joint="curve",
    )

    return Image.alpha_composite(image, overlay)


def draw_tracked_text(
    draw: ImageDraw.ImageDraw,
    position: tuple[int, int],
    text: str,
    text_font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int],
    tracking: float,
) -> int:
    x, y = position
    for index, character in enumerate(text):
        draw.text((round(x), y), character, font=text_font, fill=fill, anchor="lm")
        x += draw.textlength(character, font=text_font)
        if index < len(text) - 1:
            x += scale(tracking)
    return round(x)


def generate() -> Image.Image:
    if not SOURCE.exists():
        raise FileNotFoundError(f"OG source image not found: {SOURCE}")

    high_res_size = (CANVAS_SIZE[0] * SCALE, CANVAS_SIZE[1] * SCALE)
    with Image.open(SOURCE) as source:
        image = ImageOps.fit(
            source.convert("RGB"),
            high_res_size,
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        ).convert("RGBA")

    image = add_text_scrim(image)
    image = add_brand_details(image)
    draw = ImageDraw.Draw(image)

    title_font = font(FONT_TITLE, 82)
    title_accent_font = font(FONT_TAGLINE, 66)
    title_position = (scale(76), scale(255))
    draw.text(
        title_position,
        "몰디브",
        font=title_font,
        fill=TITLE_COLOR,
        anchor="lm",
    )
    title_accent_x = (
        title_position[0]
        + round(draw.textlength("몰디브", font=title_font))
        + scale(25)
    )
    title_accent_end = draw_tracked_text(
        draw,
        (title_accent_x, scale(257)),
        "바이블",
        title_accent_font,
        WORDMARK_GOLD,
        tracking=5.5,
    )
    draw.line(
        (
            (title_accent_x, scale(307)),
            (title_accent_end, scale(307)),
        ),
        fill=WORDMARK_GOLD,
        width=scale(1.2),
    )
    draw_tracked_text(
        draw,
        (scale(80), scale(367)),
        "리조트 비교를 더 쉽게",
        font(FONT_TAGLINE, 31),
        TAGLINE_COLOR,
        tracking=2.2,
    )

    return image.convert("RGB").resize(CANVAS_SIZE, Image.Resampling.LANCZOS)


def main() -> None:
    final_image = generate()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    final_image.save(OUTPUT, "JPEG", quality=95, optimize=True, progressive=True)
    print(f"Generated {OUTPUT} ({CANVAS_SIZE[0]}x{CANVAS_SIZE[1]})")


if __name__ == "__main__":
    main()
