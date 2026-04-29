import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 w-full border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 md:px-20 py-12 max-w-[1280px] mx-auto">
        {/* Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
          <span className="text-lg font-bold text-slate-900 dark:text-white mb-2">LUMINA</span>
          <span className="font-['Manrope'] text-xs font-light tracking-widest uppercase text-slate-500 dark:text-slate-400">© 2024 LUMINA. ALL RIGHTS RESERVED.</span>
        </div>
        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-4">
          <Link className="font-['Manrope'] text-xs font-light tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors underline" href="#">Privacy Policy</Link>
          <Link className="font-['Manrope'] text-xs font-light tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors underline" href="#">Terms of Service</Link>
          <Link className="font-['Manrope'] text-xs font-light tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors underline" href="#">Shipping & Returns</Link>
          <Link className="font-['Manrope'] text-xs font-light tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors underline" href="#">Contact Us</Link>
          <Link className="font-['Manrope'] text-xs font-light tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors underline" href="#">Store Locator</Link>
        </nav>
      </div>
    </footer>
  );
}
