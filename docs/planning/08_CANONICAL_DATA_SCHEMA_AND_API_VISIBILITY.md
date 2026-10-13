# 08. Canonical Data Schema & API Visibility Specification

## 1. Overview & Source Documents Analysis

The canonical asset foundation of this platform is derived from two parallel master manuscripts:
1. **`raw/妈祖60签_中英对照_内部审阅件.docx` (Internal Review Version)**: Contains unedited, verbatim temple oracle judgment texts (`照抄庙本解曰`), raw grading evidence, and internal philological audit notes.
2. **`raw/妈祖60签_中英对照_对外件.docx` (External Public Version)**: Contains curated editorial summaries designed for general users, complying with consumer and cultural presentation standards without publishing raw temple divination decrees.

### 1.1 Structural Comparison & Audit Findings
- **Completeness**: Both manuscripts contain all **60 canonical lots** (Lot 1 to Lot 60).
- **Parity**: Core texts (classical 4-line Chinese verses, unrhymed English translations, hexagram correspondences, element & seasonal directions, keyword clusters, reading notes on puns/polysemy, plain meanings, question gate rewrites, 11-slot guidance, and 406 historical stories) are identical across both files.
- **The Divergence**: The divergence between the two files is strictly localized to two critical fields:
  1. `register` (Tone / Quality grading evidence): The internal version contains internal curation memos and raw polarities; the external version contains user-facing explanatory rationale.
  2. `criteria` (判据 / Temple Judgment Analysis): The internal version transcribes the raw temple oracle text verbatim across all 29 categories (`照抄庙本解曰`); the external version provides an editorial summary (`我方概括`).

---

## 2. Canonical Data Architecture

To serve both user types from a single, authoritative source of truth, all 60 lots have been extracted, bilingual-separated, and merged into structured engine files:

- **Individual Lot Records**: [`data/canonical/lots/lot_01.yaml`](../../data/canonical/lots/lot_01.yaml) through [`lot_60.yaml`](../../data/canonical/lots/lot_60.yaml)
- **Compiled JSON Bundle**: [`data/canonical/lots_compiled.json`](../../data/canonical/lots_compiled.json)
- **Compiled YAML Bundle**: [`data/canonical/lots_compiled.yaml`](../../data/canonical/lots_compiled.yaml)

```
raw/ (DOCX Sources)
  ├── 妈祖60签_中英对照_内部审阅件.docx
  └── 妈祖60签_中英对照_对外件.docx
         │
         ▼ (scripts/parse_and_merge_lots.py)
data/canonical/
  ├── lots/
  │    ├── lot_01.yaml ... lot_60.yaml  (Individual modular YAMLs for git diffing)
  ├── lots_compiled.json               (Compiled JSON for API & Database seeding)
  └── lots_compiled.yaml               (Compiled master YAML)
```

---

## 3. Data Schema & Field Visibility

### 3.1 Top-Level Entity Schema

```yaml
id: integer                     # 1 to 60
lot_number: integer             # 1 to 60
ganzhi:
  zh: string                    # e.g., "甲子"
  pinyin: string                # e.g., "Jia-zi"
title:
  en: string                    # e.g., "Bao Gong Calls Down Thunder"
  zh: string                    # e.g., "包公請雷驚仁宗"
hexagram:
  zh: string                    # e.g., "乾为天"
  name_and_structure_en: string # e.g., "Qian, Heaven (Heaven over Heaven)"
  binary_code: string           # e.g., "○○○○○○"
  shared_with_lot: integer|null # e.g., 18 or null
  disclosure:
    en: string                  # Hexagram distribution disclosure
    zh: string
element_and_direction:
  zh: string                    # e.g., "屬金利秋 宜其西方"
  en: string                    # e.g., "Metal — favours autumn; the west is auspicious"
story_group_summary:
  total_count: integer
  primary:
    zh: string
    en: string
  variants_en: list[string]
  variants_zh: list[string]
register:
  level: string                 # "favourable", "mixed", "guarded"
  source: string                # "curated"
  internal:                     # [VISIBILITY: INTERNAL]
    visibility: "internal"
    audience: "admin_and_internal_audit_only"
    source_note: string
    evidence: string
  external:                     # [VISIBILITY: PUBLIC]
    visibility: "public"
    audience: "all_users"
    source_note: string
    evidence: string
criteria:
  internal:                     # [VISIBILITY: INTERNAL]
    visibility: "internal"
    audience: "admin_and_internal_audit_only"
    description_zh: "照抄庙本解曰（庙方原文，供核验）"
    raw_temple_text: string     # Verbatim temple judgements for all 29 categories
  external:                     # [VISIBILITY: PUBLIC]
    visibility: "public"
    audience: "all_users"
    description_zh: "我方概括（合规发布用）"
    summary_zh: string          # Editorial summary
provenance:
  editorial_note: string|null
  textual_provenance: string|null
  reviewed_on: string           # e.g., "2026-10-06"
verse:
  classical_form: "七言絕句 (7-character quatrain)"
  english_style: "unrhymed cadence"
  lines:
    - line_number: integer
      zh: string
      en: string
keywords:
  favourable:
    en: list[string]
    zh: list[string]
  guarded:
    en: list[string]
    zh: list[string]
reading_notes:
  - term: string
    pinyin: string
    en: string
    zh: string
plain_meaning:
  en: string
  zh: string
question_gate:
  scope: string                 # "one_matter"
  rewritten_from:
    en: string
    zh: string
  rewritten_to:
    en: string
    zh: string
  rewrite_reason:
    code: string                # "closed_question", "none", etc.
    zh_explanation: string
  blocked: boolean
  disclosed_to_user: boolean
guidance:                       # 11 distinct inquiry slots
  relationships: { en: string, zh: string, compliance_tag: string|null }
  career:        { en: string, zh: string, compliance_tag: string|null }
  money:         { en: string, zh: string, compliance_tag: "not_financial_advice" }
  health:        { en: string, zh: string, compliance_tag: "not_medical_advice" }
  family_home:   { en: string, zh: string, compliance_tag: string|null }
  travel_moving: { en: string, zh: string, compliance_tag: string|null }
  sea_and_voyage:{ en: string, zh: string, compliance_tag: string|null }
  livelihood_and_seasons: { en: string, zh: string, compliance_tag: string|null }
  timing:        { en: string, zh: string, compliance_tag: "seasonal_windows_only" }
  what_to_avoid: { en: string, zh: string, compliance_tag: string|null }
  reassurance:   { en: string, zh: string, compliance_tag: string|null }
stories:
  - title: { zh: string, en: string }
    is_primary: boolean
    is_variant: boolean
    cross_reference_lot: integer|null # Non-null if story is detailed in another lot
    narrative: { zh: string, en: string } | null
    poem_connection: { zh: string, en: string }
```

---

## 4. API Visibility & Role-Based Access Control (RBAC)

The backend engine maintains the master canonical record with all fields. When client requests arrive, the API serialization middleware filters out sensitive internal fields based on the caller's verified authentication claims.

### 4.1 Filter Policy Matrix

| Field Path | Regular User / Guest (`role: guest` or `role: user`) | Admin User (`role: admin` or `role: internal_auditor`) |
| :--- | :---: | :---: |
| `id`, `lot_number`, `ganzhi`, `title` | ✅ Rendered | ✅ Rendered |
| `hexagram`, `element_and_direction` | ✅ Rendered | ✅ Rendered |
| `verse`, `keywords`, `reading_notes` | ✅ Rendered | ✅ Rendered |
| `plain_meaning`, `question_gate`, `guidance`, `stories` | ✅ Rendered | ✅ Rendered |
| `register.external` | ✅ Rendered | ✅ Rendered |
| `register.internal` | ❌ **Stripped / Omitted** | ✅ Rendered |
| `criteria.external` | ✅ Rendered | ✅ Rendered |
| `criteria.internal` | ❌ **Stripped / Omitted** | ✅ Rendered |
| `provenance.textual_provenance` | ✅ Rendered | ✅ Rendered |

### 4.2 Implementation Pattern (TypeScript / Node.js & Python)

```typescript
// Example: TypeScript API Serializer Filter
export function serializeLotResponse(lot: LotCanonicalRecord, userRole: string = 'guest') {
  const isAdmin = userRole === 'admin' || userRole === 'internal_auditor';

  // Deep clone to prevent mutating cache
  const response = JSON.parse(JSON.stringify(lot));

  if (!isAdmin) {
    // Strip internal review fields
    delete response.register.internal;
    delete response.criteria.internal;
  }

  return response;
}
```

```python
# Example: FastAPI / Python Serializer Filter
def serialize_lot(lot_data: dict, user_role: str = "guest") -> dict:
    is_admin = user_role in ("admin", "internal_auditor")
    output = dict(lot_data)
    
    if not is_admin:
        if "register" in output and "internal" in output["register"]:
            output["register"] = {k: v for k, v in output["register"].items() if k != "internal"}
        if "criteria" in output and "internal" in output["criteria"]:
            output["criteria"] = {k: v for k, v in output["criteria"].items() if k != "internal"}
            
    return output
```

---

## 5. Database Architecture Recommendation: SQLite-First

Given that the canonical lot corpus is immutable and exactly 60 records (~2 MB), PostgreSQL is excessively heavy and cost-inefficient. Instead, the project adopts an **Ultra-Lightweight SQLite-First Architecture**:

### 5.1 Architecture Overview
1. **`canonical_lots.db` (Embedded Read-Only SQLite)**:
   - Houses the 60 canonical lot records with pre-indexed columns and JSON1 support.
   - Bundled directly into Web (via in-memory cache/WASM), Mobile (via `expo-sqlite`), and Desktop (Tauri).
   - Guarantees instant sub-millisecond lookups and 100% offline functionality.
2. **`user_vault.db` (Server-Side / Edge SQLite via LibSQL or WAL-Mode)**:
   - Manages user accounts, encrypted birth profiles, generated reports, and CRD Art. 16(m) audit logs.
   - Zero DevOps complexity: single-file backups, low resource footprint (< 50MB RAM), and runs effortlessly on a micro-instance or edge platform (Turso / Cloudflare D1).

### 5.2 Canonical Lots Table Schema (SQLite)
```sql
CREATE TABLE canonical_lots (
    id INTEGER PRIMARY KEY,
    lot_number INTEGER NOT NULL UNIQUE CHECK (lot_number BETWEEN 1 AND 60),
    ganzhi_zh TEXT NOT NULL,
    ganzhi_pinyin TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_zh TEXT NOT NULL,
    element TEXT NOT NULL,
    register_level TEXT NOT NULL,
    payload_json TEXT NOT NULL  -- Complete merged canonical record
);

CREATE INDEX idx_lots_number ON canonical_lots (lot_number);
CREATE INDEX idx_lots_ganzhi ON canonical_lots (ganzhi_zh);
CREATE INDEX idx_lots_element ON canonical_lots (element);
CREATE INDEX idx_lots_register_level ON canonical_lots (register_level);
```

### 5.3 User Vault & Transactions Table Schema (SQLite)
```sql
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    birth_date TEXT,            -- YYYY-MM-DD
    birth_time TEXT,            -- HH:MM (or NULL if unknown)
    birth_city TEXT,
    true_solar_offset_min INT,  -- Longitude-adjusted minutes
    bazi_json TEXT,             -- Calculated Four Pillars
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reading_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES user_profiles(id),
    lot_number INT NOT NULL,
    inquiry_domain TEXT NOT NULL,
    reframed_question TEXT,
    crd_16m_waiver_agreed BOOLEAN NOT NULL DEFAULT 1,
    crd_waiver_timestamp DATETIME NOT NULL,
    crd_waiver_ip_hash TEXT NOT NULL,
    amount_cents INT NOT NULL,
    currency TEXT DEFAULT 'USD',
    stripe_payment_intent_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Planning Navigation (Relative Links)
- [00. Executive Summary](./00_EXECUTIVE_SUMMARY.md)
- [01. Product Requirements Document](./01_PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [02. Ten-Step User Journey Specification](./02_TEN_STEP_USER_JOURNEY_SPEC.md)
- [03. Personalization Engine Specification](./03_PERSONALIZATION_ENGINE_SPEC.md)
- [04. Domain Mapping & Question Gate Specification](./04_DOMAIN_MAPPING_AND_QUESTION_GATE.md)
- [05. Technical Architecture & Multi-Platform Strategy](./05_TECHNICAL_ARCHITECTURE_AND_MULTI_PLATFORM.md)
- [06. Compliance, Legal & Payment Specifications](./06_COMPLIANCE_LEGAL_AND_PAYMENTS.md)
- [07. Project Roadmap & Milestones](./07_PROJECT_ROADMAP_AND_MILESTONES.md)
- [08. Canonical Data Schema & API Visibility Specification](./08_CANONICAL_DATA_SCHEMA_AND_API_VISIBILITY.md)
- [Root README](../../README.md)
