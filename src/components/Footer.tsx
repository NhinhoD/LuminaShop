import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <footer className="bg-slate-50 w-full border-t border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 md:px-20 py-12 max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
          <span className="text-lg font-bold text-slate-900 mb-2">LUMINA</span>
          <span className="text-xs font-light tracking-widest uppercase text-slate-500">
            © 2024 LUMINA. ALL RIGHTS RESERVED.
          </span>
        </div>
        
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-4">
          {['Privacy Policy', 'Terms of Service', 'Shipping & Returns', 'Contact Us', 'Store Locator'].map((item) => (
            <Link
              key={item}
              to="#"
              className="text-xs font-light tracking-widest uppercase text-slate-500 hover:text-slate-900 transition-colors underline"
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
