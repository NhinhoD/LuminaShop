# LuminaShop - Premium Website Template & Theme Marketplace

LuminaShop is a high-performance, visually stunning marketplace specialized in providing premium website templates, UI kits, and digital themes. Built with **Next.js 15**, **Tailwind CSS v4**, **GSAP**, **Supabase**, and **TypeScript**, it delivers a state-of-the-art editorial design experience.

## 🚀 Features

- **Premium Template Storefront**: Beautifully designed digital product listings with Framer Motion layout morphing and GSAP scroll interactions.
- **Multi-Language Support**: Fully localized in English and Vietnamese, powered by a hybrid architecture of static local dictionaries and dynamic database translations.
- **Digital Product Delivery**: Seamless licensing, purchasing, and automatic download fulfillment for digital assets and source codes.
- **Secure Authentication**: User registration and login powered by Supabase Auth.
- **Developer-Friendly Admin Suite**: Comprehensive dashboard for managing digital products, licenses, dynamic translations, and sales analytics.
- **Clean Architecture**: Strictly enforced 4-layer architecture (Domain, Application, Infrastructure, Presentation) for maximum maintainability.
- **Glassmorphism & Micro-animations**: Premium UI/UX with smooth transitions and modern aesthetics.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling & Animations**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Form Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Project Structure

```
LuminaShop/
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

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm / pnpm / yarn
- A Supabase Project

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

## 📝 License

This project is licensed under the MIT License.
