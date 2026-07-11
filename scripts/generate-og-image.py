from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "scripts" / "assets" / "og-background.jpg"
OUTPUT = ROOT / "public" / "og-image.jpg"
CANVAS_SIZE = (1200, 630)


def prepare_background(source: Path) -> Image.Image:
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        return ImageOps.fit(
            image.convert("RGB"),
            CANVAS_SIZE,
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate the photo-led Maldives Bible Open Graph image.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Background image path")
    parser.add_argument(
        "--save-background",
        type=Path,
        help="Optionally save the cropped source as a reusable JPEG",
    )
    args = parser.parse_args()

    source = args.source.resolve()
    if not source.exists():
        raise FileNotFoundError(f"Background image not found: {source}")

    background = prepare_background(source)
    if args.save_background:
        args.save_background.parent.mkdir(parents=True, exist_ok=True)
        background.save(args.save_background, "JPEG", quality=92, optimize=True, progressive=True)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    background.save(OUTPUT, "JPEG", quality=92, optimize=True, progressive=True)
    print(f"Generated {OUTPUT} ({CANVAS_SIZE[0]}x{CANVAS_SIZE[1]})")


if __name__ == "__main__":
    main()
