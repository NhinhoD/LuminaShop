import Link from "next/link";
import { ROUTES } from "@/presentation/constants";
import { MapPin, Phone, Mail, Clock, ChevronRight, Globe, Camera, MessageCircle, Play } from "lucide-react";

export function Footer() {
  const quickLinks = [
    { label: "Home", href: ROUTES.HOME },
    { label: "Our Menu", href: ROUTES.SHOP },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const menuLinks = [
    { label: "Burgers", href: `${ROUTES.SHOP}?category=burgers` },
    { label: "Pizza", href: `${ROUTES.SHOP}?category=pizza` },
    { label: "Fried Chicken", href: `${ROUTES.SHOP}?category=chicken` },
    { label: "Wraps & Rolls", href: `${ROUTES.SHOP}?category=wraps` },
    { label: "Pasta", href: `${ROUTES.SHOP}?category=pasta` },
    { label: "Desserts", href: `${ROUTES.SHOP}?category=desserts` },
  ];

  const contactInfo = [
    { icon: MapPin, label: "Address", value: "42 Flavor Street, Manhattan, NY 10001" },
    { icon: Phone, label: "Phone", value: "+1 (800) 123-4567" },
    { icon: Mail, label: "Email", value: "hello@luminashop.com" },
    { icon: Clock, label: "Hours", value: "Wed - Sun: 09 AM - 11 PM" },
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
            <div className="font-playfair text-2xl font-black mb-4">
              Lumina<span className="text-primary">Shop</span>
            </div>
            <p className="text-[#999] text-sm leading-relaxed mb-6">
              We bring the world&apos;s finest flavors together in a fast, friendly, and affordable experience. Every meal crafted with love.
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
              Quick Links
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
            <h4 className="text-white text-base font-semibold font-poppins mb-5 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[30px] after:h-[3px] after:bg-primary after:rounded">
              Our Menu
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
              Get In Touch
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
            &copy; 2026 <span className="text-primary font-semibold">LuminaShop</span>. All Rights Reserved.
          </p>
          <div className="flex gap-5">
            <Link href="#" className="text-[#777] hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-[#777] hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="text-[#777] hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
