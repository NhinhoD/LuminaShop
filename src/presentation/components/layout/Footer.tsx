"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/presentation/constants";
import { MapPin, Phone, Mail, Clock, ChevronRight, Globe, Camera, MessageCircle, Play } from "lucide-react";
import { useI18n } from "@/presentation/components/common/I18nContext";

export function Footer() {
  const { dict } = useI18n();

  const quickLinks = [
    { label: dict?.footer?.home || "Home", href: ROUTES.HOME },
    { label: dict?.footer?.templates || "Collection", href: ROUTES.SHOP },
    { label: dict?.footer?.aboutUs || "About Us", href: "#about" },
    { label: dict?.footer?.contact || "Contact", href: "#contact" },
  ];

  const menuLinks = [
    { label: dict?.footer?.landingPage || "Landing Page", href: `${ROUTES.SHOP}?category=landing-page` },
    { label: dict?.footer?.ecommerce || "E-Commerce", href: `${ROUTES.SHOP}?category=e-commerce` },
    { label: dict?.footer?.adminDashboard || "Admin Dashboard", href: `${ROUTES.SHOP}?category=admin-dashboard` },
    { label: dict?.footer?.portfolio || "Portfolio", href: `${ROUTES.SHOP}?category=portfolio` },
    { label: dict?.footer?.corporate || "Corporate", href: `${ROUTES.SHOP}?category=corporate` },
    { label: dict?.footer?.blog || "Blog & News", href: `${ROUTES.SHOP}?category=blog` },
  ];

  const contactInfo = [
    { icon: MapPin, label: dict?.footer?.addressLabel || "Address", value: dict?.footer?.addressValue || "Ho Chi Minh City, Vietnam" },
    { icon: Phone, label: dict?.footer?.phoneLabel || "Phone", value: dict?.nav?.contactPhone || "0987 654 321" },
    { icon: Mail, label: dict?.footer?.emailLabel || "Email", value: dict?.nav?.contactEmail || "contact@khoui.com" },
    { icon: Clock, label: dict?.footer?.supportLabel || "Support", value: dict?.footer?.supportValue || "24/7 Digital Delivery" },
  ];

  const socialLinks = [
    { key: "facebook", Icon: Globe, href: "#" },
    { key: "instagram", Icon: Camera, href: "#" },
    { key: "twitter", Icon: MessageCircle, href: "#" },
    { key: "youtube", Icon: Play, href: "#" },
  ];

  return (
    <footer className="bg-[#1a1a1a] text-white mt-auto">
      {/* Main Footer */}
      <div className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <Image src="/LogoKhoUI.png" alt="KhoUI Logo" width={140} height={48} className="h-12 w-auto object-contain mb-4" />
            <p className="text-[#999] text-sm leading-relaxed mb-6">
              {dict?.footer?.brandDesc || "Exclusive, high-quality website templates and themes built with Next.js, Tailwind CSS, and GSAP. Download instantly."}
            </p>
            <div className="flex gap-2">
              {socialLinks.map(({ key, Icon, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#bbb] text-sm hover:bg-primary hover:text-white transition-colors"
                >
                  <Icon size={14} />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-base font-semibold font-poppins mb-5 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[30px] after:h-[3px] after:bg-primary after:rounded">
              {dict?.footer?.quickLinks || "Quick Links"}
            </h4>
            <ul className="list-none space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#aaa] text-sm flex items-center gap-2 hover:text-primary hover:pl-1 transition-all"
                  >
                    <ChevronRight size={12} className="text-primary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu Links */}
          <div>
            <h4 className="text-white text-base font-semibold font-poppins mb-5 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[30px] after:h-[3px] after:bg-[#0051d5] after:rounded">
              {dict?.footer?.categories || "Categories"}
            </h4>
            <ul className="list-none space-y-3">
              {menuLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#aaa] text-sm flex items-center gap-2 hover:text-primary hover:pl-1 transition-all"
                  >
                    <ChevronRight size={12} className="text-primary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-base font-semibold font-poppins mb-5 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[30px] after:h-[3px] after:bg-primary after:rounded">
              {dict?.footer?.getInTouch || "Get In Touch"}
            </h4>
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-[38px] h-[38px] rounded-lg bg-[rgba(232,40,26,0.15)] flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <strong className="block text-[#ccc] text-[0.72rem] uppercase tracking-wider mb-0.5">
                      {item.label}
                    </strong>
                    <span className="text-white text-[0.83rem]">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[rgba(255,255,255,0.08)] py-5">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[0.8rem] text-[#777]">
          <p>
            &copy; {dict?.footer?.copyright || "2026 KhoUI. All Rights Reserved."}
          </p>
          <div className="flex gap-5">
            <Link href="#" className="text-[#777] hover:text-primary transition-colors">{dict?.footer?.privacyPolicy || "Privacy Policy"}</Link>
            <Link href="#" className="text-[#777] hover:text-primary transition-colors">{dict?.footer?.terms || "Terms"}</Link>
            <Link href="#" className="text-[#777] hover:text-primary transition-colors">{dict?.footer?.cookies || "Cookies"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
