import Link from "next/link";
import { Navbar } from "@/presentation/components/layout/Navbar";
import { Footer } from "@/presentation/components/layout/Footer";
import CartDrawer from "@/presentation/components/layout/CartDrawer";
import { UI_CONFIG } from "@/presentation/constants";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff] font-['Manrope'] selection:bg-blue-100">
      <Navbar />
      <CartDrawer />

      {/* ─── Main Content ─── */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ paddingTop: UI_CONFIG.NAVBAR_HEIGHT }}>
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[640px] text-center flex flex-col items-center">
          {/* Large 404 Display */}
          <h1 className="text-[150px] md:text-[220px] font-extrabold leading-none tracking-[-0.08em] text-[#e1e7f5] mb-2 select-none">
            404
          </h1>

          {/* Status Message */}
          <h2 className="text-lg md:text-xl font-medium text-slate-800 mb-4">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-slate-500 text-sm md:text-base max-w-[400px] leading-relaxed mb-12">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            <br className="hidden md:block" />
            Let&apos;s get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-3 bg-[#0051d5] text-white px-10 py-4 rounded-lg font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all duration-300 min-w-[240px]"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              Back to Homepage
            </Link>
            <Link
              href="/shop"
              className="flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-10 py-4 rounded-lg font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 min-w-[180px]"
            >
              <span className="material-symbols-outlined text-xl">storefront</span>
              Browse Shop
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
