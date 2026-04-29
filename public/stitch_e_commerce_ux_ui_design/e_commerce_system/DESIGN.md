---
name: E-Commerce System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h2:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The brand personality of this design system is defined by a balance of authority and accessibility. It aims to evoke a sense of premium reliability and effortless discovery, catering to a discerning audience that values clarity and efficiency. 

The aesthetic follows a **Modern / Corporate** style with heavy influences from **Minimalism**. By prioritizing high-quality imagery and generous whitespace, the interface recedes into the background, allowing products to take center stage. The visual language is intentional and architectural, utilizing a structured grid and a sophisticated color palette to build user confidence throughout the shopping journey.

## Colors

The palette is anchored by a deep navy primary color, providing a sense of stability and institutional trust. For the primary accent, a vibrant electric blue is used to draw attention to interactive elements and directional cues.

*   **Primary:** Used for text, navigation bars, and grounding elements.
*   **Secondary (Accent):** Reserved exclusively for primary calls-to-action (CTAs), focus states, and links.
*   **Tertiary (Success):** An emerald green used sparingly for price drops, stock availability, or successful transaction feedback.
*   **Neutral:** A range of slate and cool grays used for secondary text, borders, and subtle background partitions.

Backgrounds should remain primarily white (`#FFFFFF`) or very light off-white (`#F8FAFC`) to maximize the impact of product photography.

## Typography

This design system utilizes **Manrope** for all typographic needs. Chosen for its geometric modernism and refined proportions, it ensures high readability across various screen densities.

Headlines should use tighter letter-spacing and heavier weights to create a strong visual hierarchy. Body copy utilizes a generous line height (1.6) to prevent fatigue during long-form reading, such as product descriptions or technical specifications. Labels and utility text use slightly increased letter spacing and uppercase styling to distinguish them from standard prose.

## Layout & Spacing

The layout is built on a **12-column fluid grid** with a maximum container width of 1280px. A strict 8px spacing scale governs all spatial relationships, ensuring consistency across components.

*   **Margins:** Desktop screens use 48px or 80px side margins to create "breathing room."
*   **Gutters:** A standard 24px gutter is used between grid columns.
*   **Vertical Rhythm:** Use larger spacing (`xl`) between major sections (e.g., Hero to Featured Products) and tighter spacing (`md` or `sm`) between elements within a single component.
*   **Whitespace:** High-end e-commerce requires more whitespace than typical SaaS. Avoid cluttering the viewport; allow elements to stand alone.

## Elevation & Depth

To maintain a clean and modern appearance, depth is conveyed through **Tonal Layers** and **Ambient Shadows**.

1.  **Level 0 (Base):** The page background, used for the overall canvas.
2.  **Level 1 (Surface):** Subtle cards or sections using a white background and a very soft, diffused shadow (15% opacity, 20px blur) to appear slightly lifted.
3.  **Level 2 (Interaction):** Hover states for product cards or buttons. Shadows become slightly deeper and more focused to indicate interactivity.
4.  **Overlays:** Modals and dropdown menus use a semi-transparent backdrop blur (12px) to maintain context while focusing user attention.

Avoid heavy black shadows; instead, use a slight tint of the Primary color in the shadow to keep the UI looking sophisticated and cohesive.

## Shapes

The design system employs a **Rounded** shape language to foster a friendly yet professional atmosphere. 

*   **Standard Elements:** Buttons, input fields, and smaller cards use a base radius of 0.5rem (8px).
*   **Large Containers:** Product cards and section containers use a "rounded-lg" radius of 1rem (16px) to emphasize their role as distinct content blocks.
*   **Interactive Indicators:** Small badges or chips may use a full pill shape for high contrast against rectangular content.

Borders should be kept thin (1px) and use low-contrast neutral tones to define boundaries without adding visual noise.

## Components

### Buttons
Primary buttons use a solid Electric Blue background with white text. Secondary buttons use a transparent background with a 1px border in the Primary Navy. Ensure a minimum height of 48px for touch-friendliness.

### Product Cards
The centerpiece of the e-commerce experience. Cards should have a subtle 1px border or a soft ambient shadow. Product titles should be prominent (h3), with prices styled in a bold body-lg. High-quality imagery must fill the top 60-70% of the card area.

### Input Fields
Inputs feature a light gray border that transitions to Electric Blue on focus. Labels should always be visible above the input, using the `label-sm` style.

### Chips & Badges
Used for categories or "New In" labels. These should have a light background tint of the accent color and bold text to catch the eye without being distracting.

### Product Gallery
Utilize a large hero image area with a thumbnail rail below. Transitions between images should be smooth and subtle. Implement a "Zoom on Hover" feature for high-quality texture inspection.

### Shopping Cart / Mini-Cart
A slide-out drawer (Level 4 Elevation) that uses a blurred backdrop. It should clearly summarize the selection with high-contrast text and a prominent "Checkout" button.