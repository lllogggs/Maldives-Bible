from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "scripts" / "assets" / "og" / "open-design-og-template.html"
OUTPUT = ROOT / "public" / "og-image.jpg"
CANVAS_SIZE = (1200, 630)


def find_chromium() -> Path:
    command_names = ("chrome", "google-chrome", "chromium", "chromium-browser", "msedge")
    for command_name in command_names:
        executable = shutil.which(command_name)
        if executable:
            return Path(executable)

    candidates = (
        Path.home() / "AppData/Local/Google/Chrome/Application/chrome.exe",
        Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
        Path("C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"),
        Path.home() / "AppData/Local/Microsoft/Edge/Application/msedge.exe",
        Path("C:/Program Files/Microsoft/Edge/Application/msedge.exe"),
        Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
    )
    for candidate in candidates:
        if candidate.exists():
            return candidate

    raise FileNotFoundError("Chrome, Chromium, or Edge is required to render the OG template")


def render_template(browser: Path, screenshot: Path, profile: Path) -> None:
    command = [
        str(browser),
        "--headless=new",
        "--disable-background-networking",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-default-browser-check",
        "--no-first-run",
        "--allow-file-access-from-files",
        "--force-device-scale-factor=1",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=1200",
        f"--user-data-dir={profile}",
        f"--window-size={CANVAS_SIZE[0]},{CANVAS_SIZE[1]}",
        f"--screenshot={screenshot}",
        TEMPLATE.as_uri(),
    ]
    result = subprocess.run(command, capture_output=True, text=True, timeout=30)
    if result.returncode != 0 or not screenshot.exists():
        detail = result.stderr.strip() or result.stdout.strip() or "unknown browser error"
        raise RuntimeError(f"Unable to render OG template: {detail}")


def main() -> None:
    if not TEMPLATE.exists():
        raise FileNotFoundError(f"Open Design template not found: {TEMPLATE}")

    browser = find_chromium()
    with tempfile.TemporaryDirectory(prefix="maldives-bible-og-") as temporary_dir:
        temp_root = Path(temporary_dir)
        screenshot = temp_root / "og-image.png"
        render_template(browser, screenshot, temp_root / "browser-profile")

        with Image.open(screenshot) as source:
            image = ImageOps.fit(
                source.convert("RGB"),
                CANVAS_SIZE,
                method=Image.Resampling.LANCZOS,
                centering=(0.5, 0.5),
            )
            OUTPUT.parent.mkdir(parents=True, exist_ok=True)
            image.save(OUTPUT, "JPEG", quality=95, optimize=True, progressive=True)

    print(f"Generated {OUTPUT} from {TEMPLATE.name} ({CANVAS_SIZE[0]}x{CANVAS_SIZE[1]})")


if __name__ == "__main__":
    main()
