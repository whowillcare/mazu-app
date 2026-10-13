# Sixty Jiazi Lots (六十甲子妈祖灵签) — Project Planning & Specifications

> **System Positioning**: A cross-platform cultural heritage & reflective guidance platform based on the traditional Sixty Jiazi Lots of the Mazu temple tradition.
> **Core Principle**: *"Cultural heritage and reflective guidance — not a prediction of events."*

---

## 📁 Planning Documents Directory

All project specifications, business model breakdowns, and architectural blueprints are organized in [`docs/planning/`](docs/planning/):

1. **[00_EXECUTIVE_SUMMARY.md](docs/planning/00_EXECUTIVE_SUMMARY.md)**
   High-level vision, core differentiation, and business model overview ("Three Legs").

2. **[01_PRODUCT_REQUIREMENTS_DOCUMENT.md](docs/planning/01_PRODUCT_REQUIREMENTS_DOCUMENT.md)**
   Detailed PRD covering user personas, functional requirements, non-functional requirements, and subscription tiers.

3. **[02_TEN_STEP_USER_JOURNEY_SPEC.md](docs/planning/02_TEN_STEP_USER_JOURNEY_SPEC.md)**
   Step-by-step UX walkthrough from Landing -> Domain Picker -> Question Gate -> Draw Animation -> Free Reading -> Paywall -> Personalized Reading ($2.99–$19.99) -> Checkout -> Retention Loop.

4. **[03_PERSONALIZATION_ENGINE_SPEC.md](docs/planning/03_PERSONALIZATION_ENGINE_SPEC.md)**
   Algorithm and data model for: **Lot Jiazi × Four Pillars (BaZi / 命盘) × Annual Pillar (流年)** calculation (刑冲合害, seasonal windows, elements).

5. **[04_DOMAIN_MAPPING_AND_QUESTION_GATE.md](docs/planning/04_DOMAIN_MAPPING_AND_QUESTION_GATE.md)**
   Mapping table from the 29 traditional Chinese temple categories to the 11+ English slots; Question Gate AI governance rules (single issue, question rewriting, third-person shift).

6. **[05_TECHNICAL_ARCHITECTURE_AND_MULTI_PLATFORM.md](docs/planning/05_TECHNICAL_ARCHITECTURE_AND_MULTI_PLATFORM.md)**
   System architecture for Web (Next.js/React PWA), Mobile (iOS/Android via React Native / Expo or Flutter), Desktop, and Headless Backend API (FastAPI / NestJS).

7. **[06_COMPLIANCE_LEGAL_AND_PAYMENTS.md](docs/planning/06_COMPLIANCE_LEGAL_AND_PAYMENTS.md)**
   Legal disclaimers (Medical, Financial, Legal, Conception), EU CRD Art. 16(m) right of withdrawal waiver, auto-renewal compliance, and Stripe checkout flow.

8. **[07_PROJECT_ROADMAP_AND_MILESTONES.md](docs/planning/07_PROJECT_ROADMAP_AND_MILESTONES.md)**
   Phased release plan: Phase 1 (Web MVP & Free Flow), Phase 2 (Engine & Payment), Phase 3 (Mobile Apps), Phase 4 (Physical Cards & Expansion).

9. **[08_CANONICAL_DATA_SCHEMA_AND_API_VISIBILITY.md](docs/planning/08_CANONICAL_DATA_SCHEMA_AND_API_VISIBILITY.md)**
   Canonical asset specification comparing internal vs. external manuscripts, merged data schema, RBAC visibility filtering, and SQLite/LibSQL database design.

10. **[09_VISUAL_DESIGN_SYSTEM_AND_THEMES.md](docs/planning/09_VISUAL_DESIGN_SYSTEM_AND_THEMES.md)**
   Aesthetic theme synthesis (Golden Thread + CHANI + Mazu Temple Heritage), color tokens, typography, motion design, and sample card artworks.

11. **[10_UI_PAGE_MOCKUPS_AND_FUNCTIONAL_FLOWS.md](docs/planning/10_UI_PAGE_MOCKUPS_AND_FUNCTIONAL_FLOWS.md)**
   High-fidelity ASCII wireframes and functional state layouts for all 10 user journey steps.

12. **[11_LOT_CARD_ARTWORK_CATALOG.md](docs/planning/11_LOT_CARD_ARTWORK_CATALOG.md)**
   Master visual catalog containing completed cards (Lots 1–10 & 17), artwork gallery, and full production prompts for all 60 lots.

13. **[12_CARD_COMPONENT_ARCHITECTURE_AND_REFACTORING.md](docs/planning/12_CARD_COMPONENT_ARCHITECTURE_AND_REFACTORING.md)**
   Layered card production architecture, authentic 4-character Qin Seal (秦小篆) formula, automated compositor pipeline, and multi-platform SVG/React component implementation.

---

*Note: As per project guidelines, no code will be implemented until the planning documentation is reviewed and approved.*
