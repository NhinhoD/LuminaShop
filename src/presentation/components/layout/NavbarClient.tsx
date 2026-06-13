"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

import { ROUTES } from "@/presentation/constants";
import NavbarCartIcon from "./NavbarCartIcon";
import gsap from "gsap";
import { Menu, X, Search, User, ChevronDown } from "lucide-react";
import { LanguageSwitcher } from "../common/LanguageSwitcher";

interface NavbarClientProps {
  readonly user: unknown;
  readonly brandName: string;
  readonly navLinks: readonly { label: string; href: string }[];
  readonly dict: Record<string, Record<string, string>>;
}

export default function NavbarClient({ user, navLinks, dict }: NavbarClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const ctx = gsap.context(() => {
      gsap.fromTo(logoRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );

      const linkElements = linksRef.current?.querySelectorAll("a, button");
      if (linkElements && linkElements.length > 0) {
        gsap.fromTo(linkElements,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.05, delay: 0.4 }
        );
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      ctx.revert();
    };
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#111] py-2 text-[0.82rem] hidden md:block">
        <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center flex-wrap gap-2">
          <div className="flex flex-wrap gap-4">
            <span className="text-[#aaa]">
              <span className="text-secondary mr-1">📞</span>0987 654 321
            </span>
            <span className="text-[#aaa]">
              <span className="text-secondary mr-1">✉</span>contact@khoui.com
            </span>
            <span className="text-[#aaa]">
              <span className="text-secondary mr-1">📍</span>Ho Chi Minh City, Vietnam
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="tag-badge">
              🚀 Instant Digital Delivery!
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        ref={headerRef}
        className={`sticky top-0 z-[990] transition-all duration-400 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.14)]"
            : "bg-white shadow-[0_2px_20px_rgba(0,0,0,0.07)]"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center h-[68px]">
          {/* Logo */}
          <Link ref={logoRef} href={ROUTES.HOME} className="flex items-center gap-2.5 group">
            <img src="/LogoKhoUI.png" alt="KhoUI Logo" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Nav Links */}
          <div ref={linksRef} className="hidden lg:flex items-center gap-0">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                className="relative text-[0.87rem] font-medium text-[#333] px-3.5 py-7 hover:text-primary transition-colors group"
                href={link.href}
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-primary rounded-t-sm transition-all duration-300 group-hover:w-[55%]" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button
              className="bg-transparent border-none cursor-pointer text-[#555] text-base p-2 rounded-lg hover:bg-[rgba(232,40,26,0.08)] hover:text-primary transition-colors"
              title="Search"
            >
              <Search size={18} />
            </button>

            {user ? (
              <Link
                href={ROUTES.PROFILE}
                className="p-2 rounded-lg text-[#555] hover:bg-[rgba(232,40,26,0.08)] hover:text-primary transition-colors"
              >
                <User size={18} />
              </Link>
            ) : (
              <Link
                href={ROUTES.LOGIN}
                className="p-2 rounded-lg text-[#555] hover:bg-[rgba(232,40,26,0.08)] hover:text-primary transition-colors"
              >
                <User size={18} />
              </Link>
            )}

            <div className="hover:scale-110 transform transition-transform">
              <NavbarCartIcon />
            </div>

            <div className="hidden sm:block ml-2">
              <LanguageSwitcher />
            </div>

            <Link
              href={ROUTES.SHOP}
              className="hidden sm:inline-flex items-center gap-2 bg-[#0051d5] text-white rounded-lg px-5 py-2.5 text-[0.84rem] font-semibold shadow-[0_4px_15px_rgba(0,81,213,0.3)] ml-1.5 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(0,81,213,0.4)] transition-all"
            >
              <ChevronDown size={14} />
              {dict?.nav?.explore || "Explore Themes"}
            </Link>

            {/* Mobile toggle */}
            <button
              className="lg:hidden ml-2 text-primary text-xl border-none bg-transparent cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#eee] px-4 py-4 flex flex-col gap-1 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                className="text-[0.87rem] font-medium text-[#333] px-3 py-3 rounded-lg hover:bg-[rgba(232,40,26,0.06)] hover:text-primary transition-colors"
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={ROUTES.SHOP}
              className="mt-2 justify-center text-center px-4 py-3 bg-[#0051d5] text-white rounded-lg font-bold hover:bg-[#0041ab]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ✨ {dict?.nav?.explore || "Explore Themes"}
            </Link>
            <div className="mt-4 flex justify-center pb-2 border-t border-slate-100 pt-4">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
