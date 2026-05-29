"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ROUTES } from "@/presentation/constants";
import NavbarCartIcon from "./NavbarCartIcon";
import gsap from "gsap";

interface NavbarClientProps {
  readonly user: unknown;
  readonly brandName: string;
  readonly navLinks: readonly { label: string; href: string }[];
}

export default function NavbarClient({ user, brandName, navLinks }: NavbarClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // GSAP Intro animation for header elements
    const ctx = gsap.context(() => {
      gsap.fromTo(logoRef.current, 
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
      
      const linkElements = linksRef.current?.querySelectorAll("a");
      if (linkElements && linkElements.length > 0) {
        gsap.fromTo(linkElements,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.05, delay: 0.4 }
        );
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      ctx.revert(); // proper GSAP context cleanup to prevent memory leaks
    };
  }, []);

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 w-full z-50 transition-all duration-500 h-[72px] ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-slate-100/50 shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="flex justify-between items-center w-full px-8 md:px-12 h-full max-w-[1440px] mx-auto">
        
        {/* Left: Navigation Links */}
        <nav ref={linksRef} className="hidden lg:flex gap-8 items-center flex-1">
          {navLinks.map((link) => (
            <Link 
              key={link.label}
              className={`text-[10px] font-bold tracking-[0.15em] transition-all duration-300 relative py-2 group ${
                isScrolled ? "text-slate-500 hover:text-slate-900" : "text-slate-200 hover:text-white"
              }`} 
              href={link.href}
            >
              {link.label}
              <span className={`absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full ${
                isScrolled ? "bg-slate-900" : "bg-white"
              }`} />
            </Link>
          ))}
        </nav>

        {/* Center: Logo */}
        <div ref={logoRef} className="flex justify-center items-center">
          <Link 
            className={`text-xl font-black tracking-[0.25em] uppercase transition-colors duration-300 hover:scale-105 transform ${
              isScrolled ? "text-slate-950" : "text-white"
            }`} 
            href={ROUTES.HOME}
          >
            {brandName}
          </Link>
        </div>

        {/* Right: Icons */}
        <div className={`flex gap-6 items-center flex-1 justify-end transition-colors duration-300 ${
          isScrolled ? "text-slate-700" : "text-slate-200"
        }`}>
          <button className={`transition-colors p-1 hover:scale-110 transform ${
            isScrolled ? "hover:text-slate-950" : "hover:text-white"
          }`}>
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          {user ? (
            <Link href={ROUTES.PROFILE} className={`transition-colors p-1 hover:scale-110 transform ${
              isScrolled ? "hover:text-slate-950" : "hover:text-white"
            }`}>
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
          ) : (
            <Link href={ROUTES.LOGIN} className={`transition-colors p-1 hover:scale-110 transform ${
              isScrolled ? "hover:text-slate-950" : "hover:text-white"
            }`}>
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
          )}
          <div className="hover:scale-110 transform transition-transform">
            <NavbarCartIcon />
          </div>
        </div>
      </div>
    </header>
  );
}
