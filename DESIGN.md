# KhoUI — Design System Specification

## 1. Brand Identity & Vision
**KhoUI** is Vietnam's premier curated marketplace for high-fidelity, production-grade website templates, components, and full-stack codebases.
- **Design Persona:** Editorial Tech, Crisp, High-Contrast, Developer-Centric, Sophisticated.
- **Inspirations:** Linear, Vercel, Stripe, Raycast, Apple Developer.
- **Design Dials:**
  - `DESIGN_VARIANCE: 7` (Modern asymmetric layouts, distinct visual hierarchy)
  - `MOTION_INTENSITY: 5` (Spring-driven micro-interactions, smooth hover lifts, scroll reveals)
  - `VISUAL_DENSITY: 5` (Balanced breathing room with rich technical information density)

---

## 2. Color System
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `primary` | `#0051d5` | Electric Royal Blue — Core brand action, active states, key focus |
| `primary-dark` | `#003ea8` | Hover state for primary buttons |
| `primary-light` | `#e8f0fe` | Soft badge backgrounds, subtle active pills |
| `accent` | `#4f46e5` | Electric Indigo — Secondary highlights, gradients |
| `secondary` | `#0ea5e9` | Sky Cyan — Technical badges, live indicators |
| `dark` | `#090d16` | Deep Obsidian — Headings, high-contrast badges, dark accents |
| `dark-surface` | `#111827` | Dark cards, topbar, code sandbox containers |
| `background` | `#ffffff` | Pure white canvas |
| `background-subtle` | `#f8fafc` | Section backgrounds (Slate-50) |
| `surface` | `#ffffff` | Card surfaces |
| `border` | `#e2e8f0` | Crisp structural borders (Slate-200) |
| `border-subtle` | `#f1f5f9` | Inner dividers (Slate-100) |
| `text-primary` | `#090d16` | High-contrast body/heading text |
| `text-muted` | `#64748b` | Descriptive captions, subtitles (Slate-500) |
| `success` | `#10b981` | Instant download status, verified purchases |
| `error` | `#ef4444` | Form errors, failed transaction states |

---

## 3. Typography Hierarchy
- **Font Family:** `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **Monospace:** `ui-monospace`, `SFMono-Regular`, `Menlo`, `monospace`

| Level | Size | Weight | Tracking | Leading |
| :--- | :--- | :--- | :--- | :--- |
| Display Hero | `clamp(2.5rem, 5vw, 4rem)` | ExtraBold (800) | `-0.035em` | `1.08` |
| Section H2 | `1.875rem` - `2.25rem` | Bold (700) | `-0.025em` | `1.2` |
| Card Title H3 | `1.125rem` - `1.25rem` | SemiBold (600) | `-0.015em` | `1.3` |
| Body Text | `0.875rem` - `1rem` | Regular (400) / Medium (500) | `normal` | `1.6` |
| Badge / Eyebrow | `0.6875rem` (11px) | ExtraBold (800) | `+0.06em` uppercase | `1` |
| Micro Caption | `0.75rem` (12px) | Medium (500) | `normal` | `1.4` |

---

## 4. Spacing & Spatial Rhythm
- **Page Container:** `max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12`
- **Section Padding:** `py-20` to `py-28` for major sections
- **Card Spacing:** `p-6` to `p-8`
- **Gap Scale:** `gap-4`, `gap-6`, `gap-8`, `gap-12`
- **Corner Radii:**
  - Badges/Pills: `rounded-full`
  - Inputs/Buttons: `rounded-xl`
  - Cards & Panels: `rounded-2xl` or `rounded-3xl`

---

## 5. Absolute Anti-Patterns (Banned AI Slop)
1. **NO F&B Red/Orange/Cream leftover tokens** (`#e8281a`, `#f6a623`, `#fff8f0`, `Dancing Script`).
2. **NO Card-Inside-Card Clutter**: Do not wrap small pieces of text in separate bordered cards inside an already bordered card.
3. **NO Fake Dropdown Affordances**: Never use `<ChevronDown />` on a direct navigation link.
4. **NO Hardcoded External Assets**: Replace all old demo asset links with dynamic or valid project mockups.
5. **NO Unstyled Gray Text on Colored Backgrounds**: Ensure all text passes WCAG AA contrast ratio ($\ge 4.5:1$).
6. **NO Bounce / Elastic Easing**: Use cubic-bezier `(0.16, 1, 0.3, 1)` or `power3.out` for silky-smooth motion.
