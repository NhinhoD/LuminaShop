# KhoUI — Design System Specification

> **Related Specifications:**
> - Architecture, Coding & Harness Rules: [`AGENTS.md`](AGENTS.md)
> - Product Truth & Key Routes: [`PRODUCT.md`](PRODUCT.md)

---
**KhoUI** is Vietnam's premier curated marketplace for high-fidelity, production-grade website templates, components, and full-stack codebases.
- **Design Persona:** Editorial Tech, Crisp, High-Contrast, Developer-Centric, Sophisticated.
- **Inspirations:** Linear, Vercel, Stripe, Raycast, Apple Developer.
- **Design Dials:**
  - `DESIGN_VARIANCE: 7` (Modern asymmetric layouts, distinct visual hierarchy)
  - `MOTION_INTENSITY: 5` (Spring-driven micro-interactions, smooth hover lifts, scroll reveals)
  - `VISUAL_DENSITY: 5` (Balanced breathing room with rich technical information density)

---

## 2. Color System (Spec Sheet / Danh mục bản vẽ)

The storefront was rebuilt on an editorial "SPEC SHEET" palette. Tokens live in `src/app/globals.css` and are exposed as Tailwind utilities.

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `background` (paper) | `#F2F0EA` | Page canvas — warm paper |
| `background-subtle` | `#E9E6DD` | Recessed panels, empty states |
| `surface` | `#FBFAF6` | Card/panel surface |
| `border` (line) | `#D6D3C9` | Hairline grid rules |
| `dark` (ink) | `#0B0B0F` | Headings, high-contrast text, primary buttons |
| `primary` (blue, synced hue with logo) | `#2563EB` | Brand action, active links, focus |
| `primary-dark` | `#1E40AF` | Hover state for primary buttons |
| `accent` (vermilion) | `#FF4A1C` | Eyebrows, live indicators, error-ish highlights |
| `success` | `#127A52` | Verified/paid states, free-fulfillment |
| `error` | `#B42318` | Form errors, failed/cancelled states |
| `text-muted` (dark/40–55) | `#0B0B0F` @ 40–55% | Secondary captions |

Rules:
- Hairline borders only (`border` token); no soft shadows, no rounded corners (square controls).
- Color is used sparingly — ink on paper, cobalt for emphasis, vermilion for the single accent dot.

---

## 3. Typography Hierarchy
- **Display (headings):** `Archivo` (weights 700–900), tracking `-0.04em` to `-0.06em`, class `.display` / `.font-display`.
- **Body:** `Be Vietnam Pro` (400/500/600), tracking tight, class `.font-sans`.
- **Meta (mono):** `IBM Plex Mono` (400/500/600), class `.mono-meta` — used for section codes, eyebrows, metadata, badges.

| Level | Size | Weight | Tracking | Leading |
| :--- | :--- | :--- | :--- | :--- |
| Display Hero | `clamp(2.85rem, 7.2vw, 6.4rem)` | ExtraBold (800) | `-0.06em` | `0.95` |
| Section H1 | `clamp(1.7rem, 3.6vw, 2.8rem)` | Bold (700) | `-0.04em` | `1.05` |
| Card Title H3 | `0.95rem` – `1.1rem` | SemiBold (600) | `-0.02em` | `1.25` |
| Body Text | `0.8125rem` – `0.875rem` (13–14px) | Regular (400) / Medium (500) | `normal` | `1.6` |
| Badge / Eyebrow | `0.625rem` – `0.6875rem` (10–11px) | SemiBold (600) | `+0.08em`–`+0.12em` uppercase | `1` |
| Micro Caption (mono) | `0.46875rem` – `0.5625rem` (7.5–9px) | Medium (500) | `+0.12em` uppercase | `1` |

---

## 4. Spacing & Spatial Rhythm
- **Page Container:** `max-w-[1440px] mx-auto px-5 sm:px-8` (storefront); `px-5 sm:px-8 sm:py-14` vertical rhythm.
- **Section Padding:** `py-10` to `py-16` for major sections.
- **Card Spacing:** `p-4` to `p-6`.
- **Gap Scale:** `gap-2`, `gap-4`, `gap-6`, `gap-8`.
- **Corner Radii:** **none** — square controls, hairline borders only (Spec Sheet).
- **Borders:** `border border-border` (1px hairline); active rows use `border-l-2 border-l-primary` or accent.

## 5. Absolute Anti-Patterns (Banned AI Slop)
1. **NO rounded corners** — square controls only (`rounded-*` banned in storefront).
2. **NO soft shadows** — hairline borders only.
3. **NO gradients / glassmorphism** — flat paper/ink/cobalt.
4. **NO hardcoded UI strings** — all copy via `useI18n()` + dictionaries.
5. **NO `window.addEventListener("scroll")`** — use GSAP ScrollTrigger.
6. **NO `any` types**, no `console.log` in production.
7. **NO unconfigured remote images** — sample templates use `imageUrl: undefined` (PREVIEW panel).
8. **NO new dependencies** — GSAP/Framer already present; use `useEffect` + `gsap.context()`.
