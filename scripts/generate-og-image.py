from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "scripts" / "assets" / "og-background.jpg"
OUTPUT = ROOT / "public" / "og-image.jpg"
LOGO = ROOT / "public" / "brand" / "maldives-bible-logo.png"
FONT_REGULAR = ROOT / "public" / "fonts" / "nanum-square-neo" / "NanumSquareNeoTTF-bRg.woff2"
FONT_BOLD = ROOT / "public" / "fonts" / "nanum-square-neo" / "NanumSquareNeoTTF-cBd.woff2"
FONT_EXTRA_BOLD = ROOT / "public" / "fonts" / "nanum-square-neo" / "NanumSquareNeoTTF-dEb.woff2"
CANVAS_SIZE = (1200, 630)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def prepare_background(source: Path) -> Image.Image:
    with Image.open(source) as image:
        return ImageOps.fit(
            image.convert("RGB"),
            CANVAS_SIZE,
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.52),
        )


def add_readability_gradient(image: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    fade_end = 790

    for x in range(fade_end):
        progress = x / fade_end
        alpha = round(196 * (1 - progress) ** 1.55)
        draw.line((x, 0, x, CANVAS_SIZE[1]), fill=(2, 35, 48, alpha))

    draw.rectangle((0, 500, CANVAS_SIZE[0], CANVAS_SIZE[1]), fill=(2, 23, 32, 24))
    return Image.alpha_composite(image.convert("RGBA"), overlay)


def add_brand_and_title(image: Image.Image) -> Image.Image:
    draw = ImageDraw.Draw(image)
    brand_en_font = ImageFont.truetype(str(FONT_BOLD), 18)
    brand_ko_font = ImageFont.truetype(str(FONT_BOLD), 25)
    headline_font = ImageFont.truetype(str(FONT_EXTRA_BOLD), 72)

    chip_box = (52, 44, 390, 142)
    draw.rounded_rectangle(chip_box, radius=22, fill=(255, 255, 255, 235))

    with Image.open(LOGO) as logo_source:
        logo = ImageOps.fit(
            logo_source.convert("RGB"),
            (72, 72),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        ).convert("RGBA")
    image.paste(logo, (66, 57), rounded_mask(logo.size, 16))

    draw.text((154, 65), "MALDIVES BIBLE", font=brand_en_font, fill=(15, 118, 110, 255))
    draw.text((154, 92), "몰디브 리조트", font=brand_ko_font, fill=(15, 23, 42, 255))

    headline_color = (255, 255, 255, 255)
    shadow_color = (2, 23, 32, 105)
    for text, y in (("몰디브 리조트", 236), ("한눈에 비교", 326)):
        draw.text((67, y + 3), text, font=headline_font, fill=shadow_color)
        draw.text((64, y), text, font=headline_font, fill=headline_color)

    return image


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate the Maldives Bible Open Graph image.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Background image path")
    parser.add_argument(
        "--save-background",
        type=Path,
        help="Optionally save the cropped background as a reusable JPEG before adding text",
    )
    args = parser.parse_args()

    source = args.source.resolve()
    if not source.exists():
        raise FileNotFoundError(f"Background image not found: {source}")

    background = prepare_background(source)
    if args.save_background:
        args.save_background.parent.mkdir(parents=True, exist_ok=True)
        background.save(args.save_background, "JPEG", quality=92, optimize=True, progressive=True)

    final_image = add_brand_and_title(add_readability_gradient(background))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    final_image.convert("RGB").save(OUTPUT, "JPEG", quality=91, optimize=True, progressive=True)
    print(f"Generated {OUTPUT} ({CANVAS_SIZE[0]}x{CANVAS_SIZE[1]})")


if __name__ == "__main__":
    main()
