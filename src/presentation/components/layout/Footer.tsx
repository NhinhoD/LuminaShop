"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/presentation/constants";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ChevronRight, 
  Globe, 
  Camera, 
  MessageCircle, 
  Play, 
  ShieldCheck, 
  Zap, 
  Code2, 
  Layers 
} from "lucide-react";
import { useI18n } from "@/presentation/components/common/I18nContext";

export function Footer() {
  const { dict, locale } = useI18n();

  const quickLinks = [
    { label: dict?.footer?.home || (locale === "vi" ? "Trang chủ" : "Home"), href: ROUTES.HOME },
    { label: dict?.footer?.templates || (locale === "vi" ? "Kho Template" : "Templates"), href: ROUTES.SHOP },
    { label: dict?.footer?.aboutUs || (locale === "vi" ? "Về KhoUI" : "About KhoUI"), href: "#advantages" },
    { label: dict?.footer?.contact || (locale === "vi" ? "Liên hệ hỗ trợ" : "Technical Support"), href: "mailto:contact@khoui.com" },
  ];

  const menuLinks = [
    { label: "Landing Page", href: `${ROUTES.SHOP}?category=landing-page` },
    { label: "E-Commerce", href: `${ROUTES.SHOP}?category=e-commerce` },
    { label: "Admin Dashboard", href: `${ROUTES.SHOP}?category=admin-dashboard` },
    { label: "Portfolio", href: `${ROUTES.SHOP}?category=portfolio` },
    { label: locale === "vi" ? "Mẫu miễn phí" : "Free Templates", href: `${ROUTES.SHOP}?category=free` },
  ];

  const contactInfo = [
    { icon: MapPin, label: dict?.footer?.addressLabel || (locale === "vi" ? "Địa chỉ" : "Address"), value: dict?.footer?.addressValue || "TP. Hồ Chí Minh, Việt Nam" },
    { icon: Phone, label: dict?.footer?.phoneLabel || (locale === "vi" ? "Hotline" : "Hotline"), value: dict?.nav?.contactPhone || "0987 654 321" },
    { icon: Mail, label: dict?.footer?.emailLabel || (locale === "vi" ? "Email" : "Email"), value: dict?.nav?.contactEmail || "contact@khoui.com" },
    { icon: Clock, label: dict?.footer?.supportLabel || (locale === "vi" ? "Hỗ trợ" : "Fulfillment"), value: dict?.footer?.supportValue || "Tự động bàn giao 24/7" },
  ];

  const socialLinks = [
    { key: "facebook", Icon: Globe, href: "#" },
    { key: "instagram", Icon: Camera, href: "#" },
    { key: "twitter", Icon: MessageCircle, href: "#" },
    { key: "youtube", Icon: Play, href: "#" },
  ];

  const techBadges = [
    { icon: Code2, title: "Next.js 16 App Router", desc: "Turbopack Ready" },
    { icon: Layers, title: "Clean Architecture", desc: "Strict 4-Layers" },
    { icon: Zap, title: "VietQR Instant Pay", desc: "Automated Webhook" },
    { icon: ShieldCheck, title: "Commercial License", desc: "Client Ready" },
  ];

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800/40 mt-auto font-sans">
      
      {/* ─── Technology & Quality Trust Bar ─── */}
      <div className="border-b border-slate-900 bg-slate-900/40 py-6">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {techBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-slate-800/40">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-white leading-tight">{badge.title}</h5>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Main Footer ─── */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <Link href={ROUTES.HOME} className="inline-block">
              <Image src="/LogoKhoUI.png" alt="KhoUI Logo" width={120} height={40} className="h-9 w-auto object-contain mb-1.5" />
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-normal">
              {dict?.footer?.brandDesc || "Nền tảng cung cấp mã nguồn website template cao cấp xây dựng bằng Next.js 16, Tailwind CSS v4 và GSAP 3.15. Tải về tức thì sau thanh toán."}
            </p>
            <div className="flex gap-2 pt-1">
              {socialLinks.map(({ key, Icon, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/60 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors"
                  aria-label={key}
                >
                  <Icon size={14} />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              {dict?.footer?.quickLinks || (locale === "vi" ? "Liên kết nhanh" : "Quick Links")}
            </h4>
            <ul className="list-none space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 text-xs flex items-center gap-1 hover:text-primary transition-colors font-normal"
                  >
                    <ChevronRight size={12} className="text-slate-600" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              {dict?.footer?.categories || (locale === "vi" ? "Danh mục template" : "Categories")}
            </h4>
            <ul className="list-none space-y-2">
              {menuLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 text-xs flex items-center gap-1 hover:text-primary transition-colors font-normal"
                  >
                    <ChevronRight size={12} className="text-slate-600" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              {dict?.footer?.getInTouch || (locale === "vi" ? "Thông tin liên hệ" : "Get In Touch")}
            </h4>
            <div className="space-y-3">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon size={13} />
                  </div>
                  <div>
                    <strong className="block text-slate-500 text-[10px] uppercase tracking-wider font-normal">
                      {item.label}
                    </strong>
                    <span className="text-slate-200 text-xs font-medium">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ─── Bottom Copyright Bar ─── */}
      <div className="border-t border-slate-900 py-4 bg-slate-950">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 font-normal">
          <p>
            &copy; {dict?.footer?.copyright || "2026 KhoUI. Bảo lưu mọi quyền."}
          </p>
          <div className="flex gap-5 text-[11px]">
            <Link href="#" className="hover:text-slate-300 transition-colors">{dict?.footer?.privacyPolicy || "Chính sách bảo mật"}</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">{dict?.footer?.terms || "Điều khoản dịch vụ"}</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">{dict?.footer?.cookies || "Bản quyền giấy phép"}</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
