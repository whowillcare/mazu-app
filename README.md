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
   **Master Modules & Functions Roadmap (Living Implementation Matrix)**: Comprehensive breakdown of all 12 platform subsystems, tracking implemented features (`[x]`), active progress (`[/]`), and future backlog (`[ ]`).

9. **[08_CANONICAL_DATA_SCHEMA_AND_API_VISIBILITY.md](docs/planning/08_CANONICAL_DATA_SCHEMA_AND_API_VISIBILITY.md)**
   Canonical asset specification comparing internal vs. external manuscripts, merged data schema, RBAC visibility filtering, and SQLite/LibSQL database design.

10. **[09_VISUAL_DESIGN_SYSTEM_AND_THEMES.md](docs/planning/09_VISUAL_DESIGN_SYSTEM_AND_THEMES.md)**
   Aesthetic theme synthesis (Golden Thread + CHANI + Mazu Temple Heritage), color tokens, typography, motion design, and sample card artworks.

11. **[10_UI_PAGE_MOCKUPS_AND_FUNCTIONAL_FLOWS.md](docs/planning/10_UI_PAGE_MOCKUPS_AND_FUNCTIONAL_FLOWS.md)**
   High-fidelity ASCII wireframes and functional state layouts for all 10 user journey steps.

12. **[11_LOT_CARD_ARTWORK_CATALOG.md](docs/planning/11_LOT_CARD_ARTWORK_CATALOG.md)**
   Master visual catalog containing completed cards (Lots 1–57), artwork gallery, and full production prompts for all 60 lots.

13. **[12_CARD_COMPONENT_ARCHITECTURE_AND_REFACTORING.md](docs/planning/12_CARD_COMPONENT_ARCHITECTURE_AND_REFACTORING.md)**
   Layered card production architecture, authentic 4-character Qin Seal (秦小篆) formula, automated compositor pipeline, and multi-platform SVG/React component implementation.

---

## 🛠️ Admin CLI & Management Commands

The platform features a protected administrative studio and stealth URL directive system for managing canon lot data, astrological Life-Book rules, transit matrices, and system credentials.

### CLI Management Script (`scripts/manage_admin.ts`)

Execute admin commands using `npm run admin -- <command>` or `npx tsx scripts/manage_admin.ts <command>`:

| Command | Syntax | Description |
| :--- | :--- | :--- |
| **Add Admin** | `npm run admin -- add <username> <password>` | Creates a new admin account with a salted scrypt hash in the SQLite database |
| **Change Password** | `npm run admin -- passwd <username> <new_password>` | Updates the password for an existing admin user |
| **List Admins** | `npm run admin -- list` | Displays all registered admin users and the active URL directive |
| **Delete Admin** | `npm run admin -- del <username>` | Deletes an admin user account (safety guard prevents deleting the sole admin) |
| **Get URL Directive** | `npm run admin -- get-path` | Displays the current secret Admin URL location directive (default: `/mod`) |
| **Set URL Directive** | `npm run admin -- set-path <url_path>` | Updates the secret Admin URL directive (e.g., `/portal`, `/console`, `/mod`) |
| **Get Session TTL** | `npm run admin -- get-ttl` | Displays the current admin session cookie expiration TTL (default: `4` hours) |
| **Set Session TTL** | `npm run admin -- set-ttl <hours>` | Updates the admin session cookie expiration duration in hours (e.g., `2`, `4`, `12`) |

#### CLI Usage Examples:
```bash
# Add a new administrator
npm run admin -- add curator StrongPassw0rd!

# Check current secret portal URL
npm run admin -- get-path
# Output:
# 📍 Current Admin URL Directive: /mod
# 🔗 Portal URL: http://localhost:3000/mod

# Change the secret route directive
npm run admin -- set-path /portal
# Output:
# ✅ Admin URL Directive updated to: /portal
# 🔗 Portal URL: http://localhost:3000/portal

# Adjust session expiration duration (e.g., 2 hours)
npm run admin -- set-ttl 2

# List all active admin accounts
npm run admin -- list
```

---

### Configuration Manager CLI (`scripts/manage_config.ts`)

Manage platform credentials, AI inference endpoints, Stripe keys, and system directives directly from the command line with live hot-reloading:

Execute config commands using `npm run config -- <command> [options]` or `npx tsx scripts/manage_config.ts <command> [options]`:

| Command | Syntax | Description |
| :--- | :--- | :--- |
| **List Settings** | `npm run config -- list` | Lists all configuration items with category, masked secrets, and update dates |
| **View Secrets** | `npm run config -- list --show-secrets` | Displays full unmasked secret keys, API tokens, and passwords |
| **Filter Category** | `npm run config -- list -c <category>` | Filters settings by category (`ai`, `payment`, `system`) |
| **Get Setting** | `npm run config -- get <KEY> [--show-secrets]` | Displays full metadata, values, and description for a specific key |
| **Add / Modify** | `npm run config -- set <KEY> <VALUE> [options]` | Sets a configuration value, updates the persistent vault, and triggers live hot-reload |
| **Remove Setting** | `npm run config -- del <KEY>` | Removes a configuration setting from persistent storage and triggers live hot-reload |
| **Hot Reload** | `npm run config -- reload` | Signals the running application to reload configurations in memory immediately |
| **Reset Defaults** | `npm run config -- reset --force` | Restores all settings to system factory defaults |

#### CLI Options:
- `--show-secrets`, `-s`: Unmask secret values in console output
- `--category`, `-c <cat>`: Target category (`ai`, `payment`, `system`)
- `--secret` / `--no-secret`: Force setting encryption/masking state
- `--desc`, `-d <text>`: Set descriptive annotation for setting
- `--url <url>`: Target running server URL for live reload notification (default: `http://localhost:3000`)
- `--no-reload`: Skip triggering live HTTP reload on the running app
- `--json`: Output results formatted as JSON

#### Configuration CLI Usage Examples:
```bash
# List all current configuration settings
npm run config -- list

# List with secrets revealed
npm run config -- list --show-secrets

# Configure AI LLM endpoint and API secret token
npm run config -- set AI_API_KEY "sk-ant-live-token-xyz" --secret -c ai -d "Production AI gateway key"
npm run config -- set AI_MODEL_NAME "deepseek-chat" -c ai
npm run config -- set AI_API_ENDPOINT "https://api.deepseek.com/v1" -c ai

# Update system directives
npm run config -- set ADMIN_URL_PATH "/portal" -c system
npm run config -- set DEFAULT_CURRENCY "USD" -c system

# Inspect a specific setting
npm run config -- get AI_API_KEY --show-secrets

# Delete an obsolete custom setting
npm run config -- del CUSTOM_TEMP_FLAG

# Trigger live reload across the running application
npm run config -- reload
# Output:
# 🔄 Triggering live configuration reload...
# ✅ Local configuration cache reloaded (v4, 11 items).
# ⚡ Live Reload: Running app at http://localhost:3000 refreshed lively! (Config v4, 11 keys active)
# 🎉 Live application hot-reload confirmed successfully!
```

> **⚡ Live Hot-Reload Guarantee**: Changes applied via `npm run config -- set` or `npm run config -- del` are automatically broadcast to the running Next.js instance via `/api/config/reload` and file system watchers, triggering live Server-Sent Events (SSE) updates across active admin dashboards without restarting the server or dropping connections.

---

## 🔐 Protected Admin Studio

- **Stealth Access Only**: The administrative area has no visible links or buttons anywhere in the public seeker UI.
- **Manual URL Navigation**: Only accessible by manually entering the configured directive path in the browser address bar (e.g., `http://localhost:3000/mod`). Any other path automatically triggers a 404 response.
- **Session Authentication & Expiration**:
  - **Unauthenticated / Expired**: Visiting the admin URL displays the visual web login page directly with zero flash or redirection delay.
  - **Authenticated**: When a valid HTTP-only session cookie (`mazu_admin_session`) is present, the server renders the admin dashboard directly without prompting for credentials.
  - **Configurable TTL**: Admin sessions automatically expire after the configured duration (default: 4 hours, configurable via `ADMIN_SESSION_TTL_HOURS` or CLI `set-ttl`), whereupon the cookie is invalidated and the login page reappears.
- **Studio Capabilities**:
  1. **60 Lots Canon Manager**: View and edit quatrain poems (詩曰), English translations, historical protagonists, and all 13 canonical domain guidance entries. Custom modifications are persisted to [`storage/lots_custom.json`](storage/lots_custom.json) while keeping base canonical seed assets safe.
  2. **Life-Book & Transit Logic Studio**: Configure narrative focus, archetypal insights, and action guidelines for all 9 canonical chapters and customize the 24 Solar Terms transit matrices.
  3. **System Directives & Configuration**: Live AI endpoint tokens (FreeLLMAPI, DeepSeek, OpenAI, Ollama), connection testing, Stripe credentials, and live hot-reloading.
  4. **Admin Accounts**: Create, manage, and inspect administrators.

---

## 💾 Data Persistence Architecture

The platform enforces a strict separation between **Readonly Canonical Data** and **Persistent User & Custom Data**:

| Category | Storage Path | Retention Strategy | Contents |
| :--- | :--- | :--- | :--- |
| **Readonly Canon** | `data/canonical/` (`/app/data/canonical`) | Shipped in Docker Image / Git | 60 lots classical quatrains, unrhymed English translations, historical story protagonists, 13 canonical domains, polysemy notes. **Never shadowed or lost by volume mounts.** |
| **Persistent User Data** | `storage/` (`/app/storage`) | Docker Volume (`mazu_storage`) | SQLite database (`user_vault.db`) storing user draws, entitlements, subscriptions, CRD compliance audit logs, admin users, and active sessions. |
| **Persistent Custom Data** | `storage/` (`/app/storage`) | Docker Volume (`mazu_storage`) | Dynamic runtime configs (`app_config.json`), custom Life-Book rules (`astrology_rules.json`), and custom lot edits (`lots_custom.json`). |

### Docker Volume Mounting:
```bash
# Docker Compose (Local / Dev)
docker compose -f docker-compose.local.yml up -d

# Manual Docker Run with host directory bind mount:
docker run -d -p 3000:3000 -v $(pwd)/storage:/app/storage mazu-sixty-lots:latest
```
> **Volume Safety Guarantee**: Mounting an empty volume to `/app/storage` will **never** crash or wipe out the 60 lots canonical dataset. The system self-initializes the database and configs while reading the immutable canonical oracle dataset from the container image.

---

*Current Implementation Status: Core Web Platform (99% complete), 60/60 Standardized Cards, Question Gate, BaZi Ephemeris Engine, 9-Chapter Life Book, Leg 3 Subscription Hub, Protected Admin Studio, and Decoupled Persistent Storage are fully operational.*
