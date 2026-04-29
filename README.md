# LuminaShop - Modern E-Commerce Platform

> ![Status](https://img.shields.io/badge/Status-In%20Progress-yellow?style=flat-square&labelColor=333) This project is actively being built as a personal learning journey to explore and approach modern web technologies.

---

## 📸 UI Showcase

> _Preview of the LuminaShop interface across different pages and viewports._

### 🏠 Homepage & Storefront
| Desktop | 
|---------|
| ![Homepage Desktop](https://raw.githubusercontent.com/NhinhoD/LuminaShop/main/public/stitch_e_commerce_ux_ui_design/homepage/screen.png))

### 🛍️ Product Listing & Detail
| Product Listing | Product Detail |
|----------------|----------------|
| ![Product Listing](https://raw.githubusercontent.com/NhinhoD/LuminaShop/main/public/stitch_e_commerce_ux_ui_design/product_listing/screen.png)) | ![Product Detail](https://raw.githubusercontent.com/NhinhoD/LuminaShop/main/public/stitch_e_commerce_ux_ui_design/product_detail/screen.png)) |

### 🛒 Cart & Checkout
| Cart | Checkout |
|------|----------|
| ![Cart](https://raw.githubusercontent.com/NhinhoD/LuminaShop/main/public/stitch_e_commerce_ux_ui_design/shopping_cart/screen.png) | ![Checkout](https://raw.githubusercontent.com/NhinhoD/LuminaShop/main/public/stitch_e_commerce_ux_ui_design/checkout/screen.png) |

### 👤 User Dashboard
| Profile |
|---------|
| ![User Profile](https://raw.githubusercontent.com/NhinhoD/LuminaShop/main/public/stitch_e_commerce_ux_ui_design/user_profile/screen.png)

### 🔧 Admin Suite
| Dashboard | Product Management |
|-----------|--------------------|
| ![Admin Dashboard](https://raw.githubusercontent.com/NhinhoD/LuminaShop/main/public/stitch_e_commerce_ux_ui_design/admin_dashboard/screen.png) | ![Product Management](https://raw.githubusercontent.com/NhinhoD/LuminaShop/main/public/stitch_e_commerce_ux_ui_design/product_management/screen.png) |

---

## 🚀 Features

- **Dynamic Storefront**: Beautifully designed product listings and category navigation.
- **Real-time Search & Filtering**: Fast and intuitive product discovery.
- **Secure Authentication**: User registration and login powered by Supabase Auth.
- **User Dashboard**: Manage profile settings, order history, and preferences.
- **Admin Suite**: Comprehensive dashboard for managing products, orders, customers, and analytics.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop experiences.
- **Glassmorphism & Micro-animations**: Premium UI/UX with smooth transitions and modern aesthetics.

---

## 🛠️ Tech Stack

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=flat-square&logo=zustand&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

### Frontend
- **[Next.js 15](https://nextjs.org/)** (App Router) — React framework with SSR & SSG
- **[React 19](https://react.dev/)** — UI library
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** — Animation library
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
LuminaShop/
├── src/
│   ├── app/                # Next.js App Router (Pages & Layouts)
│   ├── application/        # Business Logic & Use Cases
│   ├── domain/             # Entities & Models (Core Logic)
│   ├── infrastructure/     # Data Repositories & API Clients (Supabase)
│   ├── presentation/       # Shared Components & UI Library
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
   cd LuminaShop
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
