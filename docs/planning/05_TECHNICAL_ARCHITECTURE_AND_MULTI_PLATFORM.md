# 05. Technical Architecture & Multi-Platform Strategy

## 1. High-Level Architecture Overview

The system is designed with a **Headless API-First Architecture**, separating the deterministic astrological/lot engines and business logic from the multi-platform presentation layers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION CLIENTS                               │
│                                                                             │
│   ┌────────────────────┐   ┌────────────────────┐   ┌───────────────────┐   │
│   │   Web App (PWA)    │   │  iOS & Android App │   │    Desktop App    │   │
│   │ Next.js 15 / React │   │ React Native Expo  │   │  Tauri / Web PWA  │   │
│   │ (Mobile & Desktop) │   │  (Native Haptics)  │   │ (Win / macOS)     │   │
│   └─────────┬──────────┘   └─────────┬──────────┘   └─────────┬─────────┘   │
└─────────────┼────────────────────────┼────────────────────────┼─────────────┘
              │                        │                        │
              └────────────────────────┼────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY & EDGE LAYER                           │
│     Cloudflare / CloudFront (Global CDN, SSL Termination, Edge Caching)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CORE BACKEND API SERVICES                            │
│                                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                   │
│  │    Lot Engine Service   │  │   Question Gate (AI)    │                   │
│  │ (60 Lots, Texts, Notes) │  │ (NLP Intent & Reframe)  │                   │
│  └─────────────────────────┘  └─────────────────────────┘                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                   │
│  │ BaZi / Solar Ephemeris  │  │   Billing & Compliance  │                   │
│  │ (Four Pillars Engine)   │  │ (Stripe, CRD 16(m), Log)│                   │
│  └─────────────────────────┘  └─────────────────────────┘                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                   │
│  │  User Vault & History   │  │  Report & PDF Renderer  │                   │
│  │  (Auth, GDPR, Records)  │  │ (Headless Print / Vector│                   │
│  └─────────────────────────┘  └─────────────────────────┘                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA PERSISTENCE                                 │
│  • PostgreSQL: Relational store for users, charts, orders, CRD logs         │
│  • Redis: Session locks, anti-spam draw limits, AI response cache           │
│  • Object Storage (S3 / R2): Generated PDF reports, card artwork assets     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Platform Implementation Strategy

To maximize code reuse, speed-to-market, and consistency across platforms, the project adopts a **Shared TypeScript Domain Core**:

### 2.1 Presentation Layers

| Platform | Technology Choice | Rationale & Capabilities |
| :--- | :--- | :--- |
| **Web** (Primary Entry) | **Next.js (App Router) / React / Tailwind** | Exceptional SEO performance, Server-Side Rendering (SSR) for landing pages and free reading discovery, instant PWA installability. |
| **Mobile** (iOS & Android) | **React Native (Expo)** | 90%+ code sharing with the web business logic, native haptic feedback for bamboo cylinder shaking, Apple/Google In-App Purchases, background push notifications for solar terms. |
| **Desktop** (Windows & macOS)| **Tauri (v2) or PWA** | Near-zero memory footprint (< 35MB), ultra-fast native window management, cross-platform compilation from the web codebase without electron bloat. |

### 2.2 Shared Core Monorepo Packages (`packages/`)
- `@lot/core`: Canonical 60 Jiazi datasets, 29-category mapping dictionary, and local validation.
- `@lot/bazi`: Ephemeris algorithms, True Solar Time calculation, Ganzhi cross-matrix computation (刑冲合害, 十神).
- `@lot/api-client`: Type-safe SDK generated from backend schemas for Web, Mobile, and Desktop.

---

## 3. Backend Micro-Modules & Services

### 3.1 `LotService` (Canonical Heritage Store)
- Immutable, version-controlled repository of the 60 Jiazi Lots.
- Stores:
  - Canonical Chinese verse (7-character quatrains: 七言绝句).
  - Accurate, unrhymed English translations.
  - Historical allusion story summaries.
  - Elemental nature, Hexagram correspondence, and directional affinities.
  - Philological dual-meaning notes (`polysemy_annotations`).
  - Canonical slot guidance lines.

### 3.2 `QuestionGateService` (AI Governance)
- Evaluates raw user inquiries before draw execution.
- Orchestrates lightweight LLM classification and deterministic regex filters:
  - Multi-intent detector (flags compound topics to enforce *"One lot answers one matter"*).
  - Open inquiry reframing (transforms closed fatalistic queries into agency-centered reflections).
  - Third-person perspective inverter (recenters queries on the querent).

### 3.3 `BaziCalculationService` (Metaphysical Engine)
- Implements high-precision astronomical solar term boundaries (*Lichun*, *Yushui*, etc.).
- Computes True Solar Time adjustments using geographic coordinates.
- Constructs the 4 Natal Pillars and 1 Annual Pillar.
- Executes the combinatorial interaction matrix with the drawn Lot's Jiazi stem-branch.

### 3.4 `BillingAndComplianceService`
- Integrates Stripe Payment Intents, Apple Pay, Google Pay, and Stripe Billing (subscriptions).
- Manages legal audit logging for EU Consumer Rights Directive (CRD Art. 16(m)) right-of-withdrawal waivers.
- Provides 1-click subscription management and automated invoice receipts.

### 3.5 `PdfReportService`
- Uses headless headless vector rendering (e.g., Typst / Puppeteer / WeasyPrint) to produce elegant, heirloom-quality, printable PDF reports for paid users.

---

## 4. Security, Privacy & Performance Standards

1. **Client-Side Randomness**: The draw seed is generated directly in the client (`crypto.getRandomValues`) to ensure the server cannot be accused of rigging results.
2. **PII Isolation**: Birth date, time, and coordinates are encrypted at rest using AES-256 and stored separately from billing transaction records.
3. **Session Locking**: Redis-backed distributed keys enforce an 12-hour session cooldown per domain, discouraging impulsive repeated re-draws.

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

