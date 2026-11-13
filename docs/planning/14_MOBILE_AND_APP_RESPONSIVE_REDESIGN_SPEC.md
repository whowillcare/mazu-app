# 14. Mobile-First & App-Style Layout Redesign Specification (行動裝置與跨端版面架構重構規範)

> **Status**: Active Architectural Specification & Implementation Blueprint  
> **Module**: Module 15 — Mobile-First Responsive Redesign, Ergonomic Bottom-Sheets & App Shell Architecture  
> **Related Specs**: [`02_TEN_STEP_USER_JOURNEY_SPEC.md`](./02_TEN_STEP_USER_JOURNEY_SPEC.md), [`07_PROJECT_ROADMAP_AND_MILESTONES.md`](./07_PROJECT_ROADMAP_AND_MILESTONES.md), [`09_VISUAL_DESIGN_SYSTEM_AND_THEMES.md`](./09_VISUAL_DESIGN_SYSTEM_AND_THEMES.md)

---

## 1. Problem Statement & Objectives

### The Problem
The current frontend (`src/app/page.tsx` and embedded components) was built with desktop-first assumptions:
1. **Vertical Information Overload**: Dense paragraphs, large glass containers (`padding: 30px`), and monolithic stacking force mobile users to scroll through screens of text and forms.
2. **Crowded Micro-Elements**: Multi-column grids (such as 13-domain tiles, four-pillar summaries, pricing cards, and master selector lists) squeeze together on viewports below 640px, causing visual fatigue and text wrapping issues.
3. **Ergonomic Inefficiencies in the Mobile Thumb Zone**: Key call-to-actions (e.g. Draw Lot, Unlock Report, Send Inquiry) are trapped at the bottom of long sections without sticky accessibility.
4. **Master Chat Experience**: The AI Masters consultation system was rendered directly in the flow of the paywall section rather than as an accessible, bottom-sheet drawer or focused mobile dialog.

### Objectives
1. **Consistent Sovereign Metaphysical Theme**: Maintain the sacred `#070B11` canvas, `#D4AF37` imperial gold accents, `#C23B22` cinnabar seals, and celestial atmosphere across all viewports.
2. **Adaptive Layouts**:
   - **Desktop (>= 1024px)**: Elegant expansive 2-column or 3-column architectural layout with rich spatial breathing room.
   - **Tablet (768px - 1023px)**: Responsive 2-column layout with compact headers and balanced touch targets.
   - **Mobile Web & App (< 768px)**: Native app ergonomics featuring mobile-first segmented tabs, collapsible accordion sections, bottom sheet drawers for Master Chat, and an optional bottom navigation bar.

---

## 2. Multi-Platform Layout Adaptation Architecture

| UI Component | Desktop (>= 1024px) | Tablet (768px - 1023px) | Mobile Web / App (< 768px) |
| :--- | :--- | :--- | :--- |
| **Top App Bar** | Full brand seal, title, language toggle, preferences modal trigger, admin portal icon | Compact title + action icons | Clean 54px compact app bar + sticky bottom tab bar with safe-area insets |
| **Landing Hero** | Wide hero + direct question textarea + 3 core pillars displayed horizontally | Stacked hero + 2-col cards | Focused question-first card; 3 pillars moved into expandable pill drawer |
| **13-Domain Selector** | 4-column rich tiles with full descriptions and iconography | 3-column tiles | 2-column compact touch chips (`min-height: 48px`, no horizontal clipping) |
| **Lot Reading Screen** | Split layout: Left 320px SVG card sticky preview, Right full poem & stories | Stacked layout | **Segmented Control**: `[ 籤詩 Quatrain ]` / `[ 典故 Story ]` / `[ 解曰 Guidance ]` with quick card view toggle |
| **BaZi Rectification** | Side-by-side exact time and rough slot cards with city autocomplete | Responsive 2-column grid | Step-by-step accordion card with large 48px radio tap targets for rough slots |
| **Paywall & Pricing** | 2-column comparison pricing cards | 2-column cards | Compact pricing toggle cards with prominent single/subscription highlights |
| **AI Masters Chat** | Embedded full-width glass panel or side drawer | Embedded drawer | **App-Style Bottom Sheet Drawer**: Slide-up modal with drag handle, safe-area padding, sticky input, and quick prompt chips |

---

## 3. Mobile Ergonomics & Technical Standards

1. **Touch Target Size**: Minimum 44px x 44px (iOS HIG) and 48px x 48px (Material Guidelines) for all primary buttons, chips, and toggles.
2. **Safe Area Insets**: Support for modern notched devices using `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
3. **Viewport & Typography**:
   - Dynamic fluid font sizing using CSS `clamp()` without horizontal overflow.
   - Elimination of double-scrolling bugs by locking background scroll during open bottom-sheets.
4. **App Feel & PWA Support**:
   - Viewport meta set to `width=device-width, initial-scale=1, viewport-fit=cover`.
   - Standalone browser-capable metadata and theme color `#070B11`.

