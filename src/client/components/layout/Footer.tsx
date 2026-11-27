"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/shared/constants";
import {
  MapPin,
  Phone,
  Mail,
  Zap,
  Code2,
  Globe,
  ArrowUpRight,
  Cpu,
} from "lucide-react";
import { useI18n } from "@/client/components/common/I18nContext";

interface SocialLink {
  readonly key: string;
  readonly Icon: React.ComponentType<{ size?: number; className?: string }>;
  readonly href: string;
}

const socialLinks: readonly SocialLink[] = [
  { key: "Facebook", Icon: Globe, href: "#" },
  { key: "Twitter", Icon: Globe, href: "#" },
  { key: "GitHub", Icon: Code2, href: "#" },
];

const techBadges = [
  { title: "HTML5", desc: "Semantic markup", icon: Code2 },
  { title: "CSS3", desc: "Modern styling", icon: Zap },
  { title: "JavaScript", desc: "Interactive", icon: Cpu },
  { title: "Bootstrap 5", desc: "Responsive grid", icon: Globe },
] as const;

/**
 * Site footer on the Spec Sheet paper theme.
 *
 * Uses a light paper background so the brand logo keeps its original navy
 * colours and the footer stays consistent with the rest of the storefront.
 *
 * @returns Footer element.
 */
export function Footer(): React.JSX.Element {
  const { dict } = useI18n();
  const f = (dict?.footer as { readonly [key: string]: string }) ?? {};

  const quickLinks = [
    { label: f.templates || "Templates", href: "/shop" },
    { label: f.aboutUs || "About", href: "/" },
    { label: f.contact || "Contact", href: "mailto:khoui.gmail@gmail.com" },
  ];

  const menuLinks = [
    { label: f.webTemplates || "Web Templates", href: "/shop?category=ecommerce" },
    { label: f.portfolio || "Portfolio", href: "/shop?category=portfolio" },
    { label: f.dashboards || "Dashboards", href: "/shop?category=saas" },
    { label: f.components || "Components", href: "/shop?category=fintech" },
  ];

  const contactInfo = [
    { label: f.emailLabel || "Email", value: "khoui.gmail@gmail.com", icon: Mail },
    { label: f.phoneLabel || "Phone", value: "0987 654 321", icon: Phone },
    { label: f.addressLabel || "Address", value: "Ho Chi Minh City, Vietnam", icon: MapPin },
  ];

  return (
    <footer className="relative z-[10] mt-auto overflow-hidden border-t border-border bg-background text-dark">
      {/* Capability strip */}
      <div className="border-b border-border">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-px bg-border px-0 md:grid-cols-4">
          {techBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="flex items-start gap-3 bg-surface px-5 py-5 sm:px-8">
                <span className="mono-meta mt-0.5 text-[9px] text-dark/30">{String(index + 1).padStart(2, "0")}</span>
                <Icon size={15} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-[12px] font-semibold leading-tight text-dark">{badge.title}</p>
                  <p className="mt-1 text-[11px] leading-snug text-dark/45">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main columns */}
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link href={ROUTES.HOME} className="group inline-flex items-center gap-2">
              <Image
                src="/LogoKhoUI.png"
                alt="KhoUI"
                width={120}
                height={36}
                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </Link>
            <p className="mono-meta mt-3 text-[9px] text-dark/35">{f.tagline}</p>
            <p className="mt-5 max-w-sm text-[12.5px] leading-relaxed text-dark/55">{f.brandDesc}</p>
            <div className="mt-6 flex gap-2">
              {socialLinks.map(({ key, Icon, href }) => (
                <Link
                  key={key}
                  href={href}
                  aria-label={key}
                  className="flex h-8 w-8 items-center justify-center border border-border text-dark/55 transition-colors hover:border-primary hover:bg-primary hover:text-background"
                >
                  <Icon size={13} />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h4 className="mono-meta mb-4 text-[9px] text-dark/35">{f.quickLinks}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="link-underline inline-flex items-center gap-1 text-[12.5px] text-dark/70 transition-colors hover:text-dark"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h4 className="mono-meta mb-4 text-[9px] text-dark/35">{f.categories}</h4>
            <ul className="space-y-2.5">
              {menuLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="link-underline inline-flex items-center gap-1 text-[12.5px] text-dark/70 transition-colors hover:text-dark"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="mono-meta mb-4 text-[9px] text-dark/35">{f.getInTouch}</h4>
            <div className="space-y-3.5">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <item.icon size={13} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <span className="mono-meta block text-[8.5px] text-dark/35">{item.label}</span>
                    <span className="mt-1 block text-[12px] font-medium text-dark/80">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="mailto:khoui.gmail@gmail.com"
              className="mt-5 inline-flex items-center gap-1.5 border border-border px-3 py-2 text-[11px] font-semibold text-dark transition-colors hover:border-primary hover:bg-primary hover:text-background"
            >
              <span>{f.supportCta}</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-3 px-5 py-4 text-[11px] text-dark/40 sm:flex-row sm:items-center sm:px-8">
          <p>&copy; {f.copyright}</p>
          <div className="flex flex-wrap gap-5">
            <Link href="#" className="transition-colors hover:text-dark">{f.privacyPolicy}</Link>
            <Link href="#" className="transition-colors hover:text-dark">{f.terms}</Link>
            <Link href="#" className="transition-colors hover:text-dark">{f.cookies}</Link>
          </div>
        </div>
      </div>

      {/* Running accent line */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-line-run motion-reduce:animate-none"
      />
    </footer>
  );
}

export default Footer;
