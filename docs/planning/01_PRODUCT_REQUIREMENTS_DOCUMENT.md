# 01. Product Requirements Document (PRD)

## 1. Document Control
- **Product Name**: The Sixty Jiazi Lots of the Mazu Temple Tradition (六十甲子妈祖灵签)
- **Status**: Planning & Specification Phase (Zero-Code Stage)
- **Target Audience**: Global spiritual seekers, cultural heritage enthusiasts, mindful introspectors, astrology/tarot/I Ching practitioners.

---

## 2. Product Objectives & Target Personas

### 2.1 Objectives
1. **Provide an authentic, culturally rigorous digital temple lot experience** that preserves classical text fidelity while delivering world-class English translations and cultural context.
2. **Empower users through agency-centered inquiry** rather than passive fortune-telling, using an AI-guided Question Gate.
3. **Achieve sustainable unit economics** via a frictionless freemium funnel: Free Web Draw -> $2.99 low-barrier personalized trial -> $19.99 premium report -> $9.99–$11.99/mo subscription.

### 2.2 Target Personas

#### Persona A: "The Mindful Seeker" (Primary - Western / Global English)
- **Profile**: 24–42 years old, uses apps like Co-Star, CHANI, or Tarot decks for self-reflection and decision clarity.
- **Pain Point**: Finds traditional Chinese fortune-telling opaque, poorly translated, fatalistic, or superstitious.
- **Value Realization**: Appreciates the unrhymed, poetic English translations, the historical stories, and the agency-focused Question Gate.

#### Persona B: "The Diaspora & Heritage Explorer"
- **Profile**: 20–38 years old, second/third-generation Chinese or East Asian diaspora wanting to reconnect with traditional customs like Mazu temple culture.
- **Pain Point**: Traditional temple visits are geographically inaccessible or linguistically intimidating.
- **Value Realization**: Can view traditional Chinese alongside deep, nuanced English explanations, element tables, and BaZi charts.

#### Persona C: "The Classical Metaphysics Practitioner"
- **Profile**: Students or enthusiasts of I Ching (易经), BaZi (八字), and Zi Wei Dou Shu (紫微斗数).
- **Pain Point**: Most online lot draws don't integrate stem-branch relationships or natal chart positions.
- **Value Realization**: Deep calculation between the Lot's Jiazi stem-branch and natal four pillars (刑冲合害).

---

## 3. Functional Requirements & Core Business Logic

### 3.1 Feature Group 1: Landing Page, AI Intent Parser & Ritualized Draw
- **FR-1.1: Frictionless Landing Screen Question Input**:
  - Accessible to both guests and registered users without initial signup friction.
  - Prominent question entry box with clear cultural positioning statement: *"Ask one matter with genuine intent; let classical archetypes illuminate your path."*
- **FR-1.2: Cost-Efficient AI Intent Parser & Domain Classifier**:
  - Leverages a cost-efficient LLM routing pipeline (e.g. FreeLLMAPI, DeepSeek, or compact OpenAI-compatible models) paired with an ultra-fast offline regex pre-classifier (`domKw.json`).
  - Automatically parses the user's authentic intention and maps it to the 13 canonical domain slots (`relationships`, `career`, `money`, `health`, `family_home`, `travel_moving`, `sea_and_voyage`, `the_absent_one`, `legal`, `conception`, `timing`, `livelihood_and_seasons`, `general`).
  - **Multi-Domain Guardrail ("一籤斷一事" / "One Lot Answers One Matter")**: If the query spans multiple distinct domains (e.g., *"Will I get promoted and will my relationship work out?"*), the system detects the compound intent and prompts the user to focus on a single question at a time before proceeding.
- **FR-1.3: 5-Second Domain Override Buffer (Pre-Draw Countdown)**:
  - Once the user clicks the **[ Draw a Lot / 抽签 ]** button, the system displays the AI-detected inquiry domain.
  - An interactive **5-second countdown timer** is presented, providing the user with a frictionless window to confirm or manually change/override the domain if the parsed intent is not accurate or misaligned with their true focus.
  - Upon user confirmation or expiration of the 5-second countdown, the ritual drawing sequence starts automatically.
- **FR-1.4: Ritualized Draw Experience**:
  - 2.5-second authentic bamboo cylinder shaking animation with sound and haptic vibration.
  - True client-side cryptographic randomness (`crypto.getRandomValues(1..60)`).
  - Session locking: Single draw per question context to prevent spam clicking and encourage sincere contemplation.
- **FR-1.5: Classical Lot Reveal**:
  - Lot Index (1–60), Jiazi combination (e.g. `Lot 27 · 戊辰 Wu-Chen`), Hexagram name (`陸, Lu`).
  - Editorial tone assessment (`favourable`, `balanced`, `guarded`), seasonal direction, and 4-line classical quatrain with curated unrhymed English translation.
  - Canonical historical allusion title (e.g. `胡完救文氏母女`) and 2-sentence synopsis.
- **FR-1.6: Generic Guidance Display & Prominent Disclaimer**:
  - Displays the canonical domain guidance line (`jie` / 解曰) matching the active domain slot.
  - **Prominent General Disclaimer**: Explicitly states: *"This interpretation is a general reading based on the lot's classical verses. Personal resonance depends on individual circumstances and your unique birth chart configuration."*
  - Contextual ethical disclaimers attached per category (`not_financial_advice`, `not_medical_advice`, `not_legal_advice`, etc.).

---

### 3.2 Feature Group 2: Dual-Branch Personalization, Birth Hour Rectification & Monetization

- **FR-2.1: The Bridge to Personalization**:
  - Contextual prompt below generic reading: *"This lot is general. What does it reveal within YOUR unique chart?"*
  - Invites the user to input their birth date and location for deep astrological cross-analysis.

- **FR-2.2: Dual-Branch Birth Time Input & Hour Rectification (时辰逆推 / 考时定盘)**:
  - **Branch A (Known Exact Birth Time)**:
    - User enters specific birth hour and minute (with geographic city/country for True Solar Time offset).
    - Directly generates the Four Pillars (四柱八字) and proceeds to report generation (FR-2.3).
  - **Branch B (Unknown / Approximate Birth Time)**:
    - User selects a coarse day interval: **Morning (早: 05:00–11:00)**, **Afternoon (午: 11:00–17:00)**, **Night (晚: 17:00–23:00)**, or **Not Sure (不清楚: all 12 hours)**.
    - **Advanced Paid Engine Rectification (`米圖八字排盤軟件` Kernel Integration)**:
      1. Generates 3 to 12 candidate Hour Pillars (时柱) based on the user's Gregorian birthday and birth coordinates.
      2. Runs the deterministic life milestone algorithm (`verdict.py:converge()` & `year_events()`) across each candidate chart, deriving candidate milestone years (`应期` / `引动年`) across life domains (e.g. relationship shifts, career turning points, moves/relocations, major financial events).
      3. Presents a **Targeted Past-Event Questionnaire** (2–3 short, high-contrast questions about historical milestones, e.g., *"Did you experience a major career elevation or relocation around 2018 or 2021?"*).
      4. Correlates the user's answers against candidate charts to mathematically converge on and **pinpoint the user's exact birth hour branch** (*考时定盘*).

- **FR-2.3: The Convincing Insightful Excerpt Hook (Free Snippet)**:
  - Before requiring payment, the system generates a **brief but deeply insightful, convincing structural excerpt** (2–3 sentences derived from `verdict.py:settle_nature()` and `main_verdicts()`).
  - Accurately captures the user's core psychological archetype, past internal tensions, and structural fortune dynamics (e.g., *"Your chart reveals an inherent tension between creative independence and institutional structures, indicating that key breakthroughs emerge only when personal autonomy is safeguarded..."*).
  - Acts as an undeniable demonstration of authenticity and depth, creating strong conversion momentum.

- **FR-2.4: Monetization Funnel & Paid Deliverables ($2.99 – $19.99)**:
  - **Option 1: Single Full Report Unlock & PDF Download ($2.99 promotional / $19.99 standard)**:
    - User creates an account / signs up and pays via Stripe (credit card, Apple Pay, Google Pay).
    - Instantly unlocks the full 9-section Life Book Report (`layers_mingshu.py` format):
      1. 命局定性 (Life Structure Character & Temperament)
      2. 事业与学业 (Career, Role & Industry Direction)
      3. 财富机制 (Wealth Architecture, Treasuries `财库`, & Cashflow Dynamics)
      4. 感情婚姻 (Partnership, Palace Interactions `夫妻宫`, & Relational Timing)
      5. 六亲家庭 (Family Dynamics, Parents, & Children `子女宫`)
      6. 身心健康 (Five Elements Balance & Vulnerabilities)
      7. 做功与厚化 (Core Capacities, Action Mechanisms, & Karmic Anchors)
      8. 大运走势 (10-Year Major Luck Cycles & Generational Shifts)
      9. 流年关键窗口与应期 (Annual Windows, Major Milestone Years, & Trigger Mechanisms)
    - Automated high-resolution PDF dispatched to registered email and saved to user vault.
  - **Option 2: Event-Triggered Predictive Subscription ($9.99 – $11.99/mo)**:
    - Delivers full report access plus **continuous event-triggered future predictions**:
      - **Annual Transit Alerts (`引动年` & `应期`)**: Proactive notifications when an upcoming calendar year activates natal palaces (clashing or combining with 夫妻宫, opening 财库, etc.).
      - **Solar Term Energy Shifts (节气交运)**: Seasonal contemplation updates aligned with astronomical transitions (Lichun, Equinoxes, Solstices).
      - **Weekly / Monthly Contemplation Prompts**: Tailored practices aligned with the user's active Dayun and Liunian.

### 3.3 Feature Group 3: Subscriptions & Lifecycle Engagement ($9.99 – $11.99/mo)
- **FR-3.1: Daily / Weekly Lot Practice**: Optional automated daily single-line contemplation or weekly ritual lot draw.
- **FR-3.2: Solar Term (节气) & Seasonal Transitions**: Notifications during key astronomical transitions (e.g., Lichun, Equinoxes, Solstices) highlighting shifts in the energetic landscape.
- **FR-3.3: Annual Birthday Forecast (Solar Return)**: Deep annual reading triggered prior to the user's birthday, comparing the upcoming annual pillar against natal pillars.
- **FR-3.4: Reading Vault & Journaling**: Allows users to attach personal notes, reflection logs, and revisit past readings over time.

### 3.4 Feature Group 4: eCommerce & Physical Upsell
- **FR-4.1: Physical 60-Card Oracle Deck Integration**: In-app showroom and checkout for physical cards + English companion guidebook.
- **FR-4.2: Digital-to-Physical Sync**: Ability to scan a QR code on a physical card to open the interactive digital reading note and natal chart comparison.

---

## 4. Multi-Lingual Architecture
- **Language Default**: English (International market priority).
- **Secondary Languages**: Traditional Chinese (繁體中文 - canonical temple script), Simplified Chinese (简体中文).
- **Future Expansions**: Japanese (日本语), Vietnamese (Tiếng Việt) due to regional historical affinity with Mazu / Matsu culture.
- **Localization & Display Modes**:
  - **Clean Single-Language Default**: To prevent visual mess and reading fatigue, body narratives, guidance lines, and UI elements are rendered strictly in the user's preferred language without interleaved parallel text.
  - **Cultural Anchor Whitelist**: Only essential cultural components retain companion bilingual glosses in single-language mode: Lot Card Name, Ganzhi/Year, Hexagram, and BaZi interaction terms.
  - **Opt-in Bilingual Study Mode (雙語研讀模式)**: A user preference toggle that unlocks side-by-side parallel classical verse and translation for philological study and diaspora education.
  - **Interface String Management**: All strings managed via standard i18n JSON bundles (`en.json`, `zh-TW.json`, `zh-CN.json`).

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Performance & Reliability
- **First Contentful Paint (FCP)**: < 1.2s on mobile 4G.
- **Time to Interactive (TTI)**: < 2.0s.
- **Randomness Integrity**: Zero server bias in free draw; `window.crypto.getRandomValues()` ensuring high entropy client-side generation.
- **Uptime Target**: 99.9% availability for API and Web application.

### 5.2 Security & Data Privacy
- **Birth Data Encryption**: User birth dates, times, and geographic coordinates encrypted at rest (AES-256) and in transit (TLS 1.3).
- **GDPR & CCPA Compliance**: Right-to-be-forgotten, full export of past readings and personal astrological charts.
- **No Third-Party Sharing**: Explicit promise that natal charts and personal questions are never sold to ad networks or third parties.

### 5.3 Legal & Compliance Guardrails
- **CRD Art. 16(m)**: EU digital consumer directive compliance with explicit immediate performance acknowledgement.
- **Auto-Renewal Transparency**: Double opt-in checkboxes, easily visible monthly/annual renewal amounts, 1-click subscription management.
- **Disclaimers by Category**: Non-removable disclaimers auto-rendered on health, finance, legal, and conception domains.

---

## 6. Out of Scope (Phase 1)
- Live 1-on-1 consultations with human master practitioners (planned for Phase 4+).
- Unrestricted AI chat with "spirits" or simulated deities (explicitly avoided to maintain ethical grounding and prevent hallucinated dogma).
- Deterministic event predictions (e.g. lottery numbers, medical cures, court verdict dates).

---

## 🧭 Planning Navigation (Relative Links)
- [00. Executive Summary](./00_EXECUTIVE_SUMMARY.md)
- [01. Product Requirements Document](./01_PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [02. Ten-Step User Journey Specification](./02_TEN_STEP_USER_JOURNEY_SPEC.md)
- [03. Personalization Engine Specification](./03_PERSONALIZATION_ENGINE_SPEC.md)
- [04. Domain Mapping & Question Gate Specification](./04_DOMAIN_MAPPING_AND_QUESTION_GATE.md)
- [05. Technical Architecture & Multi-Platform Strategy](./05_TECHNICAL_ARCHITECTURE_AND_MULTI_PLATFORM.md)
- [06. Compliance, Legal & Payment Specifications](./06_COMPLIANCE_LEGAL_AND_PAYMENTS.md)
- [07. Project Roadmap & Milestones](./07_PROJECT_ROADMAP_AND_MILESTONES.md)
- [Root README](../../README.md)

