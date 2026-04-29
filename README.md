# LuminaShop - Modern E-Commerce Platform

LuminaShop is a high-performance, visually stunning e-commerce platform built with **Next.js 15**, **Supabase**, and **TypeScript**. It features a modern design system, seamless user experiences, and a robust backend architecture.

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
