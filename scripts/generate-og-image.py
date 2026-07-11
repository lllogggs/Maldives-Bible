from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PRIMARY = ROOT / "scripts" / "assets" / "og-background.jpg"
DEFAULT_SECONDARY = ROOT / "scripts" / "assets" / "og-resort-aerial.jpg"
OUTPUT = ROOT / "public" / "og-image.jpg"
FONT_REGULAR = ROOT / "public" / "fonts" / "nanum-square-neo" / "NanumSquareNeoTTF-bRg.woff2"
FONT_BOLD = ROOT / "public" / "fonts" / "nanum-square-neo" / "NanumSquareNeoTTF-cBd.woff2"
FONT_EXTRA_BOLD = ROOT / "public" / "fonts" / "nanum-square-neo" / "NanumSquareNeoTTF-dEb.woff2"
CANVAS_SIZE = (1200, 630)

INK = (15, 23, 42)
MUTED = (71, 85, 105)
TEAL = (15, 118, 110)
TEAL_DARK = (8, 82, 77)
TEAL_PALE = (240, 253, 250)
WHITE = (255, 255, 255)
BORDER = (215, 228, 225)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def load_photo(path: Path, size: tuple[int, int], centering: tuple[float, float]) -> Image.Image:
    with Image.open(path) as source:
        source = ImageOps.exif_transpose(source).convert("RGB")
        return ImageOps.fit(
            source,
            size,
            method=Image.Resampling.LANCZOS,
            centering=centering,
        )


def add_soft_shadow(
    image: Image.Image,
    box: tuple[int, int, int, int],
    radius: int,
    blur: int,
    offset_y: int,
    alpha: int,
) -> Image.Image:
    shadow = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    x1, y1, x2, y2 = box
    ImageDraw.Draw(shadow).rounded_rectangle(
        (x1, y1 + offset_y, x2, y2 + offset_y),
        radius=radius,
        fill=(9, 70, 66, alpha),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(image.convert("RGBA"), shadow)


def draw_search_icon(draw: ImageDraw.ImageDraw, center: tuple[int, int]) -> None:
    x, y = center
    draw.ellipse((x - 9, y - 9, x + 7, y + 7), outline=TEAL, width=3)
    draw.line((x + 5, y + 5, x + 14, y + 14), fill=TEAL, width=3)


def draw_check(draw: ImageDraw.ImageDraw, center: tuple[int, int]) -> None:
    x, y = center
    draw.ellipse((x - 17, y - 17, x + 17, y + 17), fill=TEAL)
    draw.line((x - 8, y, x - 2, y + 7), fill=WHITE, width=4)
    draw.line((x - 2, y + 7, x + 9, y - 7), fill=WHITE, width=4)


def draw_chip(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    label: str,
    label_font: ImageFont.FreeTypeFont,
    *,
    selected: bool = False,
) -> int:
    bbox = draw.textbbox((0, 0), label, font=label_font)
    width = bbox[2] - bbox[0] + 34
    fill = TEAL_PALE if selected else WHITE
    outline = (153, 220, 211) if selected else BORDER
    draw.rounded_rectangle((x, y, x + width, y + 42), radius=21, fill=fill, outline=outline, width=2)
    draw.text((x + 17, y + 10), label, font=label_font, fill=TEAL if selected else MUTED)
    return width


def draw_resort_card(
    image: Image.Image,
    box: tuple[int, int, int, int],
    photo_path: Path,
    photo_centering: tuple[float, float],
    title: str,
    tags: tuple[str, str],
) -> None:
    draw = ImageDraw.Draw(image)
    x1, y1, x2, y2 = box
    width = x2 - x1
    photo_height = 148

    draw.rounded_rectangle(box, radius=18, fill=WHITE, outline=BORDER, width=2)
    photo = load_photo(photo_path, (width, photo_height), photo_centering)
    image.paste(photo, (x1, y1), rounded_mask(photo.size, 18))

    draw_check(draw, (x2 - 25, y1 + 25))
    card_title_font = font(FONT_BOLD, 20)
    tag_font = font(FONT_BOLD, 15)
    metric_font = font(FONT_REGULAR, 15)
    metric_bold_font = font(FONT_BOLD, 16)

    draw.text((x1 + 16, y1 + 166), title, font=card_title_font, fill=INK)
    chip_x = x1 + 16
    for label in tags:
        bbox = draw.textbbox((0, 0), label, font=tag_font)
        chip_width = bbox[2] - bbox[0] + 24
        draw.rounded_rectangle(
            (chip_x, y1 + 202, chip_x + chip_width, y1 + 232),
            radius=15,
            fill=(255, 241, 242),
        )
        draw.text((chip_x + 12, y1 + 209), label, font=tag_font, fill=(190, 18, 60))
        chip_x += chip_width + 7

    draw.line((x1 + 16, y1 + 248, x2 - 16, y1 + 248), fill=(231, 238, 237), width=2)
    draw.text((x1 + 16, y1 + 262), "수중환경", font=metric_font, fill=MUTED)
    draw.text((x2 - 52, y1 + 260), "4 / 5", font=metric_bold_font, fill=TEAL_DARK)


def generate(primary_path: Path, secondary_path: Path) -> Image.Image:
    width, height = CANVAS_SIZE
    canvas = Image.new("RGBA", CANVAS_SIZE, (244, 250, 249, 255))
    background = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(background)

    for x in range(width):
        progress = x / (width - 1)
        color = (
            round(247 - 12 * progress),
            round(251 - 1 * progress),
            round(250 - 4 * progress),
            255,
        )
        bg_draw.line((x, 0, x, height), fill=color)

    bg_draw.ellipse((850, -150, 1320, 320), fill=(192, 241, 233, 135))
    bg_draw.ellipse((-140, 470, 300, 850), fill=(220, 244, 239, 160))
    background = background.filter(ImageFilter.GaussianBlur(28))
    canvas = Image.alpha_composite(canvas, background)

    panel_box = (574, 42, 1140, 588)
    canvas = add_soft_shadow(canvas, panel_box, radius=30, blur=22, offset_y=11, alpha=38)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(panel_box, radius=30, fill=WHITE, outline=(226, 235, 233), width=2)

    brand_font = font(FONT_BOLD, 20)
    headline_font = font(FONT_EXTRA_BOLD, 56)
    action_font = font(FONT_EXTRA_BOLD, 76)
    subcopy_font = font(FONT_REGULAR, 23)
    search_font = font(FONT_REGULAR, 21)
    search_button_font = font(FONT_BOLD, 18)
    chip_font = font(FONT_BOLD, 17)

    draw.text((72, 57), "MALDIVES BIBLE", font=brand_font, fill=TEAL)
    draw.rounded_rectangle((72, 94, 112, 98), radius=2, fill=TEAL)
    draw.text((72, 145), "몰디브 리조트", font=headline_font, fill=INK)
    draw.text((72, 215), "검색 · 비교", font=action_font, fill=TEAL_DARK)
    draw.text((72, 317), "원하는 조건으로 찾고, 나란히 비교", font=subcopy_font, fill=MUTED)

    search_box = (72, 372, 520, 446)
    draw.rounded_rectangle(search_box, radius=18, fill=WHITE, outline=(190, 211, 207), width=2)
    draw_search_icon(draw, (105, 408))
    draw.text((132, 394), "리조트 이름 검색", font=search_font, fill=(100, 116, 139))
    draw.rounded_rectangle((430, 382, 508, 436), radius=14, fill=TEAL_DARK)
    draw.text((451, 398), "검색", font=search_button_font, fill=WHITE)

    chip_x = 72
    for label in ("예산", "이동", "객실"):
        chip_x += draw_chip(draw, chip_x, 475, label, chip_font, selected=label == "예산") + 10

    panel_title_font = font(FONT_BOLD, 26)
    panel_count_font = font(FONT_BOLD, 18)
    draw.text((610, 75), "비교 리조트", font=panel_title_font, fill=INK)
    draw.text((1027, 81), "2 / 3 선택", font=panel_count_font, fill=TEAL)

    draw_resort_card(
        canvas,
        (610, 124, 850, 428),
        primary_path,
        (0.34, 0.5),
        "워터빌라 중심",
        ("보트", "개인풀"),
    )
    draw_resort_card(
        canvas,
        (870, 124, 1110, 428),
        secondary_path,
        (0.5, 0.5),
        "섬 · 비치 중심",
        ("수상비행기", "워터빌라"),
    )

    draw = ImageDraw.Draw(canvas)
    compare_box = (610, 458, 1110, 544)
    draw.rounded_rectangle(compare_box, radius=20, fill=TEAL_DARK)
    compare_label_font = font(FONT_REGULAR, 18)
    compare_action_font = font(FONT_BOLD, 27)
    draw.text((638, 478), "선택한 리조트", font=compare_label_font, fill=(190, 236, 230))
    draw.text((638, 505), "2곳 비교", font=compare_action_font, fill=WHITE)
    draw.ellipse((1040, 480, 1084, 524), fill=(42, 135, 127))
    draw.line((1054, 502, 1070, 502), fill=WHITE, width=3)
    draw.line((1064, 494, 1072, 502), fill=WHITE, width=3)
    draw.line((1064, 510, 1072, 502), fill=WHITE, width=3)

    return canvas.convert("RGB")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate the Maldives Bible search-and-compare OG image.")
    parser.add_argument("--primary", type=Path, default=DEFAULT_PRIMARY, help="First resort photo path")
    parser.add_argument("--secondary", type=Path, default=DEFAULT_SECONDARY, help="Second resort photo path")
    args = parser.parse_args()

    primary_path = args.primary.resolve()
    secondary_path = args.secondary.resolve()
    for path in (primary_path, secondary_path):
        if not path.exists():
            raise FileNotFoundError(f"Resort photo not found: {path}")

    final_image = generate(primary_path, secondary_path)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    final_image.save(OUTPUT, "JPEG", quality=93, optimize=True, progressive=True)
    print(f"Generated {OUTPUT} ({CANVAS_SIZE[0]}x{CANVAS_SIZE[1]})")


if __name__ == "__main__":
    main()
