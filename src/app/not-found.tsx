import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff] font-['Manrope'] selection:bg-blue-100">
      {/* ─── Header ─── */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex justify-between items-center w-full px-8 md:px-16 py-6 max-w-[1400px] mx-auto relative">
          {/* Navigation Links */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-500 hover:text-slate-900 transition-colors" href="/shop">Shop All</Link>
            <Link className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-500 hover:text-slate-900 transition-colors" href="/shop?category=new">New Arrivals</Link>
            <Link className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-500 hover:text-slate-900 transition-colors" href="/shop?collection=all">Collections</Link>
          </nav>

          {/* Logo (Centered) */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link className="text-2xl font-black tracking-[-0.05em] text-slate-900" href="/">LUMINA</Link>
          </div>

          {/* Icons */}
          <div className="flex gap-6 items-center text-slate-700">
            <button className="hover:text-slate-900 transition-colors"><span className="material-symbols-outlined text-[22px]">search</span></button>
            <Link href="/login" className="hover:text-slate-900 transition-colors"><span className="material-symbols-outlined text-[22px]">person</span></Link>
            <Link href="/cart" className="hover:text-slate-900 transition-colors"><span className="material-symbols-outlined text-[22px]">shopping_cart</span></Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 relative overflow-hidden">
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

      {/* ─── Footer ─── */}
      <footer className="w-full bg-white/50 border-t border-slate-200/50 py-12">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-lg font-black tracking-tight text-slate-900 mb-2">LUMINA</span>
            <span className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">© 2024 LUMINA. ALL RIGHTS RESERVED.</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-8">
            <Link className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 hover:text-slate-900 transition-colors" href="#">Privacy Policy</Link>
            <Link className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 hover:text-slate-900 transition-colors" href="#">Terms of Service</Link>
            <Link className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 hover:text-slate-900 transition-colors" href="#">Shipping & Returns</Link>
            <Link className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 hover:text-slate-900 transition-colors" href="#">Contact Us</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
