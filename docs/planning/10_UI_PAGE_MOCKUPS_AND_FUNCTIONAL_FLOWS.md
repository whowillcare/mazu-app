# 10. UI Page Mockups & Functional Flows

This document provides visual wireframes, component layouts, and state transitions for each functional screen in the Sixty Jiazi Mazu Lots platform.

---

## Screen 1 · Landing Page (The Porch)

### Layout & Visual Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [✦ MAZU SIXTY JIAZI · 媽祖六十甲子靈籤]            [About] [Archive] [EN/繁]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                                  ✦                                          │
│                                                                             │
│                  THE SIXTY JIAZI LOTS OF THE                                │
│                     MAZU TEMPLE TRADITION                                   │
│                                                                             │
│       "Draw a lot, then read it in the light of your own chart."            │
│                                                                             │
│                     ┌───────────────────────────┐                           │
│                     │       [ DRAW A LOT ]      │  ◄ (Primary CTA, Gold Glow│
│                     └───────────────────────────┘                           │
│                             Free · No Login Required                        │
│                                                                             │
│                                                                             │
│    ┌───────────────────┐    ┌───────────────────┐    ┌──────────────────┐   │
│    │  PHILOLOGICAL     │    │   QUESTION GATE   │    │  PERSONALIZED    │   │
│    │     RIGOR         │    │   (AI GOVERNED)   │    │   METAPHYSICS    │   │
│    │ Authentic verses, │    │ Mindful inquiry & │    │ Lot Jiazi cross- │   │
│    │ unrhymed English  │    │ sovereign agency; │    │ calculated with  │   │
│    │ & polysemy notes. │    │ one lot, one item.│    │ your natal chart.│   │
│    └───────────────────┘    └───────────────────┘    └──────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Cultural heritage and reflective guidance — not a prediction of events.    │
│  © 2026 Mazu Heritage Project · Privacy · Terms · CRD Art. 16(m) Notice      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 2 · Domain Picker (选问事域)

### Layout & Component Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◄ [Back]                           STEP 1 OF 3                    [Cancel] │
│                                                                             │
│                        WHAT IS YOUR CONTEMPLATION?                          │
│               Select the life domain you bring before the lot               │
│                                                                             │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐   │
│   │ 💼 Career & Ambition │  │ 💰 Wealth & Finance* │  │ 🕊️ Relationships│   │
│   │    (功名 / 作事)      │  │    (求財)            │  │    (婚姻)       │   │
│   └──────────────────────┘  └──────────────────────┘  └─────────────────┘   │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐   │
│   │ 🌿 Health & Calm*    │  │ ⚖️ Legal & Disputes* │  │ 🏡 Family & Home│   │
│   │    (治病)            │  │    (官事)            │  │    (家事/家運)  │   │
│   └──────────────────────┘  └──────────────────────┘  └─────────────────┘   │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐   │
│   │ 👶 Conception*       │  │ 🧭 Travel & Moving   │  │ 📈 Business     │   │
│   │    (求兒 / 六甲)      │  │    (出外/移居/築室)  │  │    (經商)       │   │
│   └──────────────────────┘  └──────────────────────┘  └─────────────────┘   │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐   │
│   │ 🌊 Sea & Voyage      │  │ 🌱 Livelihood/Craft  │  │ ⏳ Seasonal     │   │
│   │    (討海/行舟 - 媽祖) │  │    (耕作/六畜/作塭)  │  │    Timing (歲君)│   │
│   └──────────────────────┘  └──────────────────────┘  └─────────────────┘   │
│                                                                             │
│   * Notice: Specific legal, medical, or financial disclaimers apply.        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 3 · Question Gate (问法治理闸门)

### Component State: Interactive Reframing Comparison

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◄ [Back]                           STEP 2 OF 3                    [Cancel] │
│                                                                             │
│                         FORMULATE YOUR CONTEMPLATION                        │
│                 Inquire with clarity — one lot answers one matter           │
│                                                                             │
│  Selected Domain: [💼 Career & Ambition]                                    │
│                                                                             │
│  Your Question:                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Will I get the senior director promotion next month?                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ ✦ QUESTION GATE · REFINING YOUR INQUIRY                               │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │ Original Inquiry:                                                     │  │
│  │ "Will I get the senior director promotion next month?"                │  │
│  │                                                                       │  │
│  │ Reframed Action Contemplation:                                        │  │
│  │ "What leadership discipline and professional clarity are mine to      │  │
│  │  cultivate in this season?"                                           │  │
│  │                                                                       │  │
│  │ Why We Reframe:                                                       │  │
│  │ Temple lots provide reflective mirrors for your own sovereign effort  │  │
│  │ rather than predicting corporate decisions or fixed calendar dates.   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│      ┌───────────────────────────────────┐    ┌────────────────────────┐    │
│      │ [ Accept Contemplation & Proceed] │    │  [ Edit Question ]     │    │
│      └───────────────────────────────────┘    └────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 4 · The Ritual Draw (仪式化抽签)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                  [Audio: 🔊]│
│                                                                             │
│                                                                             │
│                                                                             │
│                                    ┌──┐                                     │
│                                   ╱ ╱ │                                     │
│                                  │ │  │   ◄ (Bamboo Lot Rising              │
│                                  │ │  │      with Gold Luminescence)        │
│                                ┌─┴─┴──┴─┐                                   │
│                                │ ║║║║║║ │                                   │
│                                │ ║║║║║║ │ ◄ (Rhythmic Cylinder Shaking      │
│                                │ 媽祖靈籤 │    2.5-second physics animation) │
│                                │ ║║║║║║ │                                   │
│                                └────────┘                                   │
│                                                                             │
│                       Drawing from Sixty Jiazi Lots...                      │
│                  True cryptographic entropy (Web Crypto API)                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 5 & 6 · The Lot Reveal & Free Reading (出签与免费解读)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [◄ Share Reading]                                            [Save to Vault]│
│                                                                             │
│  ┌───────────────────────────┐   LOT 01 · 甲子 (JIA-ZI)                     │
│  │                           │   Hexagram: 乾为天 Qian, Heaven (○○○○○○)     │
│  │                           │   Element: Metal · Favours Autumn, West      │
│  │   [ LOT ARTWORK IMAGE ]   │   Editorial Tone: Favourable (Positive flow) │
│  │                           │   Story: Bao Gong Calls Down Thunder         │
│  │                           │                                              │
│  │                           │   君爾何須問聖跡，自己心中皆有益。           │
│  │                           │   于今且看月中旬，凶事脫出化成吉。           │
│  │                           │                                              │
│  │                           │   "Why must you inquire after sacred portents?│
│  │                           │    Within your own heart lies already what   │
│  │                           │    is of benefit..."                         │
│  └───────────────────────────┘                                              │
│                                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                             │
│  ✦ GUIDANCE FOR YOUR DOMAIN: [CAREER & AMBITION]                            │
│  "The road opens — say what you are aiming at and move on it."              │
│  路是開著的——把你要瞄準的目標說出來，然後往前走。                           │
│                                                                             │
│  ✦ KEYWORD CLUSTERS:                                                        │
│  • FAVOURABLE (吉): Clearing sky · Open road · Auspicious & settled         │
│  • GUARDED (忌): Over-managing what is fine · Borrowing trouble             │
│                                                                             │
│  ✦ READING NOTES (POLYSEMY DISCLOSURE):                                     │
│  ▸ 「清吉」(qīng-jí): at once clear (the sky) and auspicious (the affair).  │
│  ▸ 「大道」(dà-dào): the broad physical road and the right ethical course.  │
│                                                                             │
│  ✦ BOUNDARIES: Seasonal windows only. No calendar dates predicted.          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ═════════════════════════════════════════════════════════════════════════  │
│  ✦ WHAT DOES THIS LOT SAY ABOUT YOUR SPECIFIC NATAL CHART?                  │
│                                                                             │
│  Every Lot corresponds to a Heavenly Stem & Earthly Branch (干支).          │
│  Enter your birth details to cross-calculate the Lot with your Four Pillars │
│  (BaZi: 刑衝合害) and the active Annual Pillar for seasonal action timing.  │
│                                                                             │
│                  ┌────────────────────────────────────────┐                 │
│                  │ [ Unlock Personalized Report · $2.99 ] │                 │
│                  └────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 7 & 8 · Personalized Deep Report (个性化解签引擎)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERSONALIZED REPORT · LOT 01 (甲子) × YOUR NATAL BA-ZI                     │
│  Generated for: Alex Chen · Born: Oct 14, 1992 09:30 (True Solar Adjusted)  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  YOUR FOUR PILLARS (命盤四柱):                                              │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐              │
│  │  YEAR (年柱) │ MONTH (月柱) │  DAY (日主)  │  HOUR (時柱) │              │
│  │     壬申     │     庚戌     │   甲子 (木)  │     己巳     │              │
│  └──────────────┴──────────────┴──────────────┴──────────────┘              │
│                                                                             │
│  INTERACTION MATRIX WITH LOT 01 (甲子):                                     │
│                                                                             │
│  1. DAY MASTER AFFINITY (日柱伏吟/共振):                                    │
│     The Lot's Branch (子 Water) matches your Day Branch (子 Water).         │
│     Dynamic: Direct Resource (正印). Deep emotional calm and mental clarity.│
│                                                                             │
│  2. MONTH PILLAR INTERACTION (月柱相生):                                    │
│     Lot Stem 甲 Wood coordinates with Month Stem 庚 Metal.                  │
│     Dynamic: Controlled sharpening (克中有情). Career restructuring that    │
│     leads to greater executive autonomy by mid-autumn.                      │
│                                                                             │
│  3. ANNUAL PILLAR RESONANCE (2026 丙午):                                    │
│     Current Year Branch (午 Fire) clashes with Lot Branch (子 Water).       │
│     Window of Action: Focus energy during Late Summer & Autumn; avoid       │
│     rushed commitments during the height of the summer solar terms.         │
│                                                                             │
│  [📥 Download Heirloom PDF Report]                   [📧 Send Copy to Email] │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 9 · Checkout & Legal Compliance Logging (结账与合规留痕)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ORDER SUMMARY & CHECKOUT                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Item: Personalized Lot Report (Lot #01 for Alex Chen)           $2.99 USD  │
│  Format: Instant Digital Interactive Web Report + Vector PDF                │
│  Applicable Taxes (VAT/Sales Tax):                               $0.00 USD  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Total Amount Due:                                               $2.99 USD  │
│                                                                             │
│  LEGAL WAIVER & CONSENT (MANDATORY FOR IMMEDIATE DIGITAL DELIVERY):         │
│                                                                             │
│  [X] I expressly request immediate access to this digital content and       │
│      acknowledge that upon delivery, I lose my statutory 14-day right       │
│      of withdrawal under EU Consumer Rights Directive (CRD Art. 16(m)).     │
│                                                                             │
│  [ ] (Optional) Save my natal chart to my secure vault for future draws.    │
│                                                                             │
│                    ┌───────────────────────────────────┐                    │
│                    │      Pay  /  G Pay  /  Stripe    │                    │
│                    └───────────────────────────────────┘                    │
│                                                                             │
│  Secure 256-bit encryption · 1-click self-service receipt & archive         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Planning Navigation (Relative Links)
- [00. Executive Summary](./00_EXECUTIVE_SUMMARY.md)
- [01. Product Requirements Document](./01_PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [02. Ten-Step User Journey Specification](./02_TEN_STEP_USER_JOURNEY_SPEC.md)
- [03. Personalization Engine Specification](./03_PERSONALIZATION_ENGINE_SPEC.md)
- [04. Domain Mapping & Question Gate Specification](./04_DOMAIN_MAPPING_AND_QUESTION_GATE.md)
- [05. Technical Architecture & Multi-Platform Strategy](./05_TECHNICAL_ARCHITECTURE_AND_MULTI_PLATFORM.md)
- [06. Compliance, Legal & Payment Specifications](./06_COMPLIANCE_LEGAL_AND_PAYMENTS.md)
- [07. Project Roadmap & Milestones](./07_PROJECT_ROADMAP_AND_MILESTONES.md)
- [08. Canonical Data Schema & API Visibility Specification](./08_CANONICAL_DATA_SCHEMA_AND_API_VISIBILITY.md)
- [09. Visual Design System & Aesthetic Theme Synthesis](./09_VISUAL_DESIGN_SYSTEM_AND_THEMES.md)
- [10. UI Page Mockups & Functional Flows](./10_UI_PAGE_MOCKUPS_AND_FUNCTIONAL_FLOWS.md)
- [Root README](../../README.md)
