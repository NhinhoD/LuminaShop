import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/src/lib/utils';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  const navLinks = [
    { name: 'Shop All', href: '/shop' },
    { name: 'New Arrivals', href: '#' },
    { name: 'Collections', href: '#' },
    { name: 'Sustainability', href: '#' },
    { name: 'Journal', href: '#' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 shadow-none border-white/10">
      <div className="flex justify-between items-center w-full px-8 md:px-12 py-4 max-w-[1280px] mx-auto h-[72px]">
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Brand Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <Link to="/" className="text-2xl font-black tracking-tighter text-white uppercase font-display">
            Lumina
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-[11px] font-bold tracking-[0.2em] uppercase transition-all hover:text-white pb-1 border-b-2",
                location.pathname === link.href ? "text-white border-white" : "text-white/60 border-transparent"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex gap-4 items-center text-white">
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all">
            <Search size={18} />
          </button>
          <Link to="/login" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all">
            <User size={18} />
          </Link>
          <Link to="/cart" className="flex items-center gap-2 bg-white/10 py-2 px-4 rounded-full border border-white/10 hover:bg-white/20 transition-all">
            <ShoppingCart size={18} />
            <span className="text-xs font-bold">2</span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-xs font-bold tracking-widest uppercase text-white/70"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
