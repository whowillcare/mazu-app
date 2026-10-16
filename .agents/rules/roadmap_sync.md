# Roadmap & Scope Synchronization Rule

## Mandatory Policy: Continuous Roadmap & Scope Alignment

Whenever any of the following events occur during development:
1. **Scope Expansion or Modification**: A new feature, sub-module, architectural requirement, or user story is introduced, altered, or deprecated.
2. **Implementation Progress**: A function, module, API endpoint, or UI component transitions between states (`[ ] Pending` -> `[/] In Progress` -> `[x] Implemented & Verified`).
3. **Execution Policy Changes**: A task or batch process is cancelled, scheduled, placed on hold, or deprioritized.
4. **Architectural Adjustments**: Changes to engines, data schemas, dependencies, or platforms.

The agent **MUST IMMEDIATELY UPDATE** the living roadmap document:
[`docs/planning/07_PROJECT_ROADMAP_AND_MILESTONES.md`](file:///home/sam/Projects/yaojun/lot/docs/planning/07_PROJECT_ROADMAP_AND_MILESTONES.md)

### Verification Requirement:
- Ensure the **Executive Implementation Dashboard** percentage numbers and status flags accurately match the active codebase state.
- Ensure the corresponding items in the **Granular Modules & Functions Matrix** are updated with exact file paths and implementation notes.
