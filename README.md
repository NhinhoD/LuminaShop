# LuminaShop - Modern E-Commerce Platform

LuminaShop is a high-performance, visually stunning e-commerce platform built with **Next.js 15**, **Supabase**, and **TypeScript**. It features a modern design system, seamless user experiences, and a robust backend architecture.

## 🚀 Features

- **Dynamic Storefront**: Beautifully designed product listings and category navigation.
- **Real-time Search & Filtering**: Fast and intuitive product discovery.
- **Secure Authentication**: User registration and login powered by Supabase Auth.
- **User Dashboard**: Manage profile settings, order history, and preferences.
- **Admin Suite**: Comprehensive dashboard for managing products, orders, customers, and analytics.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop experiences.
- **Glassmorphism & Micro-animations**: Premium UI/UX with smooth transitions and modern aesthetics.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Form Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

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
