# KhoUI - Premium Website Template & Theme Marketplace

> ![Status](https://img.shields.io/badge/Status-In%20Progress-yellow?style=flat-square&labelColor=333) This project is actively being built as a personal learning journey to explore and approach modern web technologies.

KhoUI is a high-performance, visually stunning marketplace specialized in providing premium website templates, UI kits, and digital themes. Built with **Next.js 15**, **Tailwind CSS v4**, **GSAP**, **Supabase**, and **TypeScript**, it delivers a state-of-the-art editorial design experience.

---

---

## 🚀 Features

- **Premium Template Storefront**: Beautifully designed digital product listings with Framer Motion layout morphing and GSAP scroll interactions.
- **Multi-Language Support**: Fully localized in English and Vietnamese, powered by a hybrid architecture of static local dictionaries and dynamic database translations.
- **Digital Product Delivery**: Seamless licensing, purchasing, and automatic download fulfillment for digital assets and source codes.
- **Secure Authentication**: User registration and login powered by Supabase Auth.
- **Developer-Friendly Admin Suite**: Comprehensive dashboard for managing digital products, licenses, dynamic translations, and sales analytics.
- **Clean Architecture**: Strictly enforced 4-layer architecture (Domain, Application, Infrastructure, Presentation) for maximum maintainability.
- **Glassmorphism & Micro-animations**: Premium UI/UX with smooth transitions and modern aesthetics.

---

## 🛠️ Tech Stack

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=flat-square&logo=zustand&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

### Frontend
- **[Next.js 15](https://nextjs.org/)** (App Router) — React framework with SSR & SSG
- **[React 19](https://react.dev/)** — UI library
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** — Animation library
- **[GSAP](https://gsap.com/)** — Professional-grade scroll animations
- **[Zustand](https://github.com/pmndrs/zustand)** — Lightweight state management
- **[Zod](https://zod.dev/)** — Schema validation
- **[Lucide React](https://lucide.dev/)** — Icon library

### Backend & Infrastructure
- **[Supabase](https://supabase.com/)** *(via MCP Supabase)* — PostgreSQL database, authentication, and file storage
- **TypeScript** — Type-safe development across the entire stack

### Development Tools

![Antigravity](https://img.shields.io/badge/Antigravity_IDE-1a1a2e?style=flat-square&logo=spaceship&logoColor=white)
![MCP Stitch](https://img.shields.io/badge/MCP_Stitch-FF6B6B?style=flat-square&logo=googlegemini&logoColor=white)
![MCP Supabase](https://img.shields.io/badge/MCP_Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)

- **[Antigravity IDE](https://antigravity.dev/)** — AI-powered IDE used for vibe-coding this project
- **[MCP Stitch](https://mcp.so/server/stitch/google)** — AI tool for generating and iterating on UI/UX designs
- **[MCP Supabase](https://supabase.com/docs/guides/getting-started/mcp)** — MCP server for managing Supabase database, auth, and storage directly from the IDE

---

## 📦 Project Structure

```
KhoUI/
├── src/
│   ├── app/                # Next.js App Router (Pages & Layouts)
│   ├── application/        # Business Logic & Use Cases (Application Layer)
│   ├── domain/             # Entities & Models (Core Domain Layer)
│   ├── infrastructure/     # Data Repositories & API Clients (Supabase)
│   ├── presentation/       # Shared Components & UI Library
│   ├── i18n/               # Multi-Language Dictionaries & Fallbacks
│   └── lib/                # Utility Functions
├── public/                 # Static Assets (Images, Icons)
└── ...configs              # TypeScript, ESLint, Next.js configs
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn
- A [Supabase](https://supabase.com/) Project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NhinhoD/LuminaShop.git
   cd KhoUI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**

   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
