# 00. Executive Summary & Business Architecture

## 1. Project Vision

**The Sixty Jiazi Lots of the Mazu Temple Tradition (六十甲子妈祖灵签)** is a modern, cross-platform cultural heritage and reflective guidance system.

Unlike generic fortune-telling apps or black-box astrology apps, this platform is rooted in the authentic 60 Jiazi divination tradition associated with Mazu (Tianhou) temples across Southeast Asia, Taiwan, and coastal China. It combines **philological rigor** (authentic classical verses, unrhymed English translations, dual-cluster keywords, and polysemy disclosure) with **personalized metaphysical calculation** (matching the Lot's Jiazi stem-branch against the user's Natal Four Pillars / BaZi and the current Annual Pillar).

### Core Brand Philosophy
> *"The Sixty Jiazi Lots of the Mazu temple tradition — draw a lot, then read it in the light of your own chart."*
>
> **Permanent Anchor Statement**: *"Cultural heritage and reflective guidance — not a prediction of events."*

---

## 2. Competitive Differentiation & Positioning

Most existing Chinese divination websites (e.g. `kaucim.ai`, generic temple draw sites) suffer from:
1. Low translation quality (machine translation without nuance).
2. Superstitious binary verdicts ("Good Luck" vs "Bad Luck").
3. Hidden, arbitrary randomness without explaining why the result was drawn.
4. Absence of personalization (everyone reading Lot #27 sees the exact same canned text).
5. No question governance (users ask vague, fatalistic, or third-person questions).

### Our Four Key Differentiators:
1. **The Question Gate (问法治理闸门)**:
   - Industry-first pre-draw gate.
   - Converts fatalistic, closed questions (*"Will he love me?"*) into actionable, reflective inquiry (*"What should I keep in view about this relationship, and what is mine to do?"*).
   - Re-centers third-person inquiries back to user agency.
   - Enforces *"One lot answers one matter"*.
2. **Philological Rigor & Radical Transparency**:
   - Discloses textual variants and polysemy (e.g., unfolding dual meanings of words like 「清吉」 or 「大道」 rather than forcing arbitrary disambiguation).
   - Unrhymed, poetic yet accurate English translations.
   - Dual keyword clusters: `FAVOURABLE` vs `GUARDED` (directional guidance rather than fatalistic judgment).
   - Explicit boundaries: provides seasonal windows and spatial directions, never specific dates or deterministic future promises.
3. **The Personalization Triad (签 × 命盘 × 流年)**:
   - 60 Jiazi Lots exactly correspond to the 60 Heavenly Stems and Earthly Branches (六十干支).
   - Cross-calculating the Lot's Jiazi with the user's Four Pillars (BaZi: Year, Month, Day, Hour) through traditional interaction mechanics (Clashes, Harm, Combinations, Punishments: 刑冲合害).
   - Temporal modulation through the Annual Pillar (流年).
4. **Legally Grounded & Ethically Guarded**:
   - Automatic category disclaimers (Medical, Financial, Legal, Conception).
   - Strict adherence to EU Consumer Rights Directive (CRD Art. 16(m)) for digital content.
   - Positioned clearly under cultural reflection/entertainment shields to eliminate regulatory liabilities in global jurisdictions.

---

## 3. The "Three Legs" Business Model (三条腿商业模型)

The platform is designed around three interlocking revenue engines that cross-promote and reinforce each other:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LEG 1: Free Draw & Acquisition                     │
│  • $0 Web / App Draw  • Rigorous Philological Translation  • Question Gate  │
│  • High SEO & AI Discoverability  • Builds Authority & Trust               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                         Natural Paywall Transition
               "This lot is general. What is it saying about YOUR situation?"
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LEG 2: Personalized Deep Report                       │
│  • $2.99 Launch / Trial Price  ─►  $19.99 Regular Tier                      │
│  • Birth Date + Time + Location  ─►  Lot × BaZi (命盘) × Annual (流年)       │
│  • Instant Web Report + Downloadable PDF + JSON Saved to Account            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                         Account Created & Retention Nudge
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LEG 3: Subscription, Milestones & Physical Goods         │
│  • $9.99 - $11.99 / month Recurring Subscription (CHANI / The Pattern model)│
│  • Daily / Weekly Lot Draw + Annual Solar/Lunar Transit Alerts              │
│  • Annual Birthday Solar Return / Transit Report (natural yearly repurchase)│
│  • Physical Upsell: 60-Card Oracle Deck + Companion Guidebook (Crowdfund)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Monetization Matrix

| Leg | Offering | Price Anchor | Primary Strategic Objective | Legal Compliance Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Leg 1: Free Draw** | Web & App interactive draw + generic domain guidance + keyword clusters + reading notes | **$0** | User acquisition, organic SEO, AI discoverability, establishing the brand as the highest-standard authority | **Low**: Cultural heritage & reflective guidance disclaimer |
| **Leg 2: Personalized Reading** | User inputs exact birth date, time, and location. Engine calculates Lot Jiazi × BaZi × Current Year pillar. Generates interactive digital report + PDF. | **$2.99** (Promo/trial)<br>─► **$19.99** (Standard) | First-order conversion; establishes clear monetization for bespoke calculations | **Low to Medium**: Strictly prohibit fatalistic/predictive health/financial promises |
| **Leg 3: Subscriptions & Physical Goods** | Daily/weekly lot reminders, calendar transits, archive vault, birthday annual forecast report ($29.99 one-off or subscription perk), plus 60-card physical deck. | **$9.99 - $11.99 / mo**<br>Deck: **$39 - $49** | Long-term LTV, recurring retention, community building, physical tangible brand anchor | **Low**: Subscription billing transparency (CRD Art. 16(m), 1-click cancel) |

---

## 4. Multi-Platform Delivery Strategy

The experience will be built with a unified architecture to serve:
1. **Web (Responsive Desktop & Mobile)**: The primary entry point for organic search, social sharing, and frictionless guest draws.
2. **Mobile Apps (iOS & Android)**: Provides haptic feedback for the ritual draw, push notifications for daily lots and solar terms, and in-app subscriptions.
3. **Desktop Application (Windows & macOS)**: Optional lightweight wrapper (Tauri / PWA) for users who prefer dedicated desktop cultural/daily practice apps.

All platforms will connect to a unified **Headless Backend API**, ensuring business logic, domain mappings, question gate AI, and astrological calculations remain identical across all touchpoints.

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

