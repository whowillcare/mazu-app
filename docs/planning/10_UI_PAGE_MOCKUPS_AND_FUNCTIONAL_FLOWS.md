# 10. UI Page Mockups & Functional Flows

> **Design Principle**: **Clean Single-Language Focus by Default**. To avoid visual clutter ("linguistic mess"), interface chrome, guidance narratives, and reflections are displayed strictly in the user's preferred language. Only essential cultural anchors (Lot Card Title, Ganzhi/Year, Hexagram, and BaZi metaphysical terms) retain companion glosses. A dedicated **Bilingual Study Mode (雙語對照模式)** is available as an opt-in user preference.

---

## 0. Language & Cultural Anchor Presentation Architecture

### 1. The Anti-Clutter Governance Rule
* **Default Experience (Single-Language Mode)**:
  * If the user selects **English**: All guidance, questions, reflections, keyword clusters, and button labels appear strictly in English. No duplicate Chinese paragraphs beneath English text.
  * If the user selects **Traditional Chinese (繁體中文)** or **Simplified Chinese (简体中文)**: The entire reading, verse, and interface appear strictly in Chinese.
* **The "Key Cultural Anchor" Whitelist**:
  To preserve authentic temple heritage without cluttering the screen, only four specific metaphysical components retain companion bilingual glosses in single-language mode:
  1. **Lot Card Title & Number**: e.g., `LOT 01 · Bao Gong Calls Down Thunder (包公請雷)`
  2. **Ganzhi & Year**: e.g., `Jia-zi (甲子)`, `2026 (Bing-wu 丙午)`
  3. **Hexagram Name**: e.g., `Qian, Heaven (乾为天)`
  4. **Metaphysical Ten Gods / Pillars**: e.g., `Day Master (日主)`, `Direct Resource (正印)`
* **Opt-in "Bilingual Comparative Study Mode" (雙語研讀對照模式)**:
  Users who want full parallel Chinese verses and unrhymed English translations side-by-side (such as diaspora families, cultural scholars, or language students) can activate this mode with a single toggle in **Preferences**.

---

## Screen 0 · Language & Display Preferences Drawer (偏好设置抽屉)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PREFERENCES & DISPLAY SETTINGS                                    [✕ Close]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRIMARY LANGUAGE (主要語言):                                               │
│  (•) English (US)                                                           │
│  ( ) 繁體中文 (Traditional Chinese - 臺灣 / 香港 / 媽祖廟本)                │
│  ( ) 简体中文 (Simplified Chinese)                                          │
│                                                                             │
│  READING DISPLAY MODE (解籤呈現模式):                                       │
│  (•) Clean Focused Mode (Default / 預設沈浸模式)                            │
│      Presents reading strictly in your preferred language for a serene,     │
│      uncluttered experience. Key cultural anchors (Ganzhi, Hexagram,        │
│      and Card Name) are kept as subtle inline glosses.                      │
│                                                                             │
│  ( ) Bilingual Study Mode (雙語對照研讀模式)                                │
│      Displays traditional Chinese temple verses and English translations    │
│      side-by-side with dual-language guidance for comparative study.        │
│                                                                             │
│  CULTURAL GLOSS STYLE (文化術語呈現):                                       │
│  (•) Inline Parentheses: "Bao Gong Calls Down Thunder (包公請雷)"           │
│  ( ) Interactive Tooltip: Tap or hover term to reveal traditional character  │
│                                                                             │
│  AUDIO & ATMOSPHERE (氛圍與音效):                                           │
│  [X] Ambient temple bell & chime on draw                                    │
│  [X] Subtle haptic feedback on bamboo lot selection (Mobile)                │
│                                                                             │
│                            ┌─────────────────┐                              │
│                            │  [ Save & Apply]│                              │
│                            └─────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 1 · Landing Page (The Porch / 山门)

### Clean English Default View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✦ MAZU SIXTY JIAZI LOTS                      [About] [Archive] [EN ▾] [⚙️]  │
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

### Clean Single-Language View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◄ [Back]                           STEP 1 OF 3                    [Cancel] │
│                                                                             │
│                        WHAT IS YOUR CONTEMPLATION?                          │
│               Select the life domain you bring before the lot               │
│                                                                             │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐   │
│   │ 💼 Career & Ambition │  │ 💰 Wealth & Finance* │  │ 🕊️ Relationships│   │
│   │    Work & Vocation   │  │    Resources & Gain  │  │    Partnership  │   │
│   └──────────────────────┘  └──────────────────────┘  └─────────────────┘   │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐   │
│   │ 🌿 Health & Calm*    │  │ ⚖️ Legal & Disputes* │  │ 🏡 Family & Home│   │
│   │    Recovery & Body   │  │    Justice & Accord  │  │    Household    │   │
│   └──────────────────────┘  └──────────────────────┘  └─────────────────┘   │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐   │
│   │ 👶 Conception*       │  │ 🧭 Travel & Relocation│  │ 📈 Business     │   │
│   │    Family Lineage    │  │    Journeys & Moves  │  │    Ventures     │   │
│   └──────────────────────┘  └──────────────────────┘  └─────────────────┘   │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐   │
│   │ 🌊 Sea & Voyage      │  │ 🌱 Craft & Enterprise│  │ ⏳ Annual Timing│   │
│   │    Crossing Waters   │  │    Daily Industry    │  │    The Year Ahead│  │
│   └──────────────────────┘  └──────────────────────┘  └─────────────────┘   │
│                                                                             │
│   * Notice: Specific legal, medical, or financial disclaimers apply.        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 3 · Question Gate (问法治理闸门)

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
│                                                          [⚙️ Display] [🔊]   │
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
│                    Drawing from the Sixty Jiazi Lots...                     │
│                True cryptographic entropy (Web Crypto API)                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 5 & 6 · The Lot Reveal & Free Reading (出签与免费解读)

### View A · Clean Focused English View (Default)

> **Uncluttered Experience**: All guidance, keywords, and interpretations are presented in clean English. Key cultural anchors (`Jia-zi (甲子)`, `Bao Gong Calls Down Thunder (包公請雷)`, `Qian, Heaven (乾为天)`) are glossed cleanly. The traditional Chinese verse is accessible on-demand via a subtle toggle.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [◄ Share Reading]                           [Display: Clean ▾] [Save Vault]│
│                                                                             │
│  ┌───────────────────────────┐   LOT 01 · BAO GONG CALLS DOWN THUNDER       │
│  │                           │   Canonical Gloss: 包公請雷                   │
│  │                           │   Ganzhi: Jia-zi (甲子) · Number 01          │
│  │                           │   Hexagram: Qian, Heaven (乾为天 · ○○○○○○)   │
│  │   [ LOT ARTWORK IMAGE ]   │   Element: Metal · Favours Autumn, West      │
│  │    assets/cards/          │   Editorial Tone: Favourable (Positive Flow) │
│  │    lot_01_card.jpg        │                                              │
│  │                           │   POETIC VERSE:                              │
│  │                           │   "Why must you inquire after sacred         │
│  │                           │    portents?                                 │
│  │                           │    Within your own heart lies already what   │
│  │                           │    is of benefit.                            │
│  │                           │    Look now toward the middle of the month;  │
│  │                           │    Adversity breaks open and turns to good." │
│  │                           │                                              │
│  │                           │   [📜 View Original 7-Character Verse] ▾     │
│  └───────────────────────────┘                                              │
│                                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                             │
│  ✦ GUIDANCE FOR YOUR DOMAIN: [CAREER & AMBITION]                            │
│  "The road opens — declare what you are aiming at with steady clarity,      │
│   and take your stride forward without second-guessing."                    │
│                                                                             │
│  ✦ KEYWORD CLUSTERS:                                                        │
│  • FAVOURABLE: Clearing sky · Broad open path · Auspicious & settled        │
│  • GUARDED: Over-managing what is already sound · Borrowing future trouble  │
│                                                                             │
│  ✦ READING NOTES (PHILOLOGICAL INSIGHT):                                    │
│  ▸ "Qing-ji" (清吉): Denotes at once atmospheric clarity (clearing skies)   │
│    and ethical rightness in affairs.                                        │
│  ▸ "Da-dao" (大道): Signifies both the broad physical road and the upright  │
│    principled course of action.                                             │
│                                                                             │
│  ✦ ACTION WINDOW: Favourable developments peak toward mid-month.             │
│    Boundary: Seasonal windows only. No calendar dates predicted.            │
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

### View B · Clean Traditional Chinese View (繁體中文預設模式)

> For Chinese locale users: Complete traditional cultural reading without English clutter.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [◄ 分享靈籤]                                 [語言: 繁體中文 ▾] [存入籤庫] │
│                                                                             │
│  ┌───────────────────────────┐   第一籤 · 甲子 (零一)                       │
│  │                           │   典故：包公請雷驚仁宗                       │
│  │                           │   卦象：乾為天 (天行健 · ○○○○○○)             │
│  │                           │   五行：金 · 旺於秋季、西方                  │
│  │   [ 媽祖靈籤卡面原圖 ]    │   籤詩屬性：大吉 (正向流暢)                  │
│  │    assets/cards/          │                                              │
│  │    lot_01_card.jpg        │   籤詩正文：                                 │
│  │                           │   君爾何須問聖跡，自己心中皆有益。           │
│  │                           │   于今且看月中旬，凶事脫出化成吉。           │
│  │                           │                                              │
│  │                           │   語譯：何必汲汲於向外卜問神祇聖蹟？         │
│  │                           │   你的本心之中，早已明白何者正當有益。       │
│  │                           │   待至月中旬之時，滯礙自然化解，轉為吉相。   │
│  └───────────────────────────┘                                              │
│                                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                             │
│  ✦ 針對所問事域指引：【功名 · 事業作事】                                    │
│  「大道已開——將你真正瞄準的方向明朗道出，心無旁騖地踏步前行。」             │
│                                                                             │
│  ✦ 意象吉凶提要：                                                           │
│  • 吉相：雲霧散盡 · 大道通達 · 清吉平順                                     │
│  • 所忌：疑神疑鬼 · 自尋煩惱 · 徒耗心神過度干涉已成之局                     │
│                                                                             │
│  ✦ 文典訓詁考釋：                                                           │
│  ▸ 「清吉」：指天清氣朗，亦指人事澄澈安泰、不生波瀾。                       │
│  ▸ 「大道」：既指眼前通衢坦途，亦指行事循天地正理、光明磊落。               │
│                                                                             │
│  ✦ 時節提點：中旬應驗，事漸清朗。不作武斷日期預測，重在因勢利導。           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ═════════════════════════════════════════════════════════════════════════  │
│  ✦ 本籤與您的個人本命八字如何呼應？                                         │
│                                                                             │
│  每支靈籤皆具備獨立天干地支（本籤為甲子）。輸入出生時辰，經真太陽時校正，    │
│  即可由個人化引擎進行「籤盤合參」（刑衝合害與流年共振），獲取時令行事節奏。 │
│                                                                             │
│                  ┌────────────────────────────────────────┐                 │
│                  │        [ 解鎖個人命盤合參 · $2.99 ]    │                 │
│                  └────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### View C · Bilingual Comparative Study Mode (雙語研讀對照模式 · Opt-In)

> Activated only when user toggles `[Display: Bilingual Study Mode]`. Uses a balanced side-by-side split screen without mixing within lines.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [◄ Share Reading]                       [Display: Bilingual ▾] [Save Vault]│
│                                                                             │
│  LOT 01 · 甲子 (JIA-ZI) — BAO GONG CALLS DOWN THUNDER (包公請雷)            │
│  Hexagram: Qian, Heaven (乾为天) · Element: Metal (金) · Favourable (大吉)  │
│                                                                             │
│  ┌───────────────────────┬───────────────────────────────────────────────┐  │
│  │ CLASSICAL VERSE (籤詩)│ UNRHYMED ENGLISH TRANSLATION                  │  │
│  ├───────────────────────┼───────────────────────────────────────────────┤  │
│  │ 君爾何須問聖跡，      │ Why must you inquire after sacred portents?   │  │
│  │ 自己心中皆有益。      │ Within your own heart lies what is of benefit.│  │
│  │ 于今且看月中旬，      │ Look now toward the middle of the month;      │  │
│  │ 凶事脫出化成吉。      │ Adversity breaks open and turns to good.      │  │
│  └───────────────────────┴───────────────────────────────────────────────┘  │
│                                                                             │
│  DOMAIN GUIDANCE (事域指引 · CAREER & AMBITION):                            │
│  [EN] "The road opens — declare your aim clearly and proceed with steady    │
│       confidence."                                                          │
│  [ZH] 「大道已開——將你真正瞄準的方向明朗道出，心無旁騖地踏步前行。」        │
│                                                                             │
│  PHILOLOGICAL NOTES (詞義考辨):                                             │
│  ▸ 「清吉」(qīng-jí): Atmospheric clarity (sky) & ethical rightness (action).│
│  ▸ 「大道」(dà-dào): The physical highway & the virtuous, principled path.   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 7 & 8 · Personalized Deep Report (个性化解签引擎)

### Clean English View with Essential Cultural Anchors

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERSONALIZED REPORT · LOT 01 (甲子) × YOUR NATAL BA-ZI                     │
│  Subject: Alex Chen · Born: Oct 14, 1992 09:30 (True Solar Time Adjusted)   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  YOUR FOUR PILLARS (命盤四柱):                                              │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐              │
│  │  YEAR (年柱) │ MONTH (月柱) │  DAY (日主)  │  HOUR (時柱) │              │
│  │  Ren-Shen 壬申│ Geng-Xu 庚戌 │ Jia-Zi 甲子(木)│  Ji-Si 己巳  │              │
│  └──────────────┴──────────────┴──────────────┴──────────────┘              │
│                                                                             │
│  INTERACTION MATRIX WITH LOT 01 · JIA-ZI (甲子):                            │
│                                                                             │
│  1. DAY MASTER AFFINITY · RESONANCE (日柱伏吟/共振):                         │
│     The Lot's Branch (Zi Water 子) matches your Day Branch (Zi Water 子).   │
│     Metaphysical Dynamic: Direct Resource (正印). Deep emotional calm and   │
│     clear mental discernment govern this phase.                             │
│                                                                             │
│  2. MONTH PILLAR INTERACTION · CONTROLLED TEMPERING (月柱相生):             │
│     Lot Stem Jia Wood (甲) coordinates with Month Stem Geng Metal (庚).     │
│     Metaphysical Dynamic: Controlled Sharpening (克中有情). A temporary     │
│     professional restructuring leading to executive autonomy by mid-autumn. │
│                                                                             │
│  3. ANNUAL PILLAR INTERACTION · TIMING WINDOW (2026 丙午):                  │
│     Current Year Branch (Wu Fire 午) creates tension with Lot Branch (Zi 子).│
│     Action Guidance: Conserve initiative in peak summer solar terms;        │
│     execute major commitments during Late Summer & Autumn.                  │
│                                                                             │
│  [📥 Download PDF Heirloom Report]                   [📧 Send Copy to Email] │
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
- [11. Sixty Jiazi Lot Card Artwork Catalog](./11_LOT_CARD_ARTWORK_CATALOG.md)
- [12. Card Component Architecture & Refactoring](./12_CARD_COMPONENT_ARCHITECTURE_AND_REFACTORING.md)
- [Root README](../../README.md)
