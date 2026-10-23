#!/usr/bin/env python3
"""
generate_svg_cards.py - Production Standalone SVG Card Generator for Mazu Sixty Jiazi Lots

Generates unified, museum-quality standalone SVG cards for all 60 lots.
Each SVG card features:
1. Pure vector Greek key outer border and inner gold hairlines
2. Universal Arabic numeral at top center
3. Authentic 2x2 Qin Small Seal stamp embedded directly (base64 data URI)
4. Central sacred geometry artwork clipped into a feathered portal
5. Classical Chinese title and English serif subtitle
6. Theme-ready color tokens (Obsidian, Cinnabar, Celadon)
7. Standalone portability (no broken external seal links)
"""

import os
import re
import json
import base64
import argparse

SEALS_DIR = "assets/cards/seals"
CARDS_DIR = "assets/cards"
BASES_DIR = "assets/cards/bases"
SVG_OUT_DIR = "assets/cards/svg"
CATALOG_PATH = "docs/planning/11_LOT_CARD_ARTWORK_CATALOG.md"
CANONICAL_JSON_PATH = "data/canonical/lots_compiled.json"

THEME_PALETTES = {
    "obsidian": {
        "bg": "#070B11",
        "innerBg": "#0D141F",
        "goldPrimary": "#D4AF37",
        "goldSecondary": "#E8C96C",
        "goldMuted": "rgba(212, 175, 55, 0.45)",
        "textMain": "#F5E6BE",
        "sealTint": "#C8382B",
        "borderRule": "rgba(212, 175, 55, 0.65)",
    },
    "cinnabar": {
        "bg": "#1A0C0E",
        "innerBg": "#281215",
        "goldPrimary": "#F2A65A",
        "goldSecondary": "#FAD089",
        "goldMuted": "rgba(242, 166, 90, 0.45)",
        "textMain": "#FFF0D4",
        "sealTint": "#E83E2D",
        "borderRule": "rgba(242, 166, 90, 0.65)",
    },
    "celadon": {
        "bg": "#0A1414",
        "innerBg": "#122120",
        "goldPrimary": "#A2BAA8",
        "goldSecondary": "#C5D8CC",
        "goldMuted": "rgba(162, 186, 168, 0.45)",
        "textMain": "#E8F3EB",
        "sealTint": "#B84A39",
        "borderRule": "rgba(162, 186, 168, 0.60)",
    },
}

def load_canonical_data():
    if not os.path.exists(CANONICAL_JSON_PATH):
        raise FileNotFoundError(f"Canonical data file not found at {CANONICAL_JSON_PATH}")
    with open(CANONICAL_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)["lots"]

    catalog = {}
    for lot in data:
        num = lot["lot_number"]
        catalog[num] = {
            "ganzhi": lot["ganzhi"]["zh"],
            "hexagram": lot["hexagram"]["zh"],
            "title_zh": lot["title"]["zh"],
            "title_en": lot["title"]["en"],
        }
    return catalog

def get_base64_image(image_path):
    if not os.path.exists(image_path):
        return ""
    with open(image_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    ext = os.path.splitext(image_path)[1].lower().replace(".", "")
    mime = "image/png" if ext == "png" else "image/jpeg"
    return f"data:{mime};base64,{encoded}"

def build_svg_card(lot_num, meta, theme="obsidian", embed_artwork=False):
    t = THEME_PALETTES.get(theme, THEME_PALETTES["obsidian"])
    pad_num = f"{lot_num:02d}"

    seal_path = os.path.join(SEALS_DIR, f"seal_{pad_num}.png")
    seal_data_uri = get_base64_image(seal_path)

    card_path = os.path.join(CARDS_DIR, f"lot_{pad_num}_card.jpg")
    base_path = os.path.join(BASES_DIR, f"lot_{pad_num}_base.jpg")
    
    art_path = base_path if os.path.exists(base_path) else card_path
    if embed_artwork and os.path.exists(art_path):
        art_src = get_base64_image(art_path)
    else:
        # Standard web relative asset reference
        art_src = f"/assets/cards/lot_{pad_num}_card.jpg"

    title_zh = meta["title_zh"]
    title_en = meta["title_en"].upper()
    ganzhi = meta["ganzhi"]

    zh_font_size = 15 if len(title_zh) > 10 else (17 if len(title_zh) > 7 else 19)
    zh_letter_spacing = 2 if len(title_zh) > 10 else 4

    en_font_size = 8 if len(title_en) > 36 else (9.5 if len(title_en) > 26 else 11)
    en_letter_spacing = 1 if len(title_en) > 36 else (1.5 if len(title_en) > 26 else 2)
    en_adjust = ' textLength="320" lengthAdjust="spacingAndGlyphs"' if len(title_en) > 28 else ''

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
  <defs>
    <!-- Outer Greek Key Border Pattern -->
    <pattern id="greekCorner_{lot_num}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M0,0 H20 V20 H10 V10 H15 V15 H5 V5 H20" fill="none" stroke="{t['goldPrimary']}" stroke-width="1.2" />
    </pattern>

    <!-- Central Artwork Clipping Mask -->
    <clipPath id="artworkPortal_{lot_num}">
      <rect x="36" y="142" width="328" height="340" rx="6" />
    </clipPath>

    <!-- Radial Vignette for Central Artwork -->
    <radialGradient id="portalVignette_{lot_num}" cx="50%" cy="50%" r="50%">
      <stop offset="65%" stop-color="transparent" />
      <stop offset="100%" stop-color="{t['bg']}" stop-opacity="0.9" />
    </radialGradient>

    <!-- Top & Bottom Edge Vignettes to Prevent Bleed -->
    <linearGradient id="topEdgeFade_{lot_num}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="{t['bg']}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="transparent" />
    </linearGradient>

    <linearGradient id="bottomEdgeFade_{lot_num}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="transparent" />
      <stop offset="100%" stop-color="{t['bg']}" stop-opacity="0.95" />
    </linearGradient>

    <!-- Shimmer Gold Foil Gradient -->
    <linearGradient id="shimmerGradient_{lot_num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="transparent" />
      <stop offset="50%" stop-color="{t['goldSecondary']}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="transparent" />
    </linearGradient>
  </defs>

  <!-- 1. Background Slate Canvas -->
  <rect width="400" height="600" fill="{t['bg']}" />

  <!-- 2. Outer Greek Key / Double Border (Strict lot_01 standard) -->
  <rect x="16" y="16" width="368" height="568" rx="10" fill="none" stroke="{t['borderRule']}" stroke-width="1.5" />
  <rect x="24" y="24" width="352" height="552" rx="6" fill="none" stroke="{t['goldMuted']}" stroke-width="0.8" />

  <!-- Corner Accents (4 Geometric Corners) -->
  <g stroke="{t['goldPrimary']}" stroke-width="1.2" fill="none">
    <path d="M 28 40 L 40 40 L 40 28" />
    <path d="M 372 40 L 360 40 L 360 28" />
    <path d="M 28 560 L 40 560 L 40 572" />
    <path d="M 372 560 L 360 560 L 360 572" />
  </g>

  <!-- 3. Top Serial Number (Standard lot_01 style: universal Arabic numeral) -->
  <text x="200" y="56" text-anchor="middle" fill="{t['goldSecondary']}" font-family="Cinzel, 'Noto Serif SC', serif" font-size="26" font-weight="bold" letter-spacing="2">
    {lot_num}
  </text>
  <!-- Decorative Header Flourish Lines -->
  <line x1="140" y1="50" x2="165" y2="40" stroke="{t['goldMuted']}" stroke-width="1" />
  <line x1="260" y1="50" x2="235" y2="40" stroke="{t['goldMuted']}" stroke-width="1" />

  <!-- 4. Top Seal Stamp (Centered directly below top serial number) -->
  <g transform="translate(180, 70)">
    <image href="{seal_data_uri}" width="40" height="40" preserveAspectRatio="xMidYMid meet" />
  </g>

  <!-- 5. Center Sacred Geometry Artwork (Clipped into clean inner portal) -->
  <g clip-path="url(#artworkPortal_{lot_num})">
    <image href="{art_src}" x="20" y="95" width="360" height="435" preserveAspectRatio="xMidYMid slice" />
    <!-- Edge vignettes for seamless integration -->
    <rect x="36" y="142" width="328" height="340" fill="url(#portalVignette_{lot_num})" />
    <rect x="36" y="142" width="328" height="28" fill="url(#topEdgeFade_{lot_num})" />
    <rect x="36" y="452" width="328" height="30" fill="url(#bottomEdgeFade_{lot_num})" />
  </g>

  <!-- Inner Portal Frame Rule -->
  <rect x="36" y="142" width="328" height="340" rx="6" fill="none" stroke="{t['goldMuted']}" stroke-width="1" />

  <!-- 6. Bottom Typography Footer (Classical Chinese & English Serif) -->
  <text x="200" y="518" text-anchor="middle" fill="{t['textMain']}" font-family="'Noto Serif SC', 'Songti SC', serif" font-size="{zh_font_size}" font-weight="600" letter-spacing="{zh_letter_spacing}">
    {title_zh} · {ganzhi}
  </text>
  <text x="200" y="545" text-anchor="middle" fill="{t['goldPrimary']}" font-family="Cinzel, 'Times New Roman', serif" font-size="{en_font_size}" font-weight="500" letter-spacing="{en_letter_spacing}"{en_adjust}>
    {title_en}
  </text>
</svg>'''
    return svg_content

def main():
    parser = argparse.ArgumentParser(description="Generate unified standalone SVG lot cards")
    parser.add_argument("--lot", type=int, help="Generate SVG for a specific lot number (1..60)")
    parser.add_argument("--all", action="store_true", help="Generate standalone SVGs for all 60 lots")
    parser.add_argument("--theme", choices=["obsidian", "cinnabar", "celadon"], default="obsidian", help="Color theme")
    parser.add_argument("--embed-artwork", action="store_true", help="Embed central raster art as base64 data URI")
    args = parser.parse_args()

    os.makedirs(SVG_OUT_DIR, exist_ok=True)
    catalog = load_canonical_data()

    if args.lot:
        targets = [args.lot]
    else:
        targets = list(range(1, 61))

    print(f"Generating SVG cards in {SVG_OUT_DIR}/ for lots: {targets[0]}..{targets[-1]}...")
    for num in targets:
        meta = catalog.get(num, {
            "ganzhi": "",
            "seal_text": "",
            "hexagram": "",
            "element": "",
            "title_zh": f"第{num}籤",
            "title_en": f"LOT {num}",
        })
        svg = build_svg_card(num, meta, theme=args.theme, embed_artwork=args.embed_artwork)
        out_file = os.path.join(SVG_OUT_DIR, f"lot_{num:02d}_card.svg")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(svg)

    print(f"Successfully generated {len(targets)} standalone SVG cards.")

if __name__ == "__main__":
    main()
