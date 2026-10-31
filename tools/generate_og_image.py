#!/usr/bin/env python3
"""Build the social preview card (assets/images/og-cover.png) from the current profile photo.

The card is the picture shown when the site link is shared (WhatsApp, LinkedIn, X, Chrome, search).
It reads the photo path from content/site-settings.json (the "portrait_image" field the admin
panel edits) and falls back to assets/images/julius-odoeke.jpeg. After drawing the card it adds a
?v=<fingerprint> to the og:image / twitter:image links in index.html, so link-preview caches fetch
the new picture instead of showing the old one.

Run locally:   pip install pillow   then   python tools/generate_og_image.py
On GitHub:     .github/workflows/update-og-image.yml runs this automatically whenever the photo changes.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SITE_URL = "https://odoekejulius.github.io"
SETTINGS_FILE = ROOT / "content" / "site-settings.json"
DEFAULT_PHOTO = "assets/images/julius-odoeke.jpeg"
OUTPUT = ROOT / "assets" / "images" / "og-cover.png"
PAGE = ROOT / "index.html"

NAME_LINES = ("Julius Chibuzo", "Odo-Eke")
ROLE_LINES = ("Full-stack web developer", "Data analyst  \u00b7  Educator")
LOCATION_LINE = "ABUJA, NIGERIA  \u00b7  OPEN TO ROLES"

WIDTH, HEIGHT = 1200, 630
BG, TEXT, ACCENT, MUTED, MINT, EYEBROW = (8, 11, 18), (244, 245, 250), (180, 194, 255), (166, 173, 189), (126, 224, 192), (190, 201, 238)

FONT_DIRS = [
    "/usr/share/fonts/truetype/dejavu/", "/usr/share/fonts/dejavu/", "/Library/Fonts/",
    "/System/Library/Fonts/Supplemental/", "C:/Windows/Fonts/",
]


def load_font(names, size):
    for folder in FONT_DIRS:
        for name in names:
            path = Path(folder) / name
            if path.exists():
                return ImageFont.truetype(str(path), size)
    try:
        return ImageFont.load_default(size=size)  # Pillow 10.1+
    except TypeError:
        return ImageFont.load_default()


def photo_path():
    relative = DEFAULT_PHOTO
    try:
        configured = json.loads(SETTINGS_FILE.read_text(encoding="utf-8")).get("portrait_image", "")
        if isinstance(configured, str) and configured and not re.match(r"^[a-z]+:", configured):
            relative = configured.lstrip("/")
    except (OSError, ValueError):
        pass
    path = ROOT / relative
    if not path.is_file():
        print(f"Photo '{relative}' not found, using {DEFAULT_PHOTO}", file=sys.stderr)
        relative, path = DEFAULT_PHOTO, ROOT / DEFAULT_PHOTO
    return relative, path


def square_crop(image, size):
    """Square crop that keeps the head: centred sideways, biased to the top of tall photos."""
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    top = round((height - side) * 0.12)
    return image.crop((left, top, left + side, top + side)).resize((size, size), Image.LANCZOS)


def build_card(photo_file):
    photo = ImageOps.exif_transpose(Image.open(photo_file)).convert("RGB")

    glow = Image.new("RGB", (WIDTH, HEIGHT), (0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((-200, -250, 520, 430), fill=(30, 80, 68))
    glow_draw.ellipse((700, 150, 1400, 850), fill=(52, 60, 130))
    card = Image.blend(Image.new("RGB", (WIDTH, HEIGHT), BG), glow.filter(ImageFilter.GaussianBlur(120)), 0.75)
    draw = ImageDraw.Draw(card)

    serif = load_font(["DejaVuSerif.ttf", "Georgia.ttf", "Times New Roman.ttf"], 66)
    sans = load_font(["DejaVuSans.ttf", "Arial.ttf"], 29)
    mono = load_font(["DejaVuSansMono.ttf", "Courier New.ttf"], 23)

    draw.text((70, 200), NAME_LINES[0], font=serif, fill=TEXT)
    draw.text((70, 278), NAME_LINES[1], font=serif, fill=ACCENT)
    draw.text((70, 390), ROLE_LINES[0], font=sans, fill=MUTED)
    draw.text((70, 432), ROLE_LINES[1], font=sans, fill=MUTED)
    draw.ellipse((70, 520, 84, 534), fill=MINT)
    draw.text((98, 513), LOCATION_LINE, font=mono, fill=EYEBROW)

    tile = square_crop(photo, 420)
    mask = Image.new("L", (420, 420), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 419, 419), 44, fill=255)
    card.paste(tile, (730, 105), mask)
    draw.rounded_rectangle((730, 105, 1149, 524), 44, outline=(150, 165, 230), width=2)
    return card


def stamp_page(version, photo_relative):
    """Point the preview-image meta tags (and the structured-data photo) at the new files."""
    if not PAGE.is_file():
        return
    with open(PAGE, encoding="utf-8", newline="") as handle:
        text = handle.read()
    text = re.sub(r"(assets/images/og-cover\.png)(\?v=[0-9a-f]+)?", rf"\1?v={version}", text)
    text = re.sub(r'("image":\s*")' + re.escape(SITE_URL) + r'/[^"]+(")', rf"\g<1>{SITE_URL}/{photo_relative}\g<2>", text)
    with open(PAGE, "w", encoding="utf-8", newline="") as handle:
        handle.write(text)


def main():
    photo_relative, photo_file = photo_path()
    card = build_card(photo_file)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    card.save(OUTPUT, optimize=True)
    version = hashlib.sha1(OUTPUT.read_bytes()).hexdigest()[:10]
    stamp_page(version, photo_relative)
    print(f"Preview card built from {photo_relative} -> {OUTPUT.relative_to(ROOT)} (v={version})")


if __name__ == "__main__":
    main()
