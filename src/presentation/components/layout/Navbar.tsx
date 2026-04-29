import Link from "next/link";
import { createClient } from "@/infrastructure/supabase/server";
import { ROUTES, BRAND_NAME } from "@/presentation/constants";
import NavbarCartIcon from "./NavbarCartIcon";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navLinks = [
    { label: "SHOP ALL", href: ROUTES.SHOP },
    { label: "NEW ARRIVALS", href: `${ROUTES.SHOP}?category=new` },
    { label: "COLLECTIONS", href: `${ROUTES.SHOP}?collection=all` },
    { label: "EDITORIAL", href: "#" },
    { label: "SUPPORT", href: "#" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white border-b border-slate-100 shadow-sm h-[64px]">
      <div className="flex justify-between items-center w-full px-8 md:px-12 h-full max-w-[1440px] mx-auto">
        
        {/* Left: Navigation Links */}
        <nav className="hidden lg:flex gap-8 items-center flex-1">
          {navLinks.map((link) => (
            <Link 
              key={link.label}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-900 tracking-[0.15em] transition-all" 
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Center: Logo */}
        <div className="flex justify-center items-center">
          <Link className="text-lg font-black tracking-[0.25em] text-slate-950 uppercase" href={ROUTES.HOME}>
            {BRAND_NAME}
          </Link>
        </div>

        {/* Right: Icons */}
        <div className="flex gap-6 items-center text-slate-700 flex-1 justify-end">
          <button className="hover:text-slate-950 transition-colors p-1">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          {user ? (
            <Link href={ROUTES.PROFILE} className="hover:text-slate-950 transition-colors p-1">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
          ) : (
            <Link href={ROUTES.LOGIN} className="hover:text-slate-950 transition-colors p-1">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
          )}
          <NavbarCartIcon />
        </div>
      </div>
    </header>
  );
}
