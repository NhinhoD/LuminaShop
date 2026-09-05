"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { ROUTES } from "@/presentation/constants";
import NavbarCartIcon from "./NavbarCartIcon";
import gsap from "gsap";
import { 
  Menu, 
  X, 
  Search, 
  User, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Layout, 
  Cpu, 
  Code2, 
  CreditCard,
  ChevronDown,
  Flame,
} from "lucide-react";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { useI18n } from "../common/I18nContext";

interface NavbarClientProps {
  readonly user: unknown;
  readonly brandName: string;
  readonly navLinks: readonly { label: string; href: string }[];
  readonly dict: Record<string, Record<string, string>>;
}

const TEMPLATE_MEGA_ITEMS = [
  {
    icon: Layout,
    title: "E-Commerce Pro",
    desc: "Next.js 16, Realtime Cart, PayOS VietQR & Supabase",
    href: `${ROUTES.SHOP}?category=e-commerce`,
    tag: "Hot",
  },
  {
    icon: Cpu,
    title: "Admin Dashboard",
    desc: "RBAC Permissions, Realtime Charts & Analytics",
    href: `${ROUTES.SHOP}?category=saas-tech`,
    tag: "Pro",
  },
  {
    icon: Code2,
    title: "Developer Portfolio",
    desc: "Kinetic Typography, MDX Blog & Case Studies",
    href: `${ROUTES.SHOP}?category=portfolio-agency`,
    tag: "Free",
  },
  {
    icon: CreditCard,
    title: "Fintech & SaaS Hub",
    desc: "Multi-tier Pricing & Clean Architecture",
    href: `${ROUTES.SHOP}?category=fintech-corporate`,
    tag: "Enterprise",
  },
];

export default function NavbarClient({ user, navLinks }: NavbarClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { dict, locale } = useI18n();

  const handleMouseEnterMega = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeaveMega = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 180);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.SHOP}?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsMegaMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const ctx = gsap.context(() => {
      gsap.fromTo(logoRef.current,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      ctx.revert();
    };
  }, []);

  return (
    <>
      {/* ─── Topbar Announcement (Subtle, Refined Dark Strip) ─── */}
      <div className="bg-slate-900/95 py-1.5 text-[12px] hidden md:block border-b border-slate-800/40 text-slate-400 font-sans">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 flex justify-between items-center">
          
          {/* Left: System Status */}
          <div className="flex items-center gap-4 text-[11.5px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-medium">
                Next.js 16.2 • Clean Architecture
              </span>
            </div>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>{locale === "vi" ? "Bản quyền thương mại vĩnh viễn" : "Lifetime Commercial License"}</span>
            </span>
          </div>

          {/* Right: Live Delivery & Hotline */}
          <div className="flex items-center gap-4 text-[11.5px]">
            <div className="inline-flex items-center gap-1.5 text-blue-300 font-medium">
              <Zap size={11} className="text-primary" />
              <span>{locale === "vi" ? "VietQR tự động bàn giao tức thì 24/7" : "VietQR automated 24/7 delivery"}</span>
            </div>

            <span className="text-slate-700 hidden lg:inline">•</span>

            <span className="hidden lg:inline text-slate-300">
              Hotline: <strong className="font-semibold text-white">{dict?.nav?.contactPhone || "0987 654 321"}</strong>
            </span>
          </div>

        </div>
      </div>

      {/* ─── Main Glassmorphic Navbar ─── */}
      <nav
        ref={headerRef}
        className={`sticky top-0 z-[990] transition-all duration-200 font-sans ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100 h-[62px]"
            : "bg-white/98 backdrop-blur-xs border-b border-slate-100/60 h-[68px]"
        } flex items-center`}
      >
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 flex justify-between items-center w-full">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Link ref={logoRef} href={ROUTES.HOME} className="flex items-center gap-2">
              <Image 
                src="/LogoKhoUI.png" 
                alt="KhoUI Logo" 
                width={120} 
                height={40} 
                priority 
                className="h-9 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Desktop Navigation Links with Subtle Sliding Highlight */}
          <div 
            className="hidden lg:flex items-center gap-0.5 relative"
            onMouseLeave={() => setHoveredNav(null)}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isShop = link.href === ROUTES.SHOP;

              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => {
                    setHoveredNav(link.href);
                    if (isShop) handleMouseEnterMega();
                    else setIsMegaMenuOpen(false);
                  }}
                  onMouseLeave={() => {
                    if (isShop) handleMouseLeaveMega();
                  }}
                >
                  <Link
                    href={link.href}
                    className={`relative z-10 flex items-center gap-1 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors ${
                      isActive ? "text-primary font-semibold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isShop && (
                      <ChevronDown size={12} className={`transition-transform opacity-50 ${isMegaMenuOpen ? "rotate-180 text-primary opacity-100" : ""}`} />
                    )}
                  </Link>

                  {/* Active / Hover Subtle Highlight */}
                  {(hoveredNav === link.href || (isActive && !hoveredNav)) && (
                    <motion.div
                      layoutId="navbar-capsule"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className="absolute inset-0 bg-slate-100/70 rounded-lg -z-0"
                    />
                  )}

                  {/* Mega Menu Dropdown for "Kho Template" */}
                  {isShop && (
                    <AnimatePresence>
                      {isMegaMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          onMouseEnter={handleMouseEnterMega}
                          onMouseLeave={handleMouseLeaveMega}
                          className="absolute top-full left-0 w-[480px] bg-white rounded-xl shadow-xl border border-slate-100 p-4 mt-1.5 z-50 font-sans"
                        >
                          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                              {locale === "vi" ? "Danh mục phổ biến" : "Popular categories"}
                            </span>
                            <Link 
                              href={ROUTES.SHOP}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                            >
                              <span>{locale === "vi" ? "Tất cả template" : "All templates"}</span>
                              <ArrowRight size={11} />
                            </Link>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {TEMPLATE_MEGA_ITEMS.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.title}
                                  href={item.href}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="group/card p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all block"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center group-hover/card:bg-primary group-hover/card:text-white transition-colors">
                                      <Icon size={14} />
                                    </div>
                                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                      {item.tag}
                                    </span>
                                  </div>
                                  <h4 className="text-xs font-semibold text-slate-900 group-hover/card:text-primary transition-colors">
                                    {item.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                    {item.desc}
                                  </p>
                                </Link>
                              );
                            })}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs px-1">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Flame size={13} className="text-amber-500" />
                              <span>{locale === "vi" ? "Mã nguồn miễn phí cho cộng đồng" : "Free open-source codebases"}</span>
                            </div>
                            <Link 
                              href={`${ROUTES.SHOP}?price=free`}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="text-primary font-medium hover:underline text-[11px]"
                            >
                              {locale === "vi" ? "Xem ngay →" : "Explore →"}
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Action Bar & CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Quick Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200/60 transition-colors text-xs font-normal cursor-pointer"
              title="Search templates (Ctrl+K)"
            >
              <Search size={13} className="text-slate-400" />
              <span className="text-slate-400 text-[11.5px]">{locale === "vi" ? "Tìm template..." : "Search..."}</span>
              <kbd className="font-mono text-[9px] bg-white border border-slate-200 px-1 py-0.2 rounded text-slate-400">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100"
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            {/* User Profile Button */}
            {user ? (
              <Link
                href={ROUTES.PROFILE}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100"
                title={dict?.nav?.profile || "Profile"}
              >
                <User size={16} />
              </Link>
            ) : (
              <Link
                href={ROUTES.LOGIN}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100"
                title={dict?.nav?.login || "Login"}
              >
                <User size={16} />
              </Link>
            )}

            {/* Shopping Cart Drawer Icon */}
            <NavbarCartIcon />

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Primary Action Button */}
            <Link
              href={ROUTES.SHOP}
              className="hidden sm:inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-colors ml-1"
            >
              <span>{dict?.nav?.explore || (locale === "vi" ? "Kho Template" : "Explore")}</span>
              <ArrowRight size={12} />
            </Link>

            {/* Mobile Toggle Button */}
            <button
              className="lg:hidden ml-1 text-slate-700 p-1.5 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-lg border border-slate-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex flex-col gap-1 shadow-xl overflow-hidden font-sans"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  className="text-xs font-medium text-slate-800 px-3.5 py-2.5 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors flex items-center justify-between"
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  <ArrowRight size={12} className="opacity-30" />
                </Link>
              ))}

              <Link
                href={ROUTES.SHOP}
                className="mt-2 flex items-center justify-center gap-2 text-center px-4 py-2.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark shadow-xs"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>{dict?.nav?.explore || (locale === "vi" ? "Kho Template" : "Explore Templates")}</span>
                <ArrowRight size={13} />
              </Link>
              <div className="mt-2 flex justify-center pt-3 border-t border-slate-100">
                <LanguageSwitcher />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Command K Modal Search Dialog ─── */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[999] flex items-start justify-center pt-20 px-4 font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-10"
            >
              <form onSubmit={handleSearchSubmit} className="p-3.5 border-b border-slate-100 flex items-center gap-2.5">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === "vi" ? "Tìm mã nguồn, template (Next.js, Tailwind, GSAP)..." : "Search templates, architectures..."}
                  className="w-full bg-transparent outline-none text-xs text-slate-800 placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                >
                  <X size={14} />
                </button>
              </form>

              <div className="p-3.5 bg-slate-50/60 space-y-2">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                  {locale === "vi" ? "Từ khóa gợi ý" : "Suggested keywords"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["Next.js 16", "Clean Architecture", "VietQR", "Admin Dashboard", "E-Commerce", "Portfolio"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag);
                        router.push(`${ROUTES.SHOP}?q=${encodeURIComponent(tag)}`);
                        setIsSearchOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200/70 text-slate-600 hover:border-primary hover:text-primary text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
