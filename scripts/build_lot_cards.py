#!/usr/bin/env python3
"""
build_lot_cards.py - Production Compositor & Refactoring Pipeline for Mazu Lot Cards

Features:
1. Generates authentic 4-character Qin Small Seal (秦小篆) stamps in 2x2 grid:
   [Ganzhi 2 chars] + [2-digit serial padded with 零] (e.g., 甲子零一, 乙未一零, 丙申一七).
2. Generates standalone Retina-ready transparent PNG seal stamps in `assets/cards/seals/`.
3. Composites authentic seals onto base artworks, eliminating AI-hallucinated filler glyphs.
4. Provides programmatic layer separation for future multi-platform frontend rendering.
"""

import os
import sys
import json
import argparse
from PIL import Image, ImageDraw, ImageFont

CANONICAL_DATA_PATH = "data/canonical/lots_compiled.json"
FONT_PATH = "assets/fonts/fangzhengxiaozhuan.ttf"
CARDS_DIR = "assets/cards"
SEALS_DIR = "assets/cards/seals"
BASES_DIR = "assets/cards/bases"

CHINESE_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

def load_canonical_data():
    with open(CANONICAL_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def generate_seal_stamp(stem, branch, tens, ones, size=208, font_path=FONT_PATH):
    """
    Renders an authentic 4-character Qin Small Seal stamp in a 2x2 grid.
    Layout (Traditional right-to-left columns):
      - Right column: Stem (top), Branch (bottom)
      - Left column:  Tens (top), Ones (bottom)
    Output: RGBA Image with transparent background.
    """
    seal = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(seal)
    scale = size / 104.0

    # Color palette: esoteric cinnabar red matching the obsidian Tarot palette
    bg_color = (34, 18, 22, 225)
    border_outer = (165, 52, 42, 255)
    border_inner = (120, 36, 28, 180)
    glyph_color = (222, 76, 62, 255)
    stroke_color = (180, 50, 40, 255)

    # Outer rounded rectangle
    draw.rounded_rectangle(
        [int(2 * scale), int(2 * scale), int(101 * scale), int(101 * scale)],
        radius=int(11 * scale),
        fill=bg_color,
        outline=border_outer,
        width=int(3 * scale)
    )
    # Inner hairline border
    draw.rounded_rectangle(
        [int(7 * scale), int(7 * scale), int(96 * scale), int(96 * scale)],
        radius=int(8 * scale),
        outline=border_inner,
        width=max(1, int(1 * scale))
    )

    fs = int(38 * scale)
    font = ImageFont.truetype(font_path, fs)

    # Balanced quadrant centers
    quads = [
        (stem,   int(72 * scale), int(32 * scale)),
        (branch, int(72 * scale), int(72 * scale)),
        (tens,   int(32 * scale), int(32 * scale)),
        (ones,   int(32 * scale), int(72 * scale)),
    ]

    for char, cx, cy in quads:
        bbox = font.getbbox(char)
        bx_center = (bbox[0] + bbox[2]) / 2
        by_center = (bbox[1] + bbox[3]) / 2
        x = cx - bx_center
        y = cy - by_center
        draw.text(
            (x, y), char, font=font,
            fill=glyph_color,
            stroke_width=max(1, int(1 * scale)),
            stroke_fill=stroke_color
        )

    return seal

def generate_all_seals(lots, font_path=FONT_PATH):
    os.makedirs(SEALS_DIR, exist_ok=True)
    print(f"Generating 60 authentic Qin Seal stamps in {SEALS_DIR}/...")
    for lot in lots:
        num = lot["lot_number"]
        gz = lot["ganzhi"]["zh"]
        stem, branch = gz[0], gz[1]
        tens = CHINESE_DIGITS[num // 10]
        ones = CHINESE_DIGITS[num % 10]

        seal_2x = generate_seal_stamp(stem, branch, tens, ones, size=208, font_path=font_path)
        out_path = os.path.join(SEALS_DIR, f"seal_{num:02d}.png")
        seal_2x.save(out_path, "PNG")
    print("Done generating 60 seals.")

def refactor_card(num, font_path=FONT_PATH):
    card_path = os.path.join(CARDS_DIR, f"lot_{num:02d}_card.jpg")
    base_path = os.path.join(BASES_DIR, f"lot_{num:02d}_base.jpg")
    seal_path = os.path.join(SEALS_DIR, f"seal_{num:02d}.png")

    if not os.path.exists(card_path):
        print(f"Card {card_path} not found, skipping.")
        return False

    os.makedirs(BASES_DIR, exist_ok=True)
    os.makedirs(SEALS_DIR, exist_ok=True)

    # 1. Clean the old seal box area on the base artwork
    img = Image.open(card_path)
    draw = ImageDraw.Draw(img)
    # Background slate color: (17, 24, 34)
    draw.rectangle([366, 123, 481, 238], fill=(17, 24, 34))
    img.save(base_path, quality=96)

    # 2. Ensure seal exists
    if not os.path.exists(seal_path):
        data = load_canonical_data()
        lot = next(item for item in data["lots"] if item["lot_number"] == num)
        gz = lot["ganzhi"]["zh"]
        tens = CHINESE_DIGITS[num // 10]
        ones = CHINESE_DIGITS[num % 10]
        seal_2x = generate_seal_stamp(gz[0], gz[1], tens, ones, size=208, font_path=font_path)
        seal_2x.save(seal_path, "PNG")
    else:
        seal_2x = Image.open(seal_path)

    # 3. Downscale 208x208 seal to 104x104 with Lanczos for anti-aliasing
    seal_1x = seal_2x.resize((104, 104), Image.Resampling.LANCZOS)

    # 4. Composite onto card at (372, 129)
    img.paste(seal_1x, (372, 129), seal_1x)
    img.save(card_path, quality=96)
    print(f"Refactored {card_path} with authentic Qin seal.")
    return True

def main():
    parser = argparse.ArgumentParser(description="Mazu Lot Cards Production Compositor")
    parser.add_argument("--seals", action="store_true", help="Generate all 60 standalone seal stamps")
    parser.add_argument("--refactor", nargs="*", type=int, help="Refactor specific card numbers (e.g. --refactor 1 2 17)")
    parser.add_argument("--all", action="store_true", help="Generate all seals and refactor all existing cards")
    args = parser.parse_args()

    data = load_canonical_data()

    if args.all or args.seals:
        generate_all_seals(data["lots"])

    if args.all:
        for num in range(1, 61):
            refactor_card(num)
    elif args.refactor:
        for num in args.refactor:
            refactor_card(num)

if __name__ == "__main__":
    main()
