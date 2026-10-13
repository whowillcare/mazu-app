# 12. Lot Card Component Architecture & Refactoring Specification

> **Refactoring Objective**: Transition from monolithic AI-baked raster cards to a **Layered Hybrid Production Architecture** that pairs AI esoteric sacred-geometry artworks with precision vector-rendered Qin Small Seal (秦小篆) stamps, universal numerals, and dynamic multilingual typography.

---

## 1. Executive Summary & Design Rationale

### The Problem with Monolithic AI Image Generation
In initial generative iterations, AI text-to-image models baked all visual elements into a single flattened JPEG. This introduced three critical flaws:
1. **Stroke & Glyph Hallucinations**: Small square Chinese seal stamps require a strict 2×2 grid of four characters. Generative models hallucinated random strokes or padded the 2-character Ganzhi with filler glyphs (e.g. `秦小`).
2. **Typography Brittleness**: Gold Chinese titles and English translations were locked to raster pixels, preventing localization (Traditional Chinese vs. Simplified Chinese vs. English vs. Japanese).
3. **Resolution & Rendering Artifacts**: Text rendered at 848×1264 lacks vector crispness on high-density Retina and OLED displays.

### The Refactored Solution: Layered Production Compositor
We decouple the card into **4 distinct, composable layers**:

```
┌────────────────────────────────────────────────────────┐
│  Layer 4: Universal Arabic Numeral (1..60)             │  ◄ Gold Serif / Vector Header
├────────────────────────────────────────────────────────┤
│  Layer 3: Authentic 4-Character Qin Seal Stamp (2×2)   │  ◄ Cinnabar Vermillion SVG / PNG
├────────────────────────────────────────────────────────┤
│  Layer 2: Esoteric Sacred Geometry Artwork             │  ◄ Obsidian & Gold Foil Canvas
├────────────────────────────────────────────────────────┤
│  Layer 1: Multilingual Typography (ZH / EN / Subtitle) │  ◄ Dynamic Vector Text Layer
└────────────────────────────────────────────────────────┘
```

This hybrid model delivers:
- **Zero Gibberish**: Every seal character is verified against the canonical dataset.
- **Museum-Quality Aesthetics**: Preserves the esoteric Golden Thread / CHANI aesthetic while providing razor-sharp typography.
- **Dynamic Frontend Localization**: Mobile and web apps can switch languages in real-time or animate foil shaders independently.

---

## 2. The 4-Character Qin Small Seal Standard (秦小篆 2×2 格)

### Canonical Grid Layout
The square cinnabar seal combines the **Ganzhi Pair** and the **2-Digit Chinese Card Number** (padded with `零` for single digits):

```
     ┌──────────────────────┬──────────────────────┐
     │                      │                      │
     │      十位 (Tens)     │      天干 (Stem)     │  ◄ Top Row
     │         [零]         │         [甲]         │
     │                      │                      │
     ├──────────────────────┼──────────────────────┤
     │                      │                      │
     │      个位 (Ones)     │      地支 (Branch)   │  ◄ Bottom Row
     │         [一]         │         [子]         │
     │                      │                      │
     └──────────────────────┴──────────────────────┘
             Left Col               Right Col
           (Card Index)             (Ganzhi)
```

* **Reading Order (Classical Right-to-Left Columns)**:
  1. Top-Right: Heavenly Stem (天干)
  2. Bottom-Right: Earthly Branch (地支)
  3. Top-Left: Tens Digit (十位，如 `零`, `一`, `二`, `三`, `四`, `五`, `六`)
  4. Bottom-Left: Ones Digit (个位，如 `一`..`九`, `零`)
* **Examples**:
  * Lot 01: `甲子零一`
  * Lot 02: `甲寅零二`
  * Lot 10: `乙未一零`
  * Lot 17: `丙申一七`
  * Lot 45: `辛巳四五`
  * Lot 60: `癸亥六零`

### Color & Texture Tokens

| Element | Token Name | Hex / RGBA | Description |
| :--- | :--- | :--- | :--- |
| **Card Canvas** | `--bg-obsidian` | `#111822` / `(17, 24, 34)` | Deepest obsidian slate background |
| **Seal Wash** | `--seal-bg-wash` | `rgba(34, 18, 22, 0.88)` | Translucent cinnabar ink wash |
| **Outer Border** | `--seal-border-outer` | `#A5342A` / `rgba(165, 52, 42, 1)` | 3px rounded border (`radius=11px`) |
| **Inner Hairline**| `--seal-border-inner` | `rgba(120, 36, 28, 0.70)` | 1px delicate inner border (`inset=7px`) |
| **Seal Glyphs** | `--seal-glyph` | `#DE4C3E` / `rgba(222, 76, 62, 1)` | Rich cinnabar vermillion stroke ink |
| **Gold Foil** | `--gold-foil-primary` | `#D4AF37` / `#E8C96C` | Celestial mandala, borders, and titles |

---

## 3. Asset Hierarchy & File Organization

The asset catalog under `assets/cards/` is structured as follows:

```
assets/
├── fonts/
│   ├── fangzhengxiaozhuan.ttf     ◄ Full-coverage Small Seal TTF font (5.0MB)
│   └── LXGWSeal-Regular.ttf       ◄ SIL OFL 1.1 Small Seal companion font
├── cards/
│   ├── lot_01_card.jpg            ◄ Completed master composite (Lots 1–10, 17)
│   ├── lot_02_card.jpg
│   ├── ...
│   ├── bases/                     ◄ Base artwork backdrops (without baked stamps)
│   │   ├── lot_01_base.jpg
│   │   ├── lot_02_base.jpg
│   │   └── ...
│   └── seals/                     ◄ 60 Retina-ready 2x standalone seal PNGs (208×208)
│       ├── seal_01.png            (甲子零一)
│       ├── seal_02.png            (甲寅零二)
│       ├── ...
│       └── seal_60.png            (癸亥六零)
```

---

## 4. Production Pipeline: `scripts/build_lot_cards.py`

An automated Python compositor CLI is located at [`scripts/build_lot_cards.py`](../../scripts/build_lot_cards.py):

```bash
# 1. Regenerate all 60 standalone seal stamps
python scripts/build_lot_cards.py --seals

# 2. Refactor specific cards
python scripts/build_lot_cards.py --refactor 1 2 17

# 3. Batch regenerate seals and composite all existing cards
python scripts/build_lot_cards.py --all
```

### Exact Precision Metrics (848×1264 Canvas)
* **Card Dimensions**: 848 × 1264 px (Aspect ratio ~ 2:3)
* **Top Numeral**: `y = 30..65 px`, centered at `x = 424 px`
* **Seal Box Bounding Box**: `x = [372, 476]`, `y = [129, 233]` (104 × 104 px, center `(424, 181)`)
* **Moon Phases Arch**: `y = 180..245 px`
* **Central Mandala**: `y = 250..950 px`
* **Traditional Chinese Title**: `y = 985..1045 px`, font size ~40px, centered
* **English Primary Title**: `y = 1060..1105 px`, font size ~26px, gold serif caps, tracking `0.15em`
* **English Subtitle**: `y = 1120..1155 px`, font size ~20px, italicized gold serif caps

---

## 5. Multi-Platform Frontend Implementation

In production apps (Web/PWA, React Native/Expo, Tauri), cards can be rendered in two complementary modes:

### Mode A: Static Ultra-Optimized Raster (`lot_XX_card.jpg`)
Directly displays the pre-composited image for rapid loading, offline caching, and low memory overhead:
```tsx
<img 
  src="/assets/cards/lot_17_card.jpg" 
  alt="Lot 17 - Dragon & Serpent"
  className="rounded-2xl shadow-2xl border border-amber-500/20"
  loading="lazy"
/>
```

### Mode B: Dynamic Layered SVG / React Component
Allows real-time localization, gyroscope-driven foil highlights, and custom language toggles:

```tsx
import React from 'react';

interface LotCardProps {
  lotNumber: number;
  ganzhiZh: string;
  titleZh: string;
  titleEn: string;
  subtitleEn: string;
  locale?: 'zh-TW' | 'zh-CN' | 'en';
}

export const LotCard: React.FC<LotCardProps> = ({
  lotNumber,
  ganzhiZh,
  titleZh,
  titleEn,
  subtitleEn,
  locale = 'zh-TW',
}) => {
  const padNum = String(lotNumber).padStart(2, '0');
  
  return (
    <div className="relative w-[340px] h-[506px] rounded-2xl overflow-hidden bg-[#111822] shadow-2xl select-none group">
      {/* 1. Base Sacred Geometry Backdrop */}
      <img
        src={`/assets/cards/bases/lot_${padNum}_base.jpg`}
        alt={`Lot ${lotNumber}`}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 2. Top Universal Numeral */}
      <div className="absolute top-5 inset-x-0 text-center font-serif text-2xl text-[#E8C96C] tracking-wider drop-shadow-md">
        {lotNumber}
      </div>

      {/* 3. Layered 4-Character Qin Seal Stamp */}
      <img
        src={`/assets/cards/seals/seal_${padNum}.png`}
        alt={`${ganzhiZh} Seal`}
        className="absolute top-[52px] left-1/2 -translate-x-1/2 w-[42px] h-[42px] drop-shadow-lg"
      />

      {/* 4. Dynamic Typography */}
      <div className="absolute bottom-6 inset-x-0 flex flex-col items-center text-center px-4">
        {/* Chinese Title */}
        <h2 className="font-serif text-xl text-[#F5E6BE] tracking-widest mb-1 drop-shadow">
          {titleZh}
        </h2>
        {/* English Title & Subtitle */}
        <p className="font-serif text-sm font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
          {titleEn}
        </p>
        <p className="font-serif text-xs italic tracking-widest text-[#E8C96C]/80 uppercase mt-0.5">
          {subtitleEn}
        </p>
      </div>

      {/* 5. Gold Foil Shimmer Animation Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#E8C96C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </div>
  );
};
```

---

## 6. Verification & Quality Checklist

- [x] All 60 authentic 4-character seal stamps generated in [`assets/cards/seals/`](../../assets/cards/seals/).
- [x] Zero AI filler characters or stroke hallucinations in any seal stamp.
- [x] Canonical Ganzhi mapping validated against [`data/canonical/lots_compiled.json`](../../data/canonical/lots_compiled.json) (e.g. Lot 17 = `丙申一七`, Lot 45 = `辛巳四五`).
- [x] Existing 11 completed cards (`lot_01` to `lot_10`, `lot_17`) refactored and visually verified.
- [x] Automated compositor script [`scripts/build_lot_cards.py`](../../scripts/build_lot_cards.py) committed and ready to process remaining cards as API quotas allow.
