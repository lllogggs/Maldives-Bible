from __future__ import annotations

from math import atan2, cos, degrees, pi, radians, sin
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-image.jpg"
FONT_DIR = ROOT / "public" / "fonts" / "nanum-square-neo"
FONT_TITLE = FONT_DIR / "NanumSquareNeoTTF-eHv.woff2"
FONT_TAGLINE = FONT_DIR / "NanumSquareNeoTTF-dEb.woff2"
CANVAS_SIZE = (1200, 630)
SCALE = 3

BACKGROUND = (247, 247, 243, 255)
TITLE_COLOR = (12, 55, 67, 255)
TAGLINE_COLOR = (61, 88, 94, 255)
LAGOON = (77, 218, 207, 255)
LAGOON_LIGHT = (161, 237, 226, 255)
LAGOON_DEEP = (0, 174, 177, 255)
SAND = (255, 242, 207, 255)
SAND_LIGHT = (255, 249, 230, 255)
PALM_DARK = (12, 91, 67, 255)
PALM = (23, 126, 88, 255)
PALM_LIGHT = (62, 157, 103, 255)
WOOD = (145, 93, 62, 255)
WOOD_LIGHT = (213, 167, 115, 255)
ROOF = (190, 102, 72, 255)
ROOF_LIGHT = (223, 142, 98, 255)
CORAL = (244, 139, 91, 255)


def s(value: float) -> int:
    return round(value * SCALE)


def points(values: list[tuple[float, float]] | tuple[tuple[float, float], ...]) -> list[tuple[int, int]]:
    return [(s(x), s(y)) for x, y in values]


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if not path.exists():
        raise FileNotFoundError(f"Font not found: {path}")
    return ImageFont.truetype(str(path), size * SCALE)


def organic_shape(
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    phase: float,
    rotation: float = 0,
    count: int = 240,
) -> list[tuple[int, int]]:
    angle_offset = radians(rotation)
    cosine = cos(angle_offset)
    sine = sin(angle_offset)
    result: list[tuple[float, float]] = []
    for index in range(count):
        angle = 2 * pi * index / count
        wobble = 1 + 0.035 * sin(3 * angle + phase) + 0.018 * cos(7 * angle - phase)
        local_x = rx * wobble * cos(angle)
        local_y = ry * (1 + 0.025 * cos(4 * angle + phase)) * sin(angle)
        result.append(
            (
                cx + local_x * cosine - local_y * sine,
                cy + local_x * sine + local_y * cosine,
            )
        )
    return points(result)


def cubic_points(
    p0: tuple[float, float],
    p1: tuple[float, float],
    p2: tuple[float, float],
    p3: tuple[float, float],
    count: int = 90,
) -> list[tuple[float, float]]:
    result: list[tuple[float, float]] = []
    for index in range(count + 1):
        t = index / count
        inverse = 1 - t
        result.append(
            (
                inverse**3 * p0[0]
                + 3 * inverse**2 * t * p1[0]
                + 3 * inverse * t**2 * p2[0]
                + t**3 * p3[0],
                inverse**3 * p0[1]
                + 3 * inverse**2 * t * p1[1]
                + 3 * inverse * t**2 * p2[1]
                + t**3 * p3[1],
            )
        )
    return result


def rotated_points(
    cx: float,
    cy: float,
    values: list[tuple[float, float]] | tuple[tuple[float, float], ...],
    angle_degrees: float,
) -> list[tuple[int, int]]:
    angle = radians(angle_degrees)
    cosine = cos(angle)
    sine = sin(angle)
    return points(
        [
            (cx + x * cosine - y * sine, cy + x * sine + y * cosine)
            for x, y in values
        ]
    )


def draw_soft_shadow(
    image: Image.Image,
    shape: list[tuple[int, int]],
    offset: tuple[float, float],
    blur: float,
    opacity: int,
) -> None:
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow = ImageDraw.Draw(layer)
    shifted = [(x + s(offset[0]), y + s(offset[1])) for x, y in shape]
    shadow.polygon(shifted, fill=(1, 59, 72, opacity))
    image.alpha_composite(layer.filter(ImageFilter.GaussianBlur(s(blur))))


def draw_palm(draw: ImageDraw.ImageDraw, cx: float, cy: float, radius: float, phase: float) -> None:
    colors = (PALM_DARK, PALM, PALM_LIGHT, PALM, PALM_DARK, PALM, PALM_LIGHT, PALM)
    for index, color in enumerate(colors):
        angle = phase + index * 45 + (index % 2) * 5
        length = radius * (0.86 + (index % 3) * 0.07)
        width = radius * 0.27
        leaf = (
            (1, -width * 0.12),
            (length * 0.26, -width * 0.48),
            (length * 0.68, -width * 0.26),
            (length, 0),
            (length * 0.68, width * 0.26),
            (length * 0.26, width * 0.48),
            (1, width * 0.12),
        )
        draw.polygon(rotated_points(cx, cy, leaf, angle), fill=color)
    draw.ellipse(
        (s(cx - 4), s(cy - 4), s(cx + 4), s(cy + 4)),
        fill=(181, 123, 66, 255),
    )


def draw_villa(
    draw: ImageDraw.ImageDraw,
    cx: float,
    cy: float,
    angle: float,
    side: int,
) -> None:
    perpendicular = radians(angle + 90)
    connector_start = (
        cx - cos(perpendicular) * 5 * side,
        cy - sin(perpendicular) * 5 * side,
    )
    connector_end = (
        cx + cos(perpendicular) * 29 * side,
        cy + sin(perpendicular) * 29 * side,
    )
    draw.line(points((connector_start, connector_end)), fill=WOOD, width=s(6))

    villa_x = cx + cos(perpendicular) * 40 * side
    villa_y = cy + sin(perpendicular) * 40 * side
    draw.polygon(
        rotated_points(villa_x, villa_y, ((-27, -19), (27, -19), (27, 19), (-27, 19)), angle),
        fill=WOOD_LIGHT,
    )
    draw.polygon(
        rotated_points(villa_x, villa_y, ((-23, -15), (18, -15), (25, 0), (18, 15), (-23, 15)), angle),
        fill=ROOF,
    )
    draw.polygon(
        rotated_points(villa_x, villa_y, ((-20, -12), (15, -12), (20, 0), (15, 0), (-20, 0)), angle),
        fill=ROOF_LIGHT,
    )
    pool_x = villa_x - cos(radians(angle)) * 17
    pool_y = villa_y - sin(radians(angle)) * 17
    draw.polygon(
        rotated_points(pool_x, pool_y, ((-8, -13), (6, -13), (6, 13), (-8, 13)), angle),
        fill=(116, 226, 216, 255),
    )


def draw_lagoon_details(draw: ImageDraw.ImageDraw) -> None:
    for cx, cy, width, angle in (
        (738, 150, 52, -16),
        (1090, 182, 58, 12),
        (704, 422, 46, 18),
        (1042, 520, 44, -12),
    ):
        line = cubic_points(
            (cx - width / 2, cy),
            (cx - width / 6, cy - 6),
            (cx + width / 6, cy + 6),
            (cx + width / 2, cy),
            24,
        )
        # Rotate the already-curved line around its midpoint.
        rotated: list[tuple[float, float]] = []
        cosine = cos(radians(angle))
        sine = sin(radians(angle))
        for x, y in line:
            local_x, local_y = x - cx, y - cy
            rotated.append((cx + local_x * cosine - local_y * sine, cy + local_x * sine + local_y * cosine))
        draw.line(points(rotated), fill=(237, 255, 248, 210), width=s(3))


def generate() -> Image.Image:
    image = Image.new(
        "RGBA",
        (CANVAS_SIZE[0] * SCALE, CANVAS_SIZE[1] * SCALE),
        BACKGROUND,
    )
    draw = ImageDraw.Draw(image)

    lagoon_shape = organic_shape(915, 310, 280, 236, 0.45, -5)
    draw_soft_shadow(image, lagoon_shape, (4, 14), 18, 35)
    draw.polygon(lagoon_shape, fill=LAGOON)

    shallow_shape = organic_shape(864, 281, 215, 159, 1.7, -11)
    draw.polygon(shallow_shape, fill=LAGOON_LIGHT)
    reef_shape = organic_shape(924, 335, 135, 96, 2.6, -8)
    draw.polygon(reef_shape, fill=LAGOON_DEEP)
    draw_lagoon_details(draw)

    for cx, cy, rx, ry in (
        (746, 359, 11, 6),
        (783, 405, 7, 4),
        (1030, 165, 9, 5),
        (1090, 325, 8, 4),
    ):
        draw.ellipse((s(cx - rx), s(cy - ry), s(cx + rx), s(cy + ry)), fill=(244, 139, 91, 165))

    island_shape = organic_shape(852, 274, 170, 107, 2.1, -12)
    draw_soft_shadow(image, island_shape, (4, 12), 12, 48)
    draw.polygon(island_shape, fill=SAND)
    beach_shape = organic_shape(836, 266, 144, 84, 0.9, -12)
    draw.polygon(beach_shape, fill=SAND_LIGHT)
    vegetation_shape = organic_shape(827, 264, 114, 61, 1.5, -13)
    draw.polygon(vegetation_shape, fill=(48, 143, 91, 255))
    draw.polygon(
        organic_shape(817, 274, 78, 39, 2.9, -10),
        fill=(20, 111, 75, 255),
    )

    # A small beach path keeps the island readable as a resort rather than a generic leaf.
    path_curve = cubic_points((778, 318), (808, 299), (852, 298), (887, 326), 55)
    draw.line(points(path_curve), fill=(240, 213, 162, 255), width=s(7))

    for palm in (
        (775, 249, 39, -18),
        (822, 237, 45, 6),
        (867, 252, 42, 22),
        (799, 291, 43, -8),
        (850, 291, 46, 14),
        (902, 273, 38, 31),
    ):
        draw_palm(draw, *palm)

    jetty = cubic_points((957, 319), (1010, 349), (1086, 435), (1152, 500), 110)
    draw.line(points([(x + 4, y + 8) for x, y in jetty]), fill=(0, 107, 111, 90), width=s(15))
    draw.line(points(jetty), fill=WOOD, width=s(13), joint="curve")
    draw.line(points(jetty), fill=WOOD_LIGHT, width=s(7), joint="curve")

    for index in range(10, len(jetty) - 3, 9):
        x, y = jetty[index]
        previous = jetty[index - 2]
        following = jetty[index + 2]
        angle = atan2(following[1] - previous[1], following[0] - previous[0])
        normal = angle + pi / 2
        draw.line(
            points(
                (
                    (x + cos(normal) * 4, y + sin(normal) * 4),
                    (x - cos(normal) * 4, y - sin(normal) * 4),
                )
            ),
            fill=(125, 78, 53, 185),
            width=s(1.5),
        )

    for index, side in ((35, 1), (55, -1), (75, 1), (94, -1)):
        x, y = jetty[index]
        previous = jetty[index - 2]
        following = jetty[index + 2]
        angle = degrees(atan2(following[1] - previous[1], following[0] - previous[0]))
        draw_villa(draw, x, y, angle, side)

    title_font = font(FONT_TITLE, 84)
    tagline_font = font(FONT_TAGLINE, 38)
    draw.text(
        (s(78), s(255)),
        "몰디브 바이블",
        font=title_font,
        fill=TITLE_COLOR,
        anchor="lm",
        stroke_width=0,
    )
    draw.text(
        (s(82), s(367)),
        "리조트 비교를 더 쉽게",
        font=tagline_font,
        fill=TAGLINE_COLOR,
        anchor="lm",
        stroke_width=0,
    )

    final_image = image.convert("RGB").resize(CANVAS_SIZE, Image.Resampling.LANCZOS)
    return final_image


def main() -> None:
    final_image = generate()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    final_image.save(OUTPUT, "JPEG", quality=95, optimize=True, progressive=True)
    print(f"Generated {OUTPUT} ({CANVAS_SIZE[0]}x{CANVAS_SIZE[1]})")


if __name__ == "__main__":
    main()
