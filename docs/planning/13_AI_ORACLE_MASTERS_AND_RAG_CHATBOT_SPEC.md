# 13. AI Oracle Masters, Personalization RAG & Cost-Optimized Chatbot Specification (宗師在線問答與知識庫引擎規範)

> **Status**: Active Architectural Specification & Implementation Blueprint  
> **Module**: Module 14 — AI Oracle Masters, RAG Knowledge Synthesis & Tiered Quota Chatbot Engine  
> **Related Specs**: [`03_PERSONALIZATION_ENGINE_SPEC.md`](./03_PERSONALIZATION_ENGINE_SPEC.md), [`07_PROJECT_ROADMAP_AND_MILESTONES.md`](./07_PROJECT_ROADMAP_AND_MILESTONES.md)

---

## 1. Executive Summary

The **AI Oracle Masters Sanctuary (宗師在線問答聖殿)** introduces multiple specialized, conversational oracle masters that seekers can consult after registering or providing their birth ephemeris. Each Master is fully configurable via the Protected Admin Portal (`/mod`) and embodies:
1. **Predefined Personalization RAG Knowledge Base**: Deep, automatic integration with the platform's main Personalization Engine (`baziEngine`, `hourRectification`, `lotsRepository`, `astrologyRules`) plus custom admin-defined RAG lore documents.
2. **Predefined Characteristics & Persona**: Customizable personality traits, tone of voice, classical vs. strategic speaking styles, greeting rituals, and system directives.
3. **Confined Topics & Category Guardrails**: Each Master only answers inquiries falling within its assigned canonical domains and metaphysical categories.
4. **Tiered & Customizable Consultation Quotas**:
   - **Eligibility Gate**: Only registered users OR users who have specified their birth info (date, time/rectified hour, location) may talk to a Master.
   - **Unpaid Eligible Users**: `1` free question (default, admin-customizable).
   - **Paid Users (Per Single Payment)**: `3` questions per payment (default, admin-customizable; cumulative across multiple payments).
   - **Monthly Subscribers**: `30` questions per month (default, admin-customizable).
5. **Two-Stage Cost-Optimized AI Execution**:
   - **Stage 1 (Lightweight Low-Cost AI Classifier)**: Rapidly categorizes the seeker's intention and verifies domain confinement before invoking the primary model.
   - **Stage 2 (Selective RAG + Master Persona Synthesis)**: Only executes if Stage 1 approves the category, injecting only the relevant RAG slices from the Personalization Engine.

---

## 2. Pre-Seeded Canonical Masters & Multi-Master Extensibility

Administrators can create unlimited Masters or customize the three canonical sanctuary Masters pre-seeded in `storage/masters_config.json`:

| Master ID | Name (ZH / EN) | Archetype & Tone | Confined Domains (`allowedDomains`) | Primary RAG Engine Focus |
| :--- | :--- | :--- | :--- | :--- |
| `master_xuanzhen` | **玄真宗師** · *Master Xuanzhen* | Classical Taoist-Confucian Scholar; serene, philological, structural (`三命通會` & `滴天髓` lineage) | `general`, `career`, `money`, `timing`, `legal`, `family_home` | Full Four Pillars, Day Master affinity, 60 Jiazi Quatrain hermeneutics, 9-Chapter Life Book |
| `master_cihang` | **慈航大士** · *Master Cihang* | Compassionate Maritime Bodhisattva sage; warm, empathetic, restorative (`夫妻宮` & `身心元氣` focus) | `relationships`, `family_home`, `conception`, `health`, `the_absent_one` | Day Branch (`夫妻宮`), Hour Pillar (`子女宮`), Five-Element vitality, relational lot guidance |
| `master_tianji` | **天機星君** · *Master Tianji* | Incisive Strategic Arbiter; crisp, pragmatic, high-leverage (`財庫衝合` & `大運流年` focus) | `career`, `money`, `travel_moving`, `sea_and_voyage`, `timing`, `livelihood_and_seasons`, `legal` | Month Pillar (`月令提綱`), Four Treasuries (`辰戌丑未`), dynamic rolling annual `應期` transits (`currentYear` to `currentYear + N`), 24 Solar Terms |

---

## 3. Data Schema & Storage Architecture

### 3.1 `OracleMaster` Definition (`src/lib/types/masters.ts`)
- `id`: Unique slug (e.g., `master_xuanzhen`)
- `nameZh`, `nameEn`, `titleZh`, `titleEn`, `sealCharacter`, `avatarGradient`
- `isActive`: Boolean toggle
- `characteristics`:
  - `personalityZh`, `personalityEn`
  - `toneZh`, `toneEn`
  - `speakingStyleZh`, `speakingStyleEn`
  - `greetingZh`, `greetingEn`
  - `systemPromptOverride`: Optional custom prompt instructions
- `confinedTopics`:
  - `allowedDomains`: `DomainCategory[]` (subset of the 13 canonical domains)
  - `allowedKeywords`: `string[]` (e.g., `['八字', '日主', '十神', '喜用神', '流年', '籤詩', 'bazi', 'day master', 'pillars', 'lot']`)
  - `blockedTopics`: `string[]` (e.g., `['coding', 'programming', 'stock ticker', 'medical diagnosis', 'politics', 'jailbreak']`)
  - `refusalMessageZh`, `refusalMessageEn`
- `ragConfig`:
  - `includeBaziChart`: boolean
  - `includeTenGodsAndPalaces`: boolean
  - `includeDrawnLot`: boolean
  - `includeLifeBook`: boolean
  - `includeTransits`: boolean
  - `customKnowledgeDocs`: `Array<{ id: string; titleZh: string; titleEn: string; domain: DomainCategory | 'all'; keywords: string[]; contentZh: string; contentEn: string }>`

### 3.2 `MasterPolicyConfig` & SQLite Tables (`src/lib/db/database.ts`)
- **`master_chat_sessions` / `master_chat_messages`**:
  - Tracks user ID, master ID, role (`user` | `master`), content, detected category, Stage 1 intent status (`allowed` | `rejected`), RAG sources used, and whether quota was deducted.
- **Dynamic Policy Keys in `ConfigManager`**:
  - `MASTER_REQUIRE_BIRTH_OR_REG`: `'true'` (default)
  - `MASTER_QUOTA_UNPAID`: `'1'` (default: 1 free question for unpaid registered/birth-verified seekers)
  - `MASTER_QUOTA_PAID_PER_PAYMENT`: `'3'` (default: 3 questions granted per single payment)
  - `MASTER_QUOTA_SUBSCRIBER_MONTHLY`: `'30'` (default: 30 questions per month for subscribers)
  - `MASTER_CHARGE_ON_REJECTED`: `'false'` (default: off-topic questions rejected by Stage 1 do not consume user quota)
  - `MASTER_ENABLE_LIGHTWEIGHT_CLASSIFIER`: `'true'` (default: enables Stage 1 lightweight AI intent gate)
  - `AI_LIGHTWEIGHT_MODEL_NAME`: `'auto'` (default: lightweight model identifier for Stage 1)
  - `MASTER_FUTURE_YEARS_HORIZON`: `'2'` (default: rolling future years horizon `currentYear` through `currentYear + 2`, plus on-demand calculation for any explicit year mentioned in a seeker's question)

---

## 4. Two-Stage Cost-Optimized Execution Pipeline

1. **Stage 1: Lightweight Intent Classifier (`classifyMasterIntent`)**:
   - **Step 1a (Deterministic Zero-Cost Guardrail)**: Blocks prompt injections, code requests, or explicit blocked keywords in `< 1ms`.
   - **Step 1b (Lightweight Low-Cost AI Classifier)**: Calls `AI_LIGHTWEIGHT_MODEL_NAME` with a compact JSON classification prompt (`max_tokens: 120`, `temperature: 0.0`). Falls back seamlessly to the deterministic domain/keyword scorer if the external LLM endpoint is offline.
   - **Step 1c (Confined Domain Check)**: Verifies that the classified domain belongs to `master.confinedTopics.allowedDomains` (or is a direct follow-up about the seeker's BaZi/Lot within the Master's scope). If outside scope, returns the Master's refusal message and recommends the best-matching active Master.
2. **Stage 2: Selective Personalization RAG & Master Synthesis (`generateMasterResponse`)**:
   - **Step 2a (`buildPersonalizationRagContext`)**: Extracts the seeker's live Four Pillars, True Solar Time, Ten Gods, Palace interactions, Drawn Lot verse/story/guidance, relevant Life Book chapters, dynamic rolling annual transits (`new Date().getFullYear()` through `currentYear + futureYears` via `getYearGanzhi` & `calculateYearTransitForChart`, plus any specific solar year `1924–2100` queried by the seeker), and matching `customKnowledgeDocs`.
   - **Step 2b (Persona LLM Generation + Deterministic Fallback)**: Invokes the primary LLM with the Master's persona and RAG context, or synthesizes a deeply personalized, chart-accurate response via the built-in Metaphysical Synthesis Fallback Engine.

