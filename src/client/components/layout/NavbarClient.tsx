"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ROUTES } from "@/shared/constants";
import NavbarCartIcon from "./NavbarCartIcon";
import {
  Menu,
  X,
  Search,
  User,
  ArrowRight,
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

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface NavbarClientProps {
  readonly user: unknown;
  readonly authError?: boolean;
  readonly brandName: string;
  readonly navLinks: readonly { label: string; href: string }[];
  readonly dict: Record<string, Record<string, string>>;
}

interface MegaItem {
  readonly icon: typeof Layout;
  readonly title: string;
  readonly desc: string;
  readonly href: string;
  readonly tag: string;
  readonly index: string;
}

/**
 * Interactive storefront navigation.
 *
 * Editorial "spec sheet" chrome: mono announcement strip, hairline borders,
 * rectangular controls and a numbered mega menu. Scroll state is driven by
 * ScrollTrigger instead of a raw window scroll listener, and every GSAP tween
 * is scoped so it is reverted on unmount.
 *
 * @param props - Session state, auth error, brand name and localized links.
 * @returns Rendered navigation, mobile menu and command palette.
 */
export default function NavbarClient({ user, authError, brandName, navLinks }: NavbarClientProps): React.JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const t = dict.nav;

  const megaItems: readonly MegaItem[] = [
    {
      icon: Layout,
      title: t.megaEcomTitle,
      desc: t.megaEcomDesc,
      href: `${ROUTES.SHOP}?category=e-commerce`,
      tag: t.tagHot,
      index: "01",
    },
    {
      icon: Cpu,
      title: t.megaDashTitle,
      desc: t.megaDashDesc,
      href: `${ROUTES.SHOP}?category=saas-tech`,
      tag: t.tagPro,
      index: "02",
    },
    {
      icon: Code2,
      title: t.megaPortfolioTitle,
      desc: t.megaPortfolioDesc,
      href: `${ROUTES.SHOP}?category=portfolio-agency`,
      tag: t.tagFree,
      index: "03",
    },
    {
      icon: CreditCard,
      title: t.megaBusinessTitle,
      desc: t.megaBusinessDesc,
      href: `${ROUTES.SHOP}?category=fintech-corporate`,
      tag: t.tagTrending,
      index: "04",
    },
  ];

  const handleMouseEnterMega = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeaveMega = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 160);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.SHOP}?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsMegaMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return;
    const timeout = setTimeout(() => searchInputRef.current?.focus(), 80);
    return () => clearTimeout(timeout);
  }, [isSearchOpen]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 20,
        end: "max",
        onToggle: (self) => setIsScrolled(self.isActive),
      });

      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { opacity: 0, y: -6 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      }
    });

    return () => {
      if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
      ctx.revert();
    };
  }, []);

  return (
    <>
      {/* Announcement strip */}
      <div className="relative z-[100] hidden overflow-hidden border-b border-white/10 bg-dark text-background/70 md:block">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-primary" />
              <span className="mono-meta text-[10px] text-background/85">{t.topbarTech}</span>
            </span>
            <span aria-hidden="true" className="text-background/25">/</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-primary" />
              <span className="mono-meta text-[10px]">{t.topbarLicense}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="mono-meta text-[10px] text-primary">{t.topbarDelivery}</span>
            <span aria-hidden="true" className="text-background/25">/</span>
            <span className="mono-meta hidden text-[10px] lg:inline">
              {t.hotlineLabel}: <strong className="font-medium text-background">{t.contactPhone}</strong>
            </span>
          </div>
        </div>
        {/* Running accent line */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent animate-line-run motion-reduce:animate-none"
        />
      </div>

      {/* Main bar */}
      <nav
        ref={headerRef}
        className={`sticky top-0 z-[990] ${
          isScrolled ? "border-b border-dark" : "border-b border-border"
        } bg-background transition-colors duration-300`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8">
          {/* Wordmark */}
          <Link
            ref={logoRef}
            href={ROUTES.HOME}
            aria-label={brandName}
            className="group inline-flex shrink-0 items-center gap-2"
          >
            <Image
              src="/LogoKhoUI.png"
              alt={brandName}
              width={120}
              height={36}
              priority
              className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="mono-meta hidden pl-1 text-[9px] text-dark/40 xl:inline">Premium UI</span>
          </Link>

          {/* Desktop links */}
          <div
            className="hidden h-16 items-stretch lg:flex"
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isShop = link.href === ROUTES.SHOP;

              return (
                <div
                  key={link.label}
                  className="relative flex items-stretch"
                  onMouseEnter={() => {
                    if (isShop) handleMouseEnterMega();
                    else setIsMegaMenuOpen(false);
                  }}
                  onMouseLeave={() => {
                    if (isShop) handleMouseLeaveMega();
                  }}
                >
                  <Link
                    href={link.href}
                    className={`group relative flex items-center gap-1.5 px-4 text-[13px] font-medium transition-colors ${
                      isActive ? "text-dark" : "text-dark/60 hover:text-dark"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isShop && (
                      <ChevronDown
                        size={12}
                        className={`opacity-45 transition-transform duration-300 ${isMegaMenuOpen ? "rotate-180 text-primary opacity-100" : ""}`}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3 bottom-0 h-[3px] origin-left bg-primary transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>

                  {isShop && (
                    <AnimatePresence>
                      {isMegaMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          onMouseEnter={handleMouseEnterMega}
                          onMouseLeave={handleMouseLeaveMega}
                          className="absolute left-0 top-full z-50 w-[520px] border border-border border-t-0 bg-surface"
                        >
                          <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <span className="mono-meta text-[10px] text-dark/50">{t.megaLabel}</span>
                            <Link
                              href={ROUTES.SHOP}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="link-underline inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
                            >
                              <span>{t.megaAll}</span>
                              <ArrowRight size={11} />
                            </Link>
                          </div>

                          <div className="grid grid-cols-2">
                            {megaItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.title}
                                  href={item.href}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="group/item flex gap-3 border-b border-border p-4 transition-colors even:border-l hover:bg-dark"
                                >
                                  <span className="mono-meta mt-0.5 shrink-0 text-[9px] text-dark/35 group-hover/item:text-background/40">
                                    {item.index}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="mb-1 flex items-center justify-between gap-2">
                                      <Icon size={14} className="text-primary group-hover/item:text-primary" />
                                      <span className="mono-meta border border-border px-1.5 py-0.5 text-[8px] text-dark/60 group-hover/item:border-background/25 group-hover/item:text-background/70">
                                        {item.tag}
                                      </span>
                                    </span>
                                    <span className="block text-[13px] font-semibold leading-tight text-dark group-hover/item:text-background">
                                      {item.title}
                                    </span>
                                    <span className="mt-1 block text-[11px] leading-snug text-dark/55 group-hover/item:text-background/60">
                                      {item.desc}
                                    </span>
                                  </span>
                                </Link>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between px-4 py-3">
                            <span className="flex items-center gap-1.5 text-[11px] text-dark/55">
                              <Flame size={12} className="text-primary" />
                              <span>{t.megaFree}</span>
                            </span>
                            <Link
                              href={`${ROUTES.SHOP}?price=free`}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="link-underline text-[11px] font-medium text-primary"
                            >
                              {t.megaExplore} →
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

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label={t.searchAria}
              className="hidden h-9 items-center gap-2 border border-border px-3 text-dark/60 transition-colors hover:border-dark hover:text-dark sm:flex"
            >
              <Search size={13} />
              <span className="mono-meta text-[10px]">{t.searchHint}</span>
              <kbd className="mono-meta ml-1 border border-border px-1 py-0.5 text-[9px] text-dark/40">⌘K</kbd>
            </button>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label={t.searchAria}
              className="flex h-9 w-9 items-center justify-center border border-border text-dark/70 transition-colors hover:border-dark sm:hidden"
            >
              <Search size={15} />
            </button>

            {authError ? (
              <Link
                href={ROUTES.PROFILE}
                aria-label={t.profile}
                className="flex h-9 w-9 items-center justify-center border border-primary text-primary"
              >
                <User size={15} />
              </Link>
            ) : (
              <Link
                href={user ? ROUTES.PROFILE : ROUTES.LOGIN}
                aria-label={user ? t.profile : t.login}
                className="flex h-9 w-9 items-center justify-center border border-border text-dark/70 transition-colors hover:border-dark hover:text-dark"
              >
                <User size={15} />
              </Link>
            )}

            <NavbarCartIcon />

            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <Link
              href={ROUTES.SHOP}
              className="ml-0.5 hidden h-9 items-center gap-1.5 bg-primary px-4 text-[12px] font-semibold text-background transition-colors hover:bg-dark sm:inline-flex"
            >
              <span>{t.explore}</span>
              <ArrowRight size={12} />
            </Link>

            <button
              type="button"
              className="ml-0.5 flex h-9 w-9 items-center justify-center border border-border text-dark lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? t.menuClose : t.menuOpen}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 top-full overflow-hidden border-b border-border bg-surface lg:hidden"
            >
              <div className="px-5 py-3">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-baseline justify-between border-b border-border py-3.5"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="mono-meta text-[9px] text-dark/35">{String(index + 1).padStart(2, "0")}</span>
                      <span className="font-display text-lg font-semibold tracking-[-0.03em] text-dark">{link.label}</span>
                    </span>
                    <ArrowRight size={13} className="text-dark/30" />
                  </Link>
                ))}

                <Link
                  href={ROUTES.SHOP}
                  className="mt-4 flex h-11 items-center justify-between bg-dark px-4 text-[13px] font-semibold text-background transition-colors hover:bg-primary hover:text-dark"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{t.explore}</span>
                  <ArrowRight size={14} />
                </Link>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="mono-meta text-[9px] text-dark/40">
                    {t.hotlineLabel}: {t.contactPhone}
                  </span>
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Command palette */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[999] flex items-start justify-center px-4 pt-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-dark/50 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-xl border border-dark bg-surface"
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search size={16} className="shrink-0 text-dark/40" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-transparent text-sm text-dark outline-none placeholder:text-dark/35"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  aria-label={t.menuClose}
                  className="p-1 text-dark/40 transition-colors hover:text-dark"
                >
                  <X size={15} />
                </button>
              </form>

              <div className="space-y-3 bg-background-subtle/50 p-4">
                <span className="mono-meta block text-[9px] text-dark/40">{t.searchSuggest}</span>
                <div className="flex flex-wrap gap-1.5">
                  {["HTML5", "Bootstrap 5", "CSS3", "JavaScript", "Landing Page", "Admin Dashboard", "Portfolio"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag);
                        router.push(`${ROUTES.SHOP}?q=${encodeURIComponent(tag)}`);
                        setIsSearchOpen(false);
                      }}
                      className="border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-dark/65 transition-colors hover:border-dark hover:text-dark"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="mono-meta pt-1 text-[9px] text-dark/30">
                  {locale === "vi" ? "Ctrl / ⌘ + K" : "Ctrl / ⌘ + K"}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
