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

## 3. Functional Requirements

### 3.1 Feature Group 1: Free Tier Experience (Guest & Registered)
- **FR-1.1: Frictionless Landing Screen**: Clear value proposition, zero signup barrier to start drawing, visible cultural heritage positioning statement.
- **FR-1.2: 11-Slot Domain Picker**: Interactive selection of inquiry domain (Career, Money, Relationships, Health, Legal, Family/Home, Conception, Travel/Settlement, Business, Timing, Sea/Voyage, Livelihood/Seasons, Loss/Recovery).
- **FR-1.3: Question Gate (AI Pre-flight)**:
  - Validates user inquiry into a single domain.
  - Automatically identifies and reframes fatalistic/closed questions into open, reflective questions.
  - Converts third-person questions into user-empowered action queries.
  - Displays transparent transformation reason (`disclosed_to_user: true`).
- **FR-1.4: Ritualized Draw Experience**:
  - 2–3 second authentic bamboo cylinder shaking animation with subtle sound/haptic feedback.
  - True browser-based cryptographic randomness (`crypto.getRandomValues(1..60)`).
  - Session locking: Single draw per question context to prevent spam clicking.
- **FR-1.5: Classical Lot Reveal**:
  - Lot Index (1–60), Jiazi combination (e.g., `Lot 27 · 戊辰 Wu-chen`), Hexagram name (`陸, Lu`).
  - Editorial tone assessment (`favourable`, `balanced`, `guarded`, etc.).
  - Elemental nature and seasonal direction (e.g., `Earth — favours late summer; southwest`).
  - Canonical historical allusion story title and 2-sentence synopsis.
  - Classical 4-line Chinese verse alongside curated unrhymed English translation.
- **FR-1.6: Philological Guidance Display**:
  - Specific domain guidance line matching the selected slot.
  - Dual keyword clusters (`FAVOURABLE` vs `GUARDED`).
  - Polysemy Reading Notes unfolding classical double-meanings.
  - Boundaries Card explaining why no exact dates are provided.
  - Automated regulatory disclaimers attached per category.

### 3.2 Feature Group 2: Paid Personalization Layer ($2.99 – $19.99)
- **FR-2.1: Paywall Bridge**: Contextual banner below free reading asking: *"This lot is general. What is it saying about your specific situation?"*
- **FR-2.2: Birth Data Ingestion**:
  - Form capturing: Solar/Gregorian Birth Date, Birth Time (with "Unknown" option defaulting to noon / day-master analysis), and City/Country of birth (for true solar time timezone offset adjustment).
- **FR-2.3: Astrological Calculation Engine**:
  - Conversion of birth parameters into Four Pillars (Year, Month, Day, Hour Ganzhi).
  - Cross-computation with the drawn Lot’s Ganzhi:
    - Heavenly Stem relationships (Ten Gods / 十神 interaction, Stem combinations/clashes).
    - Earthly Branch interactions (Six Harmonies, Three Harmonies, Clashes, Punishments, Harms: 六合, 三合, 六冲, 相刑, 相害).
  - Integration with current Annual Pillar (流年干支) to generate a seasonal reflection window (Quarterly/Seasonal, never exact day predictions).
- **FR-2.4: Report Delivery & Storage**:
  - Instant interactive web-based report with smooth accordion sections and visual natal wheel/pillars.
  - Automated PDF generation dispatched via transactional email.
  - Archival to the user's permanent account vault.

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
- **Localization Requirement**:
  - The Classical verse and story titles are preserved in Traditional Chinese with Pinyin and English translations.
  - Interface strings managed via standard i18n JSON resource files.

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

