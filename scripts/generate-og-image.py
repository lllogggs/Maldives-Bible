from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts" / "assets" / "og" / "fictional-luxury-maldives-resort.png"
OUTPUT = ROOT / "public" / "og-image.jpg"
FONT_DIR = ROOT / "public" / "fonts" / "nanum-square-neo"
FONT_TITLE = FONT_DIR / "NanumSquareNeoTTF-eHv.woff2"
FONT_TAGLINE = FONT_DIR / "NanumSquareNeoTTF-dEb.woff2"
CANVAS_SIZE = (1200, 630)
SCALE = 3

TITLE_COLOR = (250, 249, 243, 255)
TAGLINE_COLOR = (214, 241, 235, 255)
SCRIM_COLOR = (0, 47, 61)


def scale(value: float) -> int:
    return round(value * SCALE)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if not path.exists():
        raise FileNotFoundError(f"Font not found: {path}")
    return ImageFont.truetype(str(path), size * SCALE)


def smoothstep(value: float) -> float:
    clamped = max(0.0, min(1.0, value))
    return clamped * clamped * (3 - 2 * clamped)


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
    draw = ImageDraw.Draw(image)

    draw.text(
        (scale(76), scale(255)),
        "몰디브 바이블",
        font=font(FONT_TITLE, 84),
        fill=TITLE_COLOR,
        anchor="lm",
    )
    draw.text(
        (scale(80), scale(367)),
        "리조트 비교를 더 쉽게",
        font=font(FONT_TAGLINE, 38),
        fill=TAGLINE_COLOR,
        anchor="lm",
    )

    return image.convert("RGB").resize(CANVAS_SIZE, Image.Resampling.LANCZOS)


def main() -> None:
    final_image = generate()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    final_image.save(OUTPUT, "JPEG", quality=95, optimize=True, progressive=True)
    print(f"Generated {OUTPUT} ({CANVAS_SIZE[0]}x{CANVAS_SIZE[1]})")


if __name__ == "__main__":
    main()
