from __future__ import annotations

from pathlib import Path
from math import cos, hypot, pi, radians, sin

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-image.jpg"
FONT_TITLE = ROOT / "scripts" / "assets" / "fonts" / "maruburi" / "MaruBuri-SemiBold.otf"
FONT_MEDIUM = ROOT / "scripts" / "assets" / "fonts" / "pretendard" / "Pretendard-Medium.otf"
CANVAS_SIZE = (1200, 630)
SCALE = 3

BACKGROUND = (251, 247, 239)
TITLE_COLOR = (1, 59, 85)
TAGLINE_COLOR = (49, 95, 102)
OCEAN_DEEP = (1, 59, 85)
LAGOON = (5, 187, 186)
SHALLOW = (150, 237, 220)
LAGOON_BRIGHT = (2, 216, 207)
SAND_LIGHT = (255, 248, 231)
JETTY = (166, 108, 82)
DECK = (243, 211, 170)
ROOF = (185, 108, 80)
CORAL = (253, 151, 93)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if not path.exists():
        raise FileNotFoundError(f"Font not found: {path}")
    return ImageFont.truetype(str(path), size)


def scale(value: float) -> int:
    return round(value * SCALE)


def scale_points(points: list[tuple[float, float]] | tuple[tuple[float, float], ...]) -> list[tuple[int, int]]:
    return [(scale(x), scale(y)) for x, y in points]


def organic_points(
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    phase: float,
    count: int = 220,
) -> list[tuple[int, int]]:
    points: list[tuple[float, float]] = []
    for index in range(count):
        angle = 2 * pi * index / count
        x_wobble = 1 + 0.035 * sin(3 * angle + phase) + 0.018 * sin(7 * angle - phase)
        y_wobble = 1 + 0.028 * cos(4 * angle - phase)
        points.append(
            (
                cx + rx * x_wobble * cos(angle),
                cy + ry * y_wobble * sin(angle),
            )
        )
    return scale_points(points)


def cubic_point(
    p0: tuple[float, float],
    p1: tuple[float, float],
    p2: tuple[float, float],
    p3: tuple[float, float],
    progress: float,
) -> tuple[float, float]:
    inverse = 1 - progress
    return (
        inverse**3 * p0[0]
        + 3 * inverse**2 * progress * p1[0]
        + 3 * inverse * progress**2 * p2[0]
        + progress**3 * p3[0],
        inverse**3 * p0[1]
        + 3 * inverse**2 * progress * p1[1]
        + 3 * inverse * progress**2 * p2[1]
        + progress**3 * p3[1],
    )


def sandbank_polygon(max_half_width: float, offset_x: float = 0) -> list[tuple[int, int]]:
    first = (
        (820 + offset_x, 230),
        (915 + offset_x, 160),
        (1115 + offset_x, 192),
        (1136 + offset_x, 284),
    )
    second = (
        (1136 + offset_x, 284),
        (1140 + offset_x, 330),
        (1055 + offset_x, 355),
        (990 + offset_x, 430),
    )
    centers = [cubic_point(*first, index / 60) for index in range(61)]
    centers.extend(cubic_point(*second, index / 60) for index in range(1, 61))

    left: list[tuple[float, float]] = []
    right: list[tuple[float, float]] = []
    last_index = len(centers) - 1
    for index, (x, y) in enumerate(centers):
        previous = centers[max(0, index - 1)]
        following = centers[min(last_index, index + 1)]
        tangent_x = following[0] - previous[0]
        tangent_y = following[1] - previous[1]
        length = max(hypot(tangent_x, tangent_y), 0.001)
        normal_x = -tangent_y / length
        normal_y = tangent_x / length
        progress = index / last_index
        half_width = max_half_width * sin(pi * progress) ** 0.72
        left.append((x + normal_x * half_width, y + normal_y * half_width))
        right.append((x - normal_x * half_width, y - normal_y * half_width))

    return scale_points(left + list(reversed(right)))


def rotated_rectangle(
    cx: float,
    cy: float,
    width: float,
    height: float,
    angle_degrees: float,
) -> list[tuple[int, int]]:
    angle = radians(angle_degrees)
    cosine = cos(angle)
    sine = sin(angle)
    points: list[tuple[float, float]] = []
    for x, y in (
        (-width / 2, -height / 2),
        (width / 2, -height / 2),
        (width / 2, height / 2),
        (-width / 2, height / 2),
    ):
        points.append((cx + x * cosine - y * sine, cy + x * sine + y * cosine))
    return scale_points(points)


def generate() -> Image.Image:
    high_res_size = (CANVAS_SIZE[0] * SCALE, CANVAS_SIZE[1] * SCALE)
    image = Image.new("RGB", high_res_size, BACKGROUND)
    draw = ImageDraw.Draw(image)

    title_font = font(FONT_TITLE, 82 * SCALE)
    tagline_font = font(FONT_MEDIUM, 40 * SCALE)
    motif_offset_x = 0

    for points, color in (
        (organic_points(1035, 315, 325, 270, 0.2), OCEAN_DEEP),
        (organic_points(1070, 300, 275, 225, 1.1), LAGOON),
        (organic_points(1015, 338, 215, 158, 2.2), SHALLOW),
        (organic_points(970, 350, 125, 82, 3.0), LAGOON_BRIGHT),
    ):
        draw.polygon(points, fill=color)

    draw.polygon(sandbank_polygon(24, motif_offset_x), fill=SAND_LIGHT)

    jetty_points = scale_points(
        (
            (1045, 355),
            (1085, 382),
            (1125, 420),
            (1170, 466),
        )
    )
    draw.line(jetty_points, fill=JETTY, width=scale(6), joint="curve")

    for cx, cy, angle in ((1072, 389, 30), (1115, 425, 42), (1155, 460, 46)):
        draw.polygon(rotated_rectangle(cx, cy, 45, 6, angle), fill=JETTY)
        draw.polygon(rotated_rectangle(cx, cy, 38, 20, angle), fill=DECK)
        draw.polygon(rotated_rectangle(cx, cy, 28, 13, angle), fill=ROOF)

    draw.rounded_rectangle(
        (scale(90), scale(178), scale(134), scale(183)),
        radius=scale(2.5),
        fill=CORAL,
    )
    draw.text(
        (scale(88), scale(238)),
        "몰디브 바이블",
        font=title_font,
        fill=TITLE_COLOR,
        anchor="lm",
    )
    draw.text(
        (scale(92), scale(354)),
        "리조트 비교를 더 쉽게",
        font=tagline_font,
        fill=TAGLINE_COLOR,
        anchor="lm",
    )

    return image.resize(CANVAS_SIZE, Image.Resampling.LANCZOS)


def main() -> None:
    final_image = generate()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    final_image.save(OUTPUT, "JPEG", quality=95, optimize=True, progressive=True)
    print(f"Generated {OUTPUT} ({CANVAS_SIZE[0]}x{CANVAS_SIZE[1]})")


if __name__ == "__main__":
    main()
