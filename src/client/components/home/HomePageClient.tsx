"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { ROUTES } from "@/shared/constants";
import { formatCurrency, resolveCleanPreviewUrl } from "@/shared/utils";
import { useI18n } from "@/client/components/common/I18nContext";
import { getLocalizedText } from "@/shared/utils/locale";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Product } from "@/server/domain/entities/Product";
import { Category } from "@/server/domain/entities/Category";
import {
  Zap,
  ShoppingCart,
  ArrowRight,
  Send,
  Lock,
  Code2,
  Cpu,
  Monitor,
  Layout,
  ExternalLink,
  Activity,
  Star,
  Box,
  FolderGit2,
} from "lucide-react";
import { toast } from "@/client/hooks/useToastStore";
import type { vi } from "@/i18n/dictionaries/vi";
import { PaginationControls } from "@/client/components/common/PaginationControls";
import { InteractiveDotGrid } from "@/client/components/common/InteractiveDotGrid";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomePageClientProps {
  readonly featuredProducts: readonly Product[];
  readonly totalProducts?: number;
  readonly initialPage?: number;
  readonly initialCategory?: string;
  readonly categories: readonly Category[];
  readonly dict?: typeof vi;
}

const MARQUEE_ITEMS = [
  "HTML5 & CSS3 Chuẩn W3C",
  "Bootstrap 5.3 Responsive",
  "JavaScript ES6+ Tối Ưu",
  "100% Tương Thích Di Động",
  "Cấu Trúc Tệp Gọn Gàng",
  "Không Cần Cài Đặt Môi Trường",
  "Thanh Toán VietQR Tự Động",
  "Tải Về File .ZIP Tức Thì",
];

const DEV_AVATARS = [
  { name: "Minh Tuấn", role: "Web Designer", company: "Tuấn Studio", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
  { name: "Hải Nam", role: "Frontend Dev", company: "Freelancer", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
  { name: "Thanh Hằng", role: "UI Designer", company: "Creative Hub", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
  { name: "Quốc Bảo", role: "Agency Founder", company: "Bảo Media", src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
];

const CURATED_SAMPLE_TEMPLATES = [
  {
    id: "sample-1",
    title: { vi: "E-Commerce Storefront Template", en: "E-Commerce Storefront Template" },
    description: {
      vi: "Mẫu giao diện bán hàng tĩnh HTML5, CSS3, Bootstrap 5 với bố cục giỏ hàng, lưới sản phẩm và trang thanh toán chuẩn responsive.",
      en: "Static e-commerce storefront template built with HTML5, CSS3, and Bootstrap 5 with clean product grids."
    },
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    price: 499000,
    techStack: ["HTML5", "CSS3", "Bootstrap 5", "JavaScript"],
    demoUrl: "https://demo.khoui.com/ecommerce",
    isFree: false
  },
  {
    id: "sample-2",
    title: { vi: "Admin Dashboard UI Kit", en: "Admin Dashboard UI Kit" },
    description: {
      vi: "Bộ giao diện quản trị tĩnh với bảng biểu, thẻ thống kê card, biểu đồ chart JS và menu sidebar co giãn mượt mà.",
      en: "Static admin dashboard UI kit with responsive tables, analytics widgets, chart layouts, and collapsible sidebar."
    },
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    price: 389000,
    techStack: ["HTML5", "Bootstrap 5", "Chart.js", "CSS3"],
    demoUrl: "https://demo.khoui.com/dashboard",
    isFree: false
  },
  {
    id: "sample-3",
    title: { vi: "Developer & Designer Portfolio", en: "Developer & Designer Portfolio" },
    description: {
      vi: "Mẫu portfolio cá nhân tĩnh với hiệu ứng cuộn mượt, giới thiệu kỹ năng, dự án tiêu biểu và form liên hệ tĩnh.",
      en: "Static portfolio template for designers and developers with smooth scrolling, skills showcase, and contact layout."
    },
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
    price: 0,
    techStack: ["HTML5", "CSS3", "JavaScript", "Responsive"],
    demoUrl: "https://demo.khoui.com/portfolio",
    isFree: true
  },
  {
    id: "sample-4",
    title: { vi: "Corporate Business Landing", en: "Corporate Business Landing" },
    description: {
      vi: "Mẫu trang web giới thiệu công ty, doanh nghiệp chuẩn Bootstrap 5 với phần giới thiệu dịch vụ, bảng giá và đánh giá.",
      en: "Corporate business landing page template built with Bootstrap 5 featuring services, pricing, and testimonials."
    },
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80",
    price: 550000,
    techStack: ["HTML5", "CSS3", "Bootstrap 5", "FontAwesome"],
    demoUrl: "https://demo.khoui.com/corporate",
    isFree: false
  },
  {
    id: "sample-5",
    title: { vi: "Creative Digital Studio Agency", en: "Creative Digital Studio Agency" },
    description: {
      vi: "Template giới thiệu dịch vụ sáng tạo, agency quảng cáo với phong cách hiện đại, hiệu ứng hover và typography đẹp mắt.",
      en: "Modern agency website template with sleek typography, interactive hover animations, and clean CSS layout."
    },
    imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1200&auto=format&fit=crop&q=80",
    price: 299000,
    techStack: ["HTML5", "CSS3", "JavaScript", "W3C Valid"],
    demoUrl: "https://demo.khoui.com/agency",
    isFree: false
  },
  {
    id: "sample-6",
    title: { vi: "Product & SaaS Landing Page", en: "Product & SaaS Landing Page" },
    description: {
      vi: "Trang đích giới thiệu sản phẩm phần mềm với cấu trúc tính năng, bảng so sánh giá và khối kêu gọi hành động CTA rõ ràng.",
      en: "Software and product landing page template featuring feature grids, pricing comparison, and clear CTAs."
    },
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    price: 320000,
    techStack: ["HTML5", "Bootstrap 5", "CSS3", "SEO Ready"],
    demoUrl: "https://demo.khoui.com/landing",
    isFree: false
  }
];

/**
 * High-End Subtle Kinetic 3D Tilt Card with Hairline Glass Borders and mouse spotlight effect.
 *
 * @param props - Component properties containing children and optional className.
 * @returns Rendered JSX element with 3D spring tilt animations.
 */
function KineticTiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 240, damping: 26 });
  const mouseYSpring = useSpring(y, { stiffness: 240, damping: 26 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
    setSpotlightPos({ x: mouseX, y: mouseY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setSpotlightPos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-all duration-200 ${className}`}
    >
      {/* Subtle Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 z-0"
        style={{
          opacity: spotlightPos.opacity,
          background: `radial-gradient(320px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(0, 81, 213, 0.05), transparent 80%)`,
        }}
      />
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Main Storefront Landing Page client component.
 * Provides interactive hero preview sandbox, category switching, paginated featured templates,
 * animated feature showcases, and customer testimonials.
 *
 * @param props - Landing page properties with featured products, categories, pagination, and translations.
 * @returns Rendered JSX element for the landing page.
 */
export default function HomePageClient({
  featuredProducts,
  totalProducts = featuredProducts.length,
  initialPage = 1,
  initialCategory = "all",
  categories,
  dict
}: HomePageClientProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const advantagesRef = useRef<HTMLElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);

  const [prevCategory, setPrevCategory] = useState(initialCategory);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  if (initialCategory !== prevCategory) {
    setPrevCategory(initialCategory);
    setActiveCategory(initialCategory);
  }

  const [prevPage, setPrevPage] = useState(initialPage);
  const [currentPage, setCurrentPage] = useState(initialPage);
  if (initialPage !== prevPage) {
    setPrevPage(initialPage);
    setCurrentPage(initialPage);
  }

  const ITEMS_PER_PAGE = 6;
  const [isPending, startTransition] = useTransition();
  const { locale } = useI18n();

  // 3D Motion values for Hero Sandbox Window
  const heroX = useMotionValue(0);
  const heroY = useMotionValue(0);
  const heroSpringX = useSpring(heroX, { stiffness: 180, damping: 24 });
  const heroSpringY = useSpring(heroY, { stiffness: 180, damping: 24 });
  const heroRotateX = useTransform(heroSpringY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const heroRotateY = useTransform(heroSpringX, [-0.5, 0.5], ["-5deg", "5deg"]);

  /**
   * Tracks mouse movement over the hero preview window to compute tilt transformation.
   *
   * @param e - Mouse event on the container.
   */
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    heroX.set((e.clientX - rect.left) / rect.width - 0.5);
    heroY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  /**
   * Resets the 3D tilt spring rotation when the mouse leaves the hero area.
   */
  const handleHeroMouseLeave = () => {
    heroX.set(0);
    heroY.set(0);
  };

  /**
   * Renders the primary hero title row with non-breaking whitespace to prevent typographic orphans.
   *
   * @returns JSX element or formatted string for the first hero heading line.
   */
  const renderHeroTitle1 = () => {
    const raw = dict?.home?.hero?.title1;
    if (
      raw &&
      raw !== "Sở Hữu Website Template Đỉnh Cao," &&
      raw !== "Sở Hữu Website Template Đỉnh Cao" &&
      raw !== "Own Top-Tier Website Templates," &&
      raw !== "Own Top-Tier Website Templates"
    ) {
      return raw.replace(/\s+([^\s]+)$/, "\u00A0$1");
    }
    if (locale === "vi") {
      return "Sở Hữu Website Template Đỉnh Cao,";
    }
    return (
      <>
        <span className="inline-block">Own Top-Tier</span>{" "}
        <span className="inline-block">Website Templates,</span>
      </>
    );
  };

  /**
   * Renders the secondary hero title row with localized and balanced word wrapping.
   *
   * @returns JSX element or formatted string for the second hero heading line.
   */
  const renderHeroTitle2 = () => {
    const raw = dict?.home?.hero?.title2;
    if (
      raw &&
      raw !== "Sẵn Sàng Triển Khai Cho Dự Án Đột Phá" &&
      raw !== "Sẵn Sàng Triển Khai Dự Án Đột Phá" &&
      raw !== "Production-Ready for Breakthrough Projects"
    ) {
      return raw.replace(/\s+([^\s]+)$/, "\u00A0$1");
    }
    if (locale === "vi") {
      return "Sẵn Sàng Triển Khai Dự Án Đột Phá";
    }
    return (
      <>
        <span className="inline-block">Production-Ready for</span>{" "}
        <span className="inline-block">Breakthrough Projects</span>
      </>
    );
  };

  const shouldShowSamples = activeCategory === "all" && totalProducts === 0 && featuredProducts.length === 0;
  const displayShowcaseProducts = (totalProducts > 0 || featuredProducts.length > 0)
    ? featuredProducts
    : shouldShowSamples
      ? (CURATED_SAMPLE_TEMPLATES as unknown as Product[])
      : [];

  const totalCount = totalProducts > 0 ? totalProducts : displayShowcaseProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = displayShowcaseProducts;

  /**
   * Navigates to a specific page index in the showcase grid.
   *
   * @param newPage - Target page index (1-based).
   */
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === safeCurrentPage) return;
    setCurrentPage(newPage);
    startTransition(() => {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== "all") {
        params.set("category", activeCategory);
      }
      params.set("page", newPage.toString());
      router.push(`/?${params.toString()}#showcase`, { scroll: false });
    });
    if (showcaseRef.current) {
      const rect = showcaseRef.current.getBoundingClientRect();
      if (rect.top < 0 || rect.top > window.innerHeight / 2) {
        showcaseRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  /**
   * Selects an active category filter and resets showcase pagination to page 1.
   *
   * @param categoryFilter - Category slug identifier or 'all'.
   */
  const handleCategorySelect = (categoryFilter: string) => {
    setActiveCategory(categoryFilter);
    setCurrentPage(1);
    startTransition(() => {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== "all") {
        params.set("category", categoryFilter);
      }
      params.set("page", "1");
      const qs = params.toString();
      router.push(qs ? `/?${qs}#showcase` : "/#showcase", { scroll: false });
    });
  };

  const testimonials = [
    {
      author: "Nguyễn Minh Tuấn",
      role: "Freelance Web Developer",
      company: "Tuấn Studio",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      content: locale === "vi"
        ? "Mẫu template HTML5/CSS3 tổ chức cực kỳ khoa học. Mình chỉ cần tải file .zip về, thay ảnh và text là hoàn thiện website giới thiệu dịch vụ cho khách hàng ngay trong ngày."
        : "The HTML5/CSS3 template is exceptionally well-structured. Downloaded the .zip, changed text and images, and delivered a client site within a single day.",
      rating: 5,
      tech: "HTML5 + Bootstrap 5"
    },
    {
      author: "Lê Hoàng Hải",
      role: "Frontend Designer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "DesignVN Agency",
      content: locale === "vi"
        ? "Giao diện Bootstrap 5 responsive rất mượt, các class CSS rõ ràng và không bị thừa thãi code rác. Đem ghép vào theme WordPress hay Laravel cực kỳ nhàn."
        : "Bootstrap 5 responsiveness is flawless. CSS classes are concise with zero bloat. Converting into WordPress or Laravel themes was effortless.",
      rating: 5,
      tech: "CSS3 + JavaScript"
    },
    {
      author: "Trần Mai Anh",
      role: "Agency Founder",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      company: "Nova Media",
      content: locale === "vi"
        ? "Thanh toán VietQR xong là tải được ngay file .zip trong 3 giây. Mở file index.html lên là chạy trực tiếp trên trình duyệt, không cần cài đặt node_modules hay server phức tạp."
        : "VietQR payment unlocked the .zip download in 3 seconds. Double-clicked index.html and it worked immediately without npm or server setup.",
      rating: 5,
      tech: "Instant .ZIP Delivery"
    }
  ];

  const journeySteps = [
    {
      step: "01",
      title: dict?.home?.journey?.step1Title || (locale === "vi" ? "Lựa chọn Template" : "Select Template"),
      desc: dict?.home?.journey?.step1Desc || (locale === "vi" ? "Xem Live Demo trực quan mẫu giao diện từ Landing Page, Giới thiệu công ty đến Portfolio." : "Preview live demos across landing pages, corporate templates, and portfolios."),
    },
    {
      step: "02",
      title: dict?.home?.journey?.step2Title || (locale === "vi" ? "Thanh toán VietQR tức thì" : "Instant VietQR Checkout"),
      desc: dict?.home?.journey?.step2Desc || (locale === "vi" ? "Quét mã VietQR tiện lợi. Hệ thống tự động xác nhận đơn hàng trong vài giây." : "Scan VietQR effortlessly. Automated webhook validates orders in seconds."),
    },
    {
      step: "03",
      title: dict?.home?.journey?.step3Title || (locale === "vi" ? "Tải File Tĩnh & Sử Dụng" : "Download & Customize"),
      desc: dict?.home?.journey?.step3Desc || (locale === "vi" ? "Nhận trọn bộ file .zip gồm HTML, CSS, JavaScript, hình ảnh demo và mở trực tiếp trên trình duyệt." : "Receive full unencrypted .zip containing HTML, CSS, JS, and assets ready to open in any browser."),
    },
  ];

  const displayCategories = [
    {
      name: dict?.home?.categories?.all || (locale === "vi" ? "Tất cả" : "All"),
      filter: "all",
      count: dict?.home?.categories?.premiumAndFree || (locale === "vi" ? "Kho giao diện" : "Full Catalog"),
      icon: Layout
    },
    ...categories.map(cat => {
      let icon = Monitor;
      if (cat.slug === 'e-commerce') icon = ShoppingCart;
      else if (cat.slug === 'admin-dashboard') icon = Cpu;
      else if (cat.slug === 'portfolio') icon = Code2;
      return {
        name: getLocalizedText(cat.name as unknown as Record<string, string>, locale),
        filter: cat.id,
        count: cat.productCount != null ? `${cat.productCount} templates` : (dict?.home?.categories?.premium || "Premium"),
        icon: icon
      };
    })
  ];

  // GSAP Animations with Clean Up
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Top Global Scroll Progress Bar
      gsap.to("#gsap-scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.15,
        },
      });

      // 2. Magnetic Physics on CTA Buttons (gsap.quickTo)
      const magneticElements = containerRef.current?.querySelectorAll<HTMLElement>(".magnetic-btn");
      magneticElements?.forEach((btn) => {
        const xTo = gsap.quickTo(btn, "x", { duration: 0.35, ease: "power3.out" });
        const yTo = gsap.quickTo(btn, "y", { duration: 0.35, ease: "power3.out" });

        const handleMouseMove = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const relX = e.clientX - (rect.left + rect.width / 2);
          const relY = e.clientY - (rect.top + rect.height / 2);
          xTo(relX * 0.28);
          yTo(relY * 0.28);
        };

        const handleMouseLeave = () => {
          xTo(0);
          yTo(0);
        };

        btn.addEventListener("mousemove", handleMouseMove);
        btn.addEventListener("mouseleave", handleMouseLeave);
      });

      // 3. Live Animated Metric Counters
      const counters = containerRef.current?.querySelectorAll(".hero-counter");
      counters?.forEach((counter) => {
        const targetVal = parseInt(counter.getAttribute("data-target") || "0", 10);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: targetVal,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: counter,
            start: "top 92%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            counter.textContent = Math.floor(obj.val).toLocaleString();
          },
        });
      });


      // 6. Parallax Scrub on Right-Column 3D Mockup Container (Both devices and floor shadow move in unison with page scroll)
      gsap.to(".hero-mockup-container", {
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      // 7. Kinetic Hero Entry Timeline with 3D Perspective Rotation (Snappy, Premium Entrance)
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .fromTo(".hero-badge", { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.3 })
        .fromTo(
          ".hero-title-1",
          { opacity: 0, y: 16, rotateX: 10, transformOrigin: "bottom center" },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.35 },
          "-=0.2"
        )
        .fromTo(
          ".hero-title-2",
          { opacity: 0, y: 14, rotateX: 10, transformOrigin: "bottom center" },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.35 },
          "-=0.25"
        )
        .fromTo(".hero-desc", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, "-=0.2")
        .fromTo(".hero-cta", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, "-=0.2")
        .fromTo(".hero-social-proof", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25 }, "-=0.2")
        .fromTo(".hero-stats-item", { opacity: 0, y: 10, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, stagger: 0.04 }, "-=0.2");

      // 8. ScrollTrigger for Categories Grid
      if (categoriesRef.current) {
        gsap.fromTo(
          categoriesRef.current.querySelectorAll(".cat-card"),
          { opacity: 0, y: 26, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.06,
            ease: "power3.out",
            scrollTrigger: { trigger: categoriesRef.current, start: "top 85%", toggleActions: "play none none none" },
          }
        );
      }

      // 9. ScrollTrigger for Bento Grid Advantages Cards
      if (advantagesRef.current) {
        gsap.fromTo(
          advantagesRef.current.querySelectorAll(".bento-card"),
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: advantagesRef.current, start: "top 80%", toggleActions: "play none none none" },
          }
        );
      }

      // 10. ScrollTrigger for Showcase Product Cards with Parallax Image Movement
      if (showcaseRef.current) {
        const prodCards = showcaseRef.current.querySelectorAll(".prod-card");
        gsap.fromTo(
          prodCards,
          { opacity: 0, y: 45, rotateX: 6 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.65,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: { trigger: showcaseRef.current, start: "top 80%", toggleActions: "play none none none" },
          }
        );
      }

      // 11. ScrollTrigger for Testimonials with Floating Wave
      if (testimonialsRef.current) {
        const testiCards = testimonialsRef.current.querySelectorAll(".testi-card");
        gsap.fromTo(
          testiCards,
          { opacity: 0, y: 30, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: testimonialsRef.current, start: "top 82%", toggleActions: "play none none none" },
          }
        );

        // Continuous subtle float on testimonial cards
        testiCards.forEach((card, idx) => {
          gsap.to(card, {
            y: -6,
            duration: 3.5 + idx * 0.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: idx * 0.2,
          });
        });
      }

      // 12. Connected Workflow Stepper (Scroll Line + Sequential Card Reveal)
      if (journeyRef.current) {
        gsap.fromTo(
          journeyRef.current.querySelectorAll(".jr-step"),
          { opacity: 0, y: 24, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.12,
            ease: "back.out(1.2)",
            scrollTrigger: { trigger: journeyRef.current, start: "top 82%", toggleActions: "play none none none" },
          }
        );

        gsap.fromTo(
          ".journey-progress-line",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            transformOrigin: "left center",
            scrollTrigger: {
              trigger: journeyRef.current,
              start: "top 72%",
              end: "bottom 75%",
              scrub: 0.8,
            },
          }
        );
      }

      // 13. Staggered reveal for all Section Headers
      const sectionHeaders = containerRef.current?.querySelectorAll(".section-header");
      sectionHeaders?.forEach((header) => {
        gsap.fromTo(
          header.children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: header,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
      });

      // 14. Hero exit parallax scrub (smoothly fades and pushes hero up on scroll)
      const heroSection = containerRef.current?.querySelector(".hero-section");
      if (heroSection) {
        gsap.to(".hero-inner", {
          yPercent: 15,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: true,
          }
        });
      }

    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="isolate text-slate-900 font-sans selection:bg-primary/10 selection:text-primary relative">

      {/* ─── GSAP Global Scroll Progress Bar ─── */}
      <div
        id="gsap-scroll-progress"
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-cyan-400 to-indigo-600 origin-left z-50 pointer-events-none scale-x-0"
      />

      {/* ══════════ UNIFIED PAGE BACKGROUND ══════════ */}
      {/* Fixed to viewport — consistent with the fixed canvas, no scroll conflict. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none select-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* 1. Soft blue-to-white gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#e8f2ff] via-white to-[#f0ebff]" />

        {/* 2. Unified Texture Image (blended) */}
        <div className="absolute inset-0 z-[1] pointer-events-none select-none">
          <Image
            src="/images/NewUI.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-30 mix-blend-multiply"
          />
        </div>

        {/* 3. Dot grid – interactive canvas (dots scatter on mouse hover, rendering ON TOP of texture) */}
        <InteractiveDotGrid />
        {/* 3. Top-left aurora blob */}
        <div className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full bg-blue-300/20 blur-[90px]" />
        {/* 4. Upper-right lavender accent */}
        <div className="absolute -top-20 right-0 w-[480px] h-[480px] rounded-full bg-indigo-200/20 blur-[80px]" />
        {/* 5. Mid-page sky bloom */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[900px] h-[340px] rounded-full bg-sky-100/40 blur-[80px]" />
        {/* 6. Lower-left warm accent */}
        <div className="absolute bottom-[20%] -left-20 w-[500px] h-[400px] rounded-full bg-blue-200/15 blur-[100px]" />
        {/* 7. Bottom-right purple drift */}
        <div className="absolute bottom-0 right-0 w-[560px] h-[400px] rounded-full bg-violet-200/20 blur-[90px]" />
      </div>

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="hero-section relative z-[10] min-h-[70vh] flex items-center pt-12 pb-12 overflow-hidden border-b border-slate-100/60">
        {/* Hero content goes here */}

        <div className="hero-inner max-w-[1360px] mx-auto px-6 sm:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center">

            {/* Left Column: Headline & Content (Subtly elevated for optimal visual alignment with 3D device mockup) */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-5 pr-0 xl:pr-4 lg:-translate-y-8 xl:-translate-y-12 2xl:-translate-y-14">

              {/* Subtle Status Pill */}
              <div className="hero-badge inline-flex items-center gap-2 bg-slate-50 border border-slate-200/70 text-slate-700 rounded-full px-3 py-1 text-xs font-medium shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {locale === "vi" ? "Kho Mẫu Template Website Tĩnh" : "Curated Static Web Template Marketplace"}
                </span>
                <span className="text-slate-400 text-[11px] pl-1.5 border-l border-slate-200">v2.4</span>
              </div>

              {/* Refined, Balanced Headline with 3D Kinetic Split */}
              <h1 className="hero-title text-2xl sm:text-4xl lg:text-[1.85rem] xl:text-[2.1rem] 2xl:text-[2.35rem] font-extrabold leading-[1.2] lg:leading-[1.18] text-slate-900 tracking-[-0.03em] perspective-[1000px] text-balance">
                <span className="hero-title-1 block xl:whitespace-nowrap">
                  {renderHeroTitle1()}
                </span>
                <span className="hero-title-2 block mt-1.5 lg:mt-2 text-primary xl:whitespace-nowrap">
                  {renderHeroTitle2()}
                </span>
              </h1>

              <p className="hero-desc text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed max-w-xl">
                {dict?.home?.hero?.desc || (locale === "vi" ? "Bộ sưu tập mẫu website tĩnh (HTML5, CSS3, JS, Bootstrap) thiết kế hiện đại, cấu trúc code sạch sẽ, chuẩn Responsive 100%. Dễ dàng chỉnh sửa và sẵn sàng ghép vào mọi nền tảng web của bạn." : "Curated collection of static website templates (HTML5, CSS3, JavaScript, Bootstrap) with modern aesthetics, clean code structure, and 100% responsive layouts. Ready to customize and integrate into any project.")}
              </p>

              {/* Action Buttons with Magnetic GSAP Physics */}
              <div className="hero-cta flex flex-wrap gap-3 pt-1">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Link
                    href={ROUTES.SHOP}
                    className="magnetic-btn inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-xs text-xs"
                  >
                    <span>{dict?.home?.hero?.cta1 || (locale === "vi" ? "Khám phá Template" : "Explore Templates")}</span>
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <a
                    href="#advantages"
                    className="magnetic-btn inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 px-5 py-3 rounded-lg font-medium transition-colors text-xs"
                  >
                    <Code2 size={14} className="text-slate-500" />
                    <span>{locale === "vi" ? "Cấu trúc File tĩnh" : "File Structure"}</span>
                  </a>
                </motion.div>
              </div>

              {/* Developer Social Proof Pile */}
              <div className="hero-social-proof flex items-center gap-3.5 pt-2">
                <div className="flex -space-x-2 overflow-hidden">
                  {DEV_AVATARS.map((avatar, idx) => (
                    <div
                      key={idx}
                      className="inline-block relative w-8 h-8 rounded-full ring-2 ring-white overflow-hidden shadow-2xs"
                      title={`${avatar.name} (${avatar.company})`}
                    >
                      <Image
                        src={avatar.src}
                        alt={avatar.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1 text-slate-800 font-semibold">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={11} fill="currentColor" />
                      ))}
                    </div>
                    <span className="ml-1">4.9/5</span>
                  </div>
                  <span className="text-slate-500 font-normal text-[11.5px]">
                    {locale === "vi" ? "1,240+ lập trình viên & web designers tin dùng" : "Trusted by 1,240+ developers & web designers"}
                  </span>
                </div>
              </div>

              {/* Metrics Bar with Animated Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
                {[
                  { target: 50, prefix: "", suffix: "+ mẫu", label: locale === "vi" ? "Mẫu giao diện" : "Curated Templates" },
                  { target: 99, prefix: "", suffix: "/100", label: locale === "vi" ? "Tốc độ tải trang" : "Lighthouse Speed" },
                  { target: 1240, prefix: "", suffix: "+", label: locale === "vi" ? "Khách hàng tin cậy" : "Trusted Clients" },
                  { target: 100, prefix: "", suffix: "%", label: locale === "vi" ? "File tĩnh trọn bộ" : "Full .ZIP Archive" },
                ].map((stat) => (
                  <div key={stat.label} className="hero-stats-item">
                    <span className="text-xl font-bold text-slate-900 block tracking-tight font-mono">
                      {stat.prefix}
                      <span className="hero-counter" data-target={stat.target}>
                        {stat.target}
                      </span>
                      <span className="text-primary text-xs ml-0.5 font-sans font-normal">{stat.suffix}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal block mt-0.5">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: 3D Isometric Device Ecosystem & Animated Floating Badges (IMG_1 & IMG_4 Compliance) */}
            <div
              className="lg:col-span-6 xl:col-span-6 relative hidden lg:block perspective-[1400px]"
              onMouseMove={handleHeroMouseMove}
              onMouseLeave={handleHeroMouseLeave}
            >
              {/* ─── Luminous Ambient Backlight (Seamless, zero box borders) ─── */}
              <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_55%_45%,rgba(56,189,248,0.08)_0%,transparent_65%)] blur-3xl pointer-events-none" />

              {/* Subtle Tech Diamond Sparkles (IMG_1 Accent) */}
              <div className="absolute -top-4 right-10 w-6 h-6 text-sky-400/40 pointer-events-none select-none">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9Z" />
                </svg>
              </div>
              <div className="absolute bottom-6 right-2 w-8 h-8 text-sky-400/35 pointer-events-none select-none animate-pulse">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9Z" />
                </svg>
              </div>
              <div className="absolute top-1/3 -left-4 w-5 h-5 text-blue-400/30 pointer-events-none select-none">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9Z" />
                </svg>
              </div>

              {/* ─── Mockup Container with Independent Floor Shadow Layer & 3D Tilting Devices ─── */}
              <div className="hero-mockup-container relative w-full aspect-[1500/1720] max-w-[480px] xl:max-w-[510px] ml-auto select-none">

                {/* ─── LAYER 0: Authentic Ground Shadow (Fixed on floor plane, underneath devices) ─── */}
                <div
                  className="hero-ground-shadow-layer absolute inset-0 w-full h-full pointer-events-none z-0"
                  aria-hidden="true"
                >
                  <Image
                    src="/hero/hero-ground-shadow.png"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 580px, 660px"
                    className="object-contain"
                  />
                </div>

                {/* ─── LAYER 1: 3D Tilting Device Mockup (Hovers & tilts in 3D above the floor shadow) ─── */}
                <motion.div
                  style={{
                    rotateX: heroRotateX,
                    rotateY: heroRotateY,
                    transformStyle: "preserve-3d",
                  }}
                  className="hero-mockup-wrapper relative z-10 w-full h-full"
                >
                  {/* 3D Master Mockup with 100% Transparent Background */}
                  <div className="hero-mockup-base-img absolute inset-0 w-full h-full">
                    <Image
                      src="/hero/hero-devices-clean.png"
                      alt="KhoUI 3D Device Ecosystem Mockup"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 580px, 660px"
                      className="object-contain"
                    />
                  </div>

                  {/* ─── 3D Dynamic Orbital Particle System 1: Left Orbit (Circling the Tablet) ─── */}
                  <div
                    className="absolute left-[17.0%] top-[23.1%] pointer-events-none z-20"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Ethereal Ambient Aura along 3D Light Streak */}
                    <div className="absolute -inset-8 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

                    {/* 3D Animated Primary Orbiting Blue Sphere 1 */}
                    <motion.div
                      animate={{
                        x: [-10, 16, 36, 16, -10],
                        y: [14, -12, -34, -8, 14],
                        scale: [0.95, 1.25, 0.95, 0.8, 0.95],
                        opacity: [0.92, 1, 0.88, 0.72, 0.92],
                        z: [20, 48, 12, -14, 20],
                      }}
                      transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative flex items-center justify-center pointer-events-auto cursor-pointer"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Pulsing Outer Energy Aura */}
                      <div className="absolute -inset-2 rounded-full bg-cyan-400/30 blur-sm animate-ping pointer-events-none" />
                      {/* 3D Photorealistic Blue Core Orb */}
                      <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,#93c5fd_25%,#2563eb_60%,#0f172a_100%)] shadow-[0_0_20px_#2563eb,0_0_40px_rgba(56,189,248,0.7),inset_-2px_-2px_5px_#091124,inset_2px_2px_4px_rgba(255,255,255,0.95)] ring-1.5 ring-cyan-200/90">
                        <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-white blur-[0.2px] opacity-100" />
                      </div>
                    </motion.div>

                    {/* Trailing Amber Satellite Spark */}
                    <motion.div
                      animate={{
                        x: [-4, 20, 40, 20, -4],
                        y: [20, -6, -28, -2, 20],
                        scale: [0.85, 1.15, 0.8, 0.7, 0.85],
                        opacity: [0.75, 1, 0.65, 0.5, 0.75],
                      }}
                      transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3,
                      }}
                      className="absolute -top-3 -left-3 pointer-events-none"
                    >
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 shadow-[0_0_16px_#f59e0b,0_0_32px_rgba(245,158,11,0.8)] ring-1 ring-amber-200" />
                    </motion.div>
                  </div>

                  {/* ─── 3D Dynamic Orbital Particle System 2: Right Orbit (Circling the Pedestal Loop) ─── */}
                  <div
                    className="absolute left-[75.7%] top-[69.3%] pointer-events-none z-20"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Ethereal Glow along 3D Pedestal Ring */}
                    <div className="absolute -inset-10 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                    {/* 3D Animated Primary Orbiting Sphere 2 (Cycling in Depth around Pedestal) */}
                    <motion.div
                      animate={{
                        x: [0, 44, 76, 36, -42, -26, 0],
                        y: [0, 12, -8, -30, -20, 6, 0],
                        scale: [1.1, 1.3, 1.08, 0.75, 0.7, 0.95, 1.1],
                        opacity: [0.95, 1, 0.92, 0.65, 0.6, 0.9, 0.95],
                        z: [30, 50, 22, -26, -30, 16, 30],
                      }}
                      transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative flex items-center justify-center pointer-events-auto cursor-pointer"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Pulsing Cyan Energy Wave */}
                      <div className="absolute -inset-2.5 rounded-full bg-cyan-400/30 blur-sm animate-ping pointer-events-none" />
                      {/* 3D Glass Planet Sphere */}
                      <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[radial-gradient(circle_at_28%_28%,#ffffff_0%,#bfdbfe_20%,#3b82f6_55%,#1d4ed8_80%,#091124_100%)] shadow-[0_0_24px_rgba(0,81,213,0.95),0_0_48px_rgba(56,189,248,0.7),inset_-3px_-3px_8px_#050b14,inset_3px_3px_6px_#ffffff] ring-1.5 ring-cyan-200">
                        <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-white blur-[0.3px] opacity-100" />
                      </div>
                    </motion.div>

                    {/* Trailing White Satellite Sparkle */}
                    <motion.div
                      animate={{
                        x: [-6, 38, 70, 30, -46, -32, -6],
                        y: [-4, 8, -12, -34, -24, 2, -4],
                        scale: [1.05, 1.18, 0.95, 0.68, 0.62, 0.88, 1.05],
                        opacity: [0.9, 1, 0.85, 0.55, 0.5, 0.85, 0.9],
                      }}
                      transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.35,
                      }}
                      className="absolute -top-2 -left-2 pointer-events-none"
                    >
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shadow-[0_0_14px_#ffffff,0_0_28px_#38bdf8] ring-1 ring-cyan-100" />
                    </motion.div>

                    {/* Ambient Amber Spark Accent */}
                    <motion.div
                      animate={{
                        x: [12, -32, -48, 8, 52, 22, 12],
                        y: [6, -16, 6, 20, -6, 6, 6],
                        scale: [0.9, 0.7, 1.1, 1.2, 0.85, 0.9, 0.9],
                        opacity: [0.8, 0.5, 0.9, 1, 0.7, 0.8, 0.8],
                      }}
                      transition={{
                        duration: 8.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute top-2 left-4 pointer-events-none"
                    >
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 shadow-[0_0_16px_#f59e0b,0_0_32px_rgba(245,158,11,0.8)] ring-1 ring-amber-200" />
                    </motion.div>
                  </div>

                  {/* ─── 5 Dynamic Floating Precision Glass Badges (IMG_1 Compliance) ─── */}
                  {/* Badge 1: Clean Architecture (Top-Left - Over First Dashboard Card) */}
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 4.0, repeat: Infinity, ease: "easeInOut" }}
                    whileHover={{ scale: 1.07, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="hero-badge-float-1 absolute top-[5%] left-[13%] w-[27%] cursor-pointer z-30 filter drop-shadow-[0_12px_24px_rgba(15,23,42,0.08)] drop-shadow-[0_4px_8px_rgba(15,23,42,0.04)] hover:drop-shadow-[0_20px_32px_rgba(0,81,213,0.22)] transition-shadow duration-300"
                    style={{ transformStyle: "preserve-3d", z: 45 }}
                  >
                    <Image
                      src="/hero/badge-clean-architecture.png"
                      alt="Cấu trúc File Chuẩn"
                      width={776}
                      height={212}
                      className="w-full h-auto select-none pointer-events-none"
                    />
                  </motion.div>

                  {/* Badge 2: High Performance (Top-Right - Over Top-Right Dashboard Card) */}
                  <motion.div
                    animate={{ y: [6, -6, 6] }}
                    transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    whileHover={{ scale: 1.07, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="hero-badge-float-2 absolute top-[8%] left-[60%] w-[26%] cursor-pointer z-30 filter drop-shadow-[0_12px_24px_rgba(15,23,42,0.08)] drop-shadow-[0_4px_8px_rgba(15,23,42,0.04)] hover:drop-shadow-[0_20px_32px_rgba(16,185,129,0.22)] transition-shadow duration-300"
                    style={{ transformStyle: "preserve-3d", z: 35 }}
                  >
                    <Image
                      src="/hero/badge-high-performance.png"
                      alt="High Performance 99/100"
                      width={776}
                      height={243}
                      className="w-full h-auto select-none pointer-events-none"
                    />
                  </motion.div>

                  {/* Badge 3: GSAP 60 FPS (Middle-Right - Next to Laptop Screen) */}
                  <motion.div
                    animate={{ y: [-7, 7, -7] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    whileHover={{ scale: 1.07, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="hero-badge-float-3 absolute top-[44%] left-[72%] w-[24%] cursor-pointer z-30 filter drop-shadow-[0_12px_24px_rgba(15,23,42,0.08)] drop-shadow-[0_4px_8px_rgba(15,23,42,0.04)] hover:drop-shadow-[0_20px_32px_rgba(249,115,22,0.22)] transition-shadow duration-300"
                    style={{ transformStyle: "preserve-3d", z: 50 }}
                  >
                    <Image
                      src="/hero/badge-gsap.png"
                      alt="GSAP 60 FPS"
                      width={618}
                      height={212}
                      className="w-full h-auto select-none pointer-events-none"
                    />
                  </motion.div>

                  {/* Badge 4: Tailwind CSS & Next.js (Bottom-Left - Over Lower Pedestal/Tablet) */}
                  <motion.div
                    animate={{ y: [5, -5, 5] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                    whileHover={{ scale: 1.07, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="hero-badge-float-4 absolute top-[68%] left-[16%] w-[28%] cursor-pointer z-30 filter drop-shadow-[0_12px_24px_rgba(15,23,42,0.08)] drop-shadow-[0_4px_8px_rgba(15,23,42,0.04)] hover:drop-shadow-[0_20px_32px_rgba(6,182,212,0.22)] transition-shadow duration-300"
                    style={{ transformStyle: "preserve-3d", z: 55 }}
                  >
                    <Image
                      src="/hero/badge-tailwind-nextjs.png"
                      alt="Tailwind CSS & Next.js"
                      width={823}
                      height={229}
                      className="w-full h-auto select-none pointer-events-none"
                    />
                  </motion.div>

                  {/* Badge 5: VietQR Instant Pay (Bottom-Right - Over Lower Right Pedestal Floor) */}
                  <motion.div
                    animate={{ y: [-6, 6, -6] }}
                    transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                    whileHover={{ scale: 1.07, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="hero-badge-float-5 absolute top-[74%] left-[65%] w-[27%] cursor-pointer z-30 filter drop-shadow-[0_12px_24px_rgba(15,23,42,0.08)] drop-shadow-[0_4px_8px_rgba(15,23,42,0.04)] hover:drop-shadow-[0_20px_32px_rgba(239,68,68,0.22)] transition-shadow duration-300"
                    style={{ transformStyle: "preserve-3d", z: 40 }}
                  >
                    <Image
                      src="/hero/badge-vietqr.png"
                      alt="VietQR Instant Pay"
                      width={749}
                      height={211}
                      className="w-full h-auto select-none pointer-events-none"
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════ REFINED TICKER ══════════ */}
      <div className="relative z-[10] bg-slate-900 py-5 overflow-hidden border-y border-slate-800/40 text-[13px] font-sans">
        <div className="flex gap-8 whitespace-nowrap animate-[marquee-scroll_28s_linear_infinite]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div key={`${item}-${i}`} className="inline-flex items-center gap-2.5 text-slate-400 font-medium select-none">
              <span className="text-primary text-xs">•</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ BENTO GRID (ENGINEERING SPECS) ══════════ */}
      <section id="advantages" ref={advantagesRef} className="py-20 relative z-[10]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">

          <div className="section-header text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
              {locale === "vi" ? "Cấu trúc & Tiêu chuẩn Template" : "Template Structure & Standards"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {locale === "vi" ? "Template Tối Ưu Cho Web Designer & Lập Trình Viên" : "Engineered for Web Designers & Frontend Developers"}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-lg mx-auto font-normal">
              {locale === "vi"
                ? "Loại bỏ hoàn toàn cài đặt rườm rà. Bạn nhận trọn bộ file tĩnh HTML, CSS, JavaScript sạch sẽ, dễ dàng nhúng vào bất kỳ dự án hay CMS nào."
                : "Zero setup overhead. Receive clean HTML, CSS, and JavaScript files ready to embed into any web project or CMS."}
            </p>
          </div>

          {/* Asymmetric Bento Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">

            {/* Card 1: Large Bento (Directory Structure) */}
            <KineticTiltCard className="bento-card md:col-span-8 bg-slate-900 text-white rounded-2xl p-7 sm:p-9 border border-slate-800/60 overflow-hidden shadow-lg">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
                  <Code2 size={13} />
                  <span>File Structure</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {locale === "vi" ? "Cấu Trúc Tệp Tĩnh Khoa Học & Dễ Tùy Biến" : "Clean & Modular Static File Architecture"}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl font-normal">
                  {locale === "vi"
                    ? "Tách biệt rõ ràng giữa file HTML semantic, bảng định dạng CSS/Bootstrap, hiệu ứng JavaScript và thư mục hình ảnh assets. Dễ dàng đổi logo, màu sắc, chữ và ghép nối vào bất kỳ hệ thống CMS nào."
                    : "Clear separation between semantic HTML, modular CSS/Bootstrap, interactive JavaScript, and assets. Easily modify colors, text, and images or integrate into any CMS."}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-5 mt-5 border-t border-slate-800/60">
                {[
                  { layer: "index.html", tech: "HTML5 Semantic", path: "Chuẩn SEO On-page" },
                  { layer: "assets/css/", tech: "CSS3 & Bootstrap", path: "100% Responsive" },
                  { layer: "assets/js/", tech: "JavaScript ES6+", path: "Tương tác mượt mà" },
                  { layer: "assets/images/", tech: "Media & Icons", path: "Nén tối ưu dung lượng" },
                ].map((item) => (
                  <div key={item.layer} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/40">
                    <span className="text-xs font-semibold text-white block">{item.layer}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.tech}</span>
                    <span className="text-[9px] font-mono text-primary block mt-1">{item.path}</span>
                  </div>
                ))}
              </div>
            </KineticTiltCard>

            {/* Card 2: VietQR Automated Fulfillment */}
            <KineticTiltCard className="bento-card md:col-span-4 bg-white shadow-sm border border-slate-100/60 rounded-2xl p-7 hover:shadow-md hover:border-slate-200 transition-all">
              <div>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Zap size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {locale === "vi" ? "Thanh Toán & Tải Về Tức Thì" : "Instant VietQR Automated Delivery"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {locale === "vi"
                    ? "Tích hợp PayOS Webhook tự động. Sau khi quét mã VietQR, hệ thống cấp quyền tải file .zip trọn bộ tức thì."
                    : "Automated PayOS Webhook integration. Instantly unlocks template .zip download upon QR scan."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-5 text-[11px]">
                <span className="text-slate-500 font-normal">Trạng thái</span>
                <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">200 OK Auto-Hook</span>
              </div>
            </KineticTiltCard>

            {/* Card 3: Performance & Core Web Vitals */}
            <KineticTiltCard className="bento-card md:col-span-6 bg-white shadow-sm border border-slate-100/60 rounded-2xl p-7 hover:shadow-md hover:border-slate-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Activity size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">
                    {locale === "vi" ? "Tốc Độ Tải Siêu Nhanh & Nhẹ Nhàng" : "Instant Loading & Ultra Lightweight"}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm font-normal">
                    {locale === "vi"
                      ? "File tĩnh thuần túy không cần server runtime phức tạp, mở lên tức thì dưới 0.1s và đạt điểm tối đa trên mọi công cụ đo kiểm."
                      : "Pure static files with zero runtime overhead, rendering in under 0.1s with top performance scores."}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center font-bold">
                  <span className="text-sm text-emerald-400 font-mono">99</span>
                  <span className="text-[10px] tracking-wide text-slate-400 font-normal">Score</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-5">
                <span>Chỉ số đo lường</span>
                <span className="font-medium text-slate-800">CLS: 0.00 • LCP: 0.3s • FCP: 0.2s</span>
              </div>
            </KineticTiltCard>

            {/* Card 4: Full Unencrypted .ZIP Package */}
            <KineticTiltCard className="bento-card md:col-span-6 bg-white shadow-sm border border-slate-100/60 rounded-2xl p-7 hover:shadow-md hover:border-slate-200 transition-all">
              <div>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <FolderGit2 size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {locale === "vi" ? "Trọn Bộ File Tĩnh Không Mã Hóa" : "100% Unencrypted Static Archive"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm font-normal">
                  {locale === "vi"
                    ? "Tải về trọn bộ file .zip gồm mã nguồn HTML, CSS, JavaScript và tài liệu hướng dẫn. Tự do chỉnh sửa và sử dụng cho dự án của bạn."
                    : "Download complete .zip containing HTML, CSS, JavaScript and documentation. Total freedom to customize and reuse."}
                </p>
              </div>

              {/* Static File Tree Preview */}
              <div className="mt-4 bg-slate-900 rounded-lg p-2.5 font-mono text-[11px] text-slate-300 leading-relaxed border border-slate-800 select-none">
                <div className="text-emerald-400 font-semibold mb-1">📦 template-package.zip</div>
                <div className="text-slate-400 pl-2">├── 📄 index.html &amp; other pages...</div>
                <div className="text-slate-400 pl-2">├── 📁 assets/css/ (style.css, bootstrap.min.css)</div>
                <div className="text-slate-400 pl-2">├── 📁 assets/js/ (main.js, plugins.js)</div>
                <div className="text-slate-400 pl-2">└── 📁 assets/images/ (optimized demo assets)</div>
              </div>
            </KineticTiltCard>

          </div>

        </div>
      </section>

      {/* ══════════ CATEGORIES NAVIGATION ══════════ */}
      <section ref={categoriesRef} className="relative z-[10] py-14 border-t border-white/40">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">

          <div className="section-header text-center max-w-2xl mx-auto mb-10 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {locale === "vi" ? "Danh mục giao diện" : "Template Catalog"}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {dict?.home?.categories?.title || (locale === "vi" ? "Lựa chọn theo loại giao diện" : "Browse by Template Type")}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 justify-center">
            {displayCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.filter;
              return (
                <motion.button
                  key={cat.filter}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleCategorySelect(cat.filter)}
                  className={`cat-card text-left rounded-xl p-4 border transition-all duration-200 cursor-pointer ${isSelected
                    ? "bg-primary border-primary text-white shadow-xs"
                    : "bg-white border-slate-100 text-slate-800 hover:border-slate-200"
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                    } mb-2.5`}>
                    <Icon size={16} />
                  </div>
                  <h3 className={`font-semibold text-xs mb-0.5 ${isSelected ? "text-white" : "text-slate-900"}`}>{cat.name}</h3>
                  <p className={`text-[11px] font-normal ${isSelected ? "text-blue-100" : "text-slate-400"}`}>{cat.count}</p>
                </motion.button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════ SHOWCASE TEMPLATES GRID ══════════ */}
      <section ref={showcaseRef} id="showcase" className="relative z-[10] py-20 border-t border-white/40">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">

          <div className="section-header flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                {locale === "vi" ? "Mẫu template nổi bật" : "Featured Templates"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {dict?.home?.showcase?.title || (locale === "vi" ? "Giao diện sẵn sàng kích hoạt" : "Ready-to-Deploy Templates")}
              </h2>
            </div>
            <Link
              href={ROUTES.SHOP}
              className="magnetic-btn text-primary hover:text-primary-dark font-semibold text-xs mt-3 md:mt-0 flex items-center gap-1 transition-colors"
            >
              <span>{dict?.home?.showcase?.viewAll || (locale === "vi" ? "Xem toàn bộ template" : "View All Templates")}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`showcase-page-${safeCurrentPage}-${activeCategory}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${isPending ? "opacity-60 pointer-events-none" : "opacity-100"
                }`}
            >
              {paginatedProducts.map((product) => {
                const isFree = product.price === 0;
                const productTitle = typeof product.title === "string" ? product.title : getLocalizedText(product.title as unknown as Record<string, string>, locale);
                const productDesc = typeof product.description === "string" ? product.description : getLocalizedText(product.description as unknown as Record<string, string>, locale);

                return (
                  <KineticTiltCard
                    key={product.id}
                    className="prod-card bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-200 transition-all duration-200 flex flex-col h-full group"
                  >

                    {/* Visual Frame 16:10 with Smooth Zoom */}
                    <Link href={`${ROUTES.PRODUCT}/${product.id}`} className="relative overflow-hidden aspect-[16/10] bg-slate-900 block">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={productTitle}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Monitor size={32} />
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${isFree ? "bg-emerald-500 text-white" : "bg-slate-900/90 text-white"
                          }`}>
                          {isFree ? (dict?.home?.showcase?.freeBadge || (locale === "vi" ? "Miễn phí" : "Free")) : "Premium"}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-medium text-slate-700 shadow-2xs flex items-center gap-1">
                          <Box size={10} className="text-primary" />
                          <span>Source .zip</span>
                        </span>
                      </div>
                    </Link>

                    {/* Template Info Body */}
                    <div className="p-5 flex flex-col flex-grow justify-between">
                      <div className="space-y-2 mb-4">
                        <div className="flex flex-wrap gap-1">
                          {product.techStack && product.techStack.length > 0 ? (
                            product.techStack.map((tech) => (
                              <span key={tech} className="bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-normal px-2 py-0.2 rounded">
                                {tech}
                              </span>
                            ))
                          ) : (
                            <>
                              <span className="bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-normal px-2 py-0.2 rounded">Next.js 16</span>
                              <span className="bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-normal px-2 py-0.2 rounded">Tailwind 4</span>
                              <span className="bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-normal px-2 py-0.2 rounded">GSAP</span>
                            </>
                          )}
                        </div>

                        <Link href={`${ROUTES.PRODUCT}/${product.id}`}>
                          <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 truncate hover:text-primary transition-colors">
                            {productTitle}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal min-h-[38px]">
                          {productDesc || (locale === "vi" ? "Website Template chất lượng cao, tích hợp đầy đủ công nghệ hiện đại nhất." : "High-fidelity website template engineered with state-of-the-art technologies.")}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3.5 border-t border-slate-100 mt-auto">
                        <div className="flex items-end justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                              {dict?.home?.showcase?.priceLabel || (locale === "vi" ? "Bản quyền trọn đời" : "Lifetime License")}
                            </span>
                            <div className="flex items-baseline gap-1 font-mono">
                              <span className="text-sm font-bold text-primary tracking-tight">
                                {isFree ? (dict?.common?.free?.toUpperCase() || (locale === "vi" ? "MIỄN PHÍ" : "FREE")) : formatCurrency(product.price, locale)}
                              </span>
                              {!isFree && (
                                <span className="text-[10px] font-normal text-slate-400 font-sans">
                                  {locale === "vi" ? "/ trọn đời" : "/ lifetime"}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{locale === "vi" ? "Sẵn sàng" : "Instant"}</span>
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {product.demoUrl ? (
                            <a
                              href={resolveCleanPreviewUrl(product.demoUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8.5 rounded-xl text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80 transition-all flex items-center justify-center gap-1 shadow-2xs active:scale-[0.98]"
                            >
                              <span>Demo</span>
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            <div className="h-8.5 rounded-xl text-xs font-medium bg-slate-50/60 text-slate-400 border border-slate-100 flex items-center justify-center gap-1 cursor-default select-none">
                              <Code2 size={11} className="text-slate-300" />
                              <span>Code</span>
                            </div>
                          )}
                          <Link
                            href={`${ROUTES.PRODUCT}/${product.id}`}
                            className="h-8.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-dark text-white shadow-2xs shadow-primary/20 transition-all flex items-center justify-center gap-1 group/btn active:scale-[0.98]"
                          >
                            <span>{dict?.shop?.detailsButton || (locale === "vi" ? "Chi tiết" : "Details")}</span>
                            <ArrowRight size={11} className="transition-transform group-hover/btn:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                  </KineticTiltCard>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* ══════════ SHOWCASE PAGINATION CONTROLS ══════════ */}
          <PaginationControls
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            isPending={isPending}
            itemName={{ vi: "template", en: "templates" }}
            layoutId="home-showcase-page-indicator"
            className="mt-12"
          />

          {paginatedProducts.length === 0 && (
            <div className="text-center py-14 border border-dashed border-slate-200 rounded-xl">
              <Code2 size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 text-xs font-medium">
                {dict?.home?.showcase?.noProducts || (locale === "vi" ? "Không tìm thấy mẫu nào trong mục này. Vui lòng chọn danh mục khác!" : "No templates found in this category. Please select another one!")}
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ══════════ DEVELOPER ENDORSEMENTS SECTION ══════════ */}
      <section ref={testimonialsRef} className="relative z-[10] py-20 border-t border-white/40">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">

          <div className="section-header text-center max-w-2xl mx-auto mb-14 space-y-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
              {locale === "vi" ? "Đánh giá thực tế" : "Engineer Reviews"}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {locale === "vi" ? "Đánh giá từ các Tech Leads & Kỹ Sư Phần Mềm" : "Trusted by Tech Leads & Software Engineers"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <KineticTiltCard key={idx} className="testi-card bg-white border border-slate-100 rounded-xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-50 text-slate-600 text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-slate-100">
                      {t.tech}
                    </span>
                    <div className="flex text-amber-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3 mt-4">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
                    <Image src={t.avatar} alt={t.author} fill sizes="36px" className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs">{t.author}</h4>
                    <p className="text-[10.5px] text-slate-400 font-normal">{t.role} • {t.company}</p>
                  </div>
                </div>
              </KineticTiltCard>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════ SYSTEM TIMELINE JOURNEY ══════════ */}
      <section ref={journeyRef} className="relative z-[10] py-20 border-t border-white/40">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 relative">

          <div className="section-header text-center max-w-2xl mx-auto mb-14 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {locale === "vi" ? "Quy trình triển khai" : "Deployment Workflow"}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {locale === "vi" ? "Quy trình 3 bước từ mua hàng đến triển khai" : "3-Step Workflow: Purchase to Production"}
            </h2>
          </div>

          {/* GSAP Progress Line */}
          <div className="hidden md:block absolute top-[55%] left-[15%] right-[15%] h-[1px] bg-slate-100 z-0">
            <div className="journey-progress-line h-full bg-primary/60 origin-left w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {journeySteps.map((step) => (
              <div
                key={step.step}
                className="jr-step bg-white shadow-sm border border-slate-100 rounded-xl p-6 flex gap-4 items-start hover:shadow-md hover:border-slate-200 transition-all cursor-default"
              >
                <div className="w-8 h-8 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg flex items-center justify-center flex-shrink-0">
                  {step.step}
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════ NEWSLETTER ══════════ */}
      <section className="relative z-[10] py-20 overflow-hidden bg-slate-900 text-white border-t border-slate-800/40">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 relative z-10">

          <div className="bg-slate-950/60 border border-slate-800/50 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-xl">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider block">
              {locale === "vi" ? "Bản tin công nghệ" : "Technical Newsletter"}
            </span>
            <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
              {locale === "vi" ? "Nhận thông báo khi có Template mới" : "Get notified on new template releases"}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-normal">
              {locale === "vi"
                ? "Cập nhật các mẫu giao diện website tĩnh mới nhất, bộ icon và tài nguyên thiết kế hữu ích từ KhoUI."
                : "Subscribe to receive updates on new static template releases, icon packs, and design resources from KhoUI."}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const emailInput = form.elements.namedItem("newsletter_email") as HTMLInputElement;
                const emailVal = emailInput?.value?.trim();
                if (!emailVal || !emailVal.includes("@")) {
                  toast.warning(
                    locale === "vi" ? "Email không hợp lệ" : "Invalid email",
                    locale === "vi" ? "Vui lòng nhập địa chỉ email chính xác để nhận tin." : "Please enter a valid email address."
                  );
                  return;
                }
                toast.success(
                  locale === "vi" ? "Đăng ký nhận tin thành công!" : "Subscribed successfully!",
                  locale === "vi" ? "Cảm ơn bạn! Chúng tôi sẽ gửi thông báo khi có template mới." : "Thank you! We will notify you when new templates arrive."
                );
                form.reset();
              }}
              className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-1"
            >
              <input
                type="email"
                name="newsletter_email"
                required
                placeholder={locale === "vi" ? "Địa chỉ email của bạn..." : "Your work email address..."}
                className="flex-grow bg-slate-900 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-primary text-xs font-normal"
              />
              <button
                type="submit"
                className="magnetic-btn bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send size={12} /> {locale === "vi" ? "Đăng ký" : "Subscribe"}
              </button>
            </form>

            <p className="text-slate-500 text-[11px] flex items-center justify-center gap-1 font-normal">
              <Lock size={11} /> {locale === "vi" ? "Cam kết bảo mật thông tin, không gửi thư rác." : "Strictly spam-free. We respect your privacy."}
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
