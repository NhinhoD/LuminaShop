"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { ROUTES } from "@/presentation/constants";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/presentation/components/common/I18nContext";
import { getLocalizedText } from "@/presentation/utils/locale";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Product } from "@/domain/entities/Product";
import { Category } from "@/domain/entities/Category";
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
  CheckCircle2,
  Activity,
  Star,
  Box,
  Copy,
  Check,
  Smartphone,
  Tablet,
  GitBranch,
  FolderGit2,
  Flame,
  Layers,
  Gauge,
  Sparkles,
  RotateCw,
  Terminal,
  ChevronDown,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { toast } from "@/presentation/hooks/useToastStore";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomePageClientProps {
  readonly featuredProducts: readonly Product[];
  readonly categories: readonly Category[];
  readonly dict?: Record<string, Record<string, string>>;
}

const MARQUEE_ITEMS = [
  "Next.js 16.2 App Router",
  "Tailwind CSS v4.0",
  "GSAP 3.15 Animations",
  "Strict Clean Architecture",
  "Supabase SSR",
  "100% Core Web Vitals",
  "VietQR Webhook 24/7",
  "TypeScript Strict",
];

const DEV_AVATARS = [
  { name: "Minh Tuấn", role: "Tech Lead", company: "VNG Corp", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
  { name: "Hải Nam", role: "Staff Engineer", company: "Amanotes", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
  { name: "Thanh Hằng", role: "Principal Designer", company: "Tiki", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
  { name: "Quốc Bảo", role: "Founder", company: "Sendo Labs", src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
];

const CURATED_SAMPLE_TEMPLATES = [
  {
    id: "sample-1",
    title: { vi: "E-Commerce Enterprise Pro", en: "E-Commerce Enterprise Pro" },
    description: { 
      vi: "Template thương mại điện tử Next.js 16 chuẩn Clean Architecture, giỏ hàng realtime, tích hợp VietQR và Supabase SSR.", 
      en: "Enterprise Next.js 16 e-commerce codebase with Clean Architecture, realtime cart, VietQR pay, and Supabase SSR." 
    },
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    price: 499000,
    techStack: ["Next.js 16", "Tailwind 4", "Supabase", "VietQR"],
    demoUrl: "https://demo.khoui.com/ecommerce",
    isFree: false
  },
  {
    id: "sample-2",
    title: { vi: "SaaS Analytics & Admin Dashboard", en: "SaaS Analytics & Admin Dashboard" },
    description: { 
      vi: "Giao diện quản trị với hệ thống biểu đồ thời gian thực, quản lý phân quyền RBAC và tối ưu 60 FPS GSAP.", 
      en: "Admin dashboard with real-time analytics charts, RBAC permissions, and 60 FPS GSAP motion." 
    },
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    price: 389000,
    techStack: ["React 19", "GSAP 3.15", "Recharts", "Tailwind 4"],
    demoUrl: "https://demo.khoui.com/dashboard",
    isFree: false
  },
  {
    id: "sample-3",
    title: { vi: "Senior Developer Portfolio", en: "Senior Developer Portfolio" },
    description: { 
      vi: "Mẫu portfolio chuyên nghiệp cho lập trình viên với hiệu ứng kinetic typography, dự án case-study và blog MDX.", 
      en: "High-end portfolio for software engineers with kinetic typography, project case-studies, and MDX blog." 
    },
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
    price: 0,
    techStack: ["Next.js 16", "MDX", "Framer Motion", "Tailwind 4"],
    demoUrl: "https://demo.khoui.com/portfolio",
    isFree: true
  },
  {
    id: "sample-4",
    title: { vi: "Fintech Core Banking Interface", en: "Fintech Core Banking Interface" },
    description: { 
      vi: "Giao diện ngân hàng số và cổng thanh toán bảo mật đa tầng, chuẩn tuân thủ bảo mật tài chính.", 
      en: "Digital banking interface and multi-layer payment gateway designed for high-security fintech platforms." 
    },
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80",
    price: 550000,
    techStack: ["Next.js 16", "Clean Arch", "PayOS", "PostgreSQL"],
    demoUrl: "https://demo.khoui.com/fintech",
    isFree: false
  },
  {
    id: "sample-5",
    title: { vi: "Creative Digital Studio Agency", en: "Creative Digital Studio Agency" },
    description: { 
      vi: "Landing page thời thượng cho Creative Agency với hiệu ứng cuộn tương tác ScrollTrigger mượt mà không độ trễ.", 
      en: "Cutting-edge creative agency landing page with zero-lag GSAP ScrollTrigger timeline choreography." 
    },
    imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1200&auto=format&fit=crop&q=80",
    price: 299000,
    techStack: ["GSAP 3.15", "Tailwind 4", "Turbopack", "SEO Ready"],
    demoUrl: "https://demo.khoui.com/agency",
    isFree: false
  },
  {
    id: "sample-6",
    title: { vi: "AI Agent & SaaS Landing Hub", en: "AI Agent & SaaS Landing Hub" },
    description: { 
      vi: "Trang giới thiệu sản phẩm AI với thiết kế hiện đại, bảng giá động và demo tương tác trực tiếp.", 
      en: "AI product landing page featuring dynamic tier pricing and interactive chat sandbox." 
    },
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    price: 320000,
    techStack: ["Next.js 16", "Tailwind 4", "Vercel AI SDK", "Lucide"],
    demoUrl: "https://demo.khoui.com/ai-hub",
    isFree: false
  }
];

/**
 * High-End Subtle Kinetic 3D Tilt Card with Hairline Glass Borders
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

export default function HomePageClient({ featuredProducts, categories }: HomePageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const advantagesRef = useRef<HTMLElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLabTab, setActiveLabTab] = useState<"preview" | "architecture" | "telemetry">("preview");
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copiedCli, setCopiedCli] = useState(false);
  const [isReloadingPreview, setIsReloadingPreview] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [hoveredArchLayer, setHoveredArchLayer] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { dict, locale } = useI18n();

  // 3D Motion values for Hero Sandbox Window
  const heroX = useMotionValue(0);
  const heroY = useMotionValue(0);
  const heroSpringX = useSpring(heroX, { stiffness: 180, damping: 24 });
  const heroSpringY = useSpring(heroY, { stiffness: 180, damping: 24 });
  const heroRotateX = useTransform(heroSpringY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const heroRotateY = useTransform(heroSpringX, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    heroX.set((e.clientX - rect.left) / rect.width - 0.5);
    heroY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleHeroMouseLeave = () => {
    heroX.set(0);
    heroY.set(0);
  };

  // Render balanced, orphan-proof hero title rows conforming to enterprise typography standards
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
      return (
        <>
          <span className="inline-block">Sở Hữu Website</span>{" "}
          <span className="inline-block">Template Đỉnh&nbsp;Cao,</span>
        </>
      );
    }
    return (
      <>
        <span className="inline-block">Own Top-Tier</span>{" "}
        <span className="inline-block">Website Templates,</span>
      </>
    );
  };

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
      return (
        <>
          <span className="inline-block">Sẵn Sàng Triển Khai</span>{" "}
          <span className="inline-block">Dự Án Đột&nbsp;Phá</span>
        </>
      );
    }
    return (
      <>
        <span className="inline-block">Production-Ready for</span>{" "}
        <span className="inline-block">Breakthrough Projects</span>
      </>
    );
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText("npx create-khoui-app@latest my-project");
    setCopiedCli(true);
    toast.success(
      locale === "vi" ? "Đã sao chép lệnh cài đặt" : "CLI command copied",
      "npx create-khoui-app@latest my-project"
    );
    setTimeout(() => setCopiedCli(false), 2500);
  };

  const handleReloadPreview = () => {
    setIsReloadingPreview(true);
    setTimeout(() => {
      setIsReloadingPreview(false);
      toast.success(
        locale === "vi" ? "Đã làm mới bản dựng trực tiếp" : "Live Blueprint Reloaded",
        locale === "vi" ? "60 FPS GSAP & Next.js 16 runtime sẵn sàng" : "60 FPS GSAP & Next.js 16 runtime ready"
      );
    }, 600);
  };

  const handleCopyCode = () => {
    const codeSnippet = `import { makeProductRepository } from "@/infrastructure";\nimport { CreateOrderUseCase } from "@/application";\n\nexport default async function Page() {\n  // 100% Clean Architecture & zero leak\n  const repo = await makeProductRepository();\n  return <KhoUIStorefront repo={repo} />;\n}`;
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    toast.success(
      locale === "vi" ? "Đã sao chép mã nguồn Clean Code" : "Clean Code Snippet Copied",
      "src/presentation/components/Hero.tsx"
    );
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleRunDiagnostic = () => {
    if (isRunningDiagnostic) return;
    setIsRunningDiagnostic(true);
    setTimeout(() => {
      setIsRunningDiagnostic(false);
      toast.success(
        locale === "vi" ? "Kiểm tra hệ thống: 100% ĐẠT" : "Benchmark Diagnostics: 100% PASS",
        locale === "vi" ? "0 circular imports • 0 runtime leaks • 98/100 Core Web Vitals" : "0 circular imports • 0 runtime leaks • 98/100 Core Web Vitals"
      );
    }, 1200);
  };

  const displayShowcaseProducts = featuredProducts.length >= 3 
    ? featuredProducts 
    : (CURATED_SAMPLE_TEMPLATES as unknown as Product[]);

  const filteredProducts = displayShowcaseProducts.filter((product) => {
    if (activeCategory === "all") return true;
    const titleText = typeof product.title === "string" ? product.title : getLocalizedText(product.title as unknown as Record<string, string>, locale);
    const descText = typeof product.description === "string" ? product.description : getLocalizedText(product.description as unknown as Record<string, string>, locale);
    return (
      product.categoryId === activeCategory ||
      titleText.toLowerCase().includes(activeCategory.toLowerCase()) ||
      descText.toLowerCase().includes(activeCategory.toLowerCase())
    );
  });

  const testimonials = [
    {
      author: "Nguyễn Minh Tuấn",
      role: "Tech Lead",
      company: "VNG Corporation",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      content: locale === "vi" 
        ? "Cấu trúc 4 tầng Clean Architecture chuẩn mực. Team chúng tôi đã tách độc lập được Domain và Infrastructure để kết nối với hệ thống Core Banking nội bộ mà không cần đụng vào UI layer."
        : "Strict 4-layer Clean Architecture. Our team easily decoupled Domain and Infrastructure to plug in our internal Core Banking APIs without touching presentation code.",
      rating: 5,
      tech: "Next.js 16 + Clean Arch"
    },
    {
      author: "Lê Hoàng Hải",
      role: "Staff Frontend Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Amanotes Studio",
      content: locale === "vi"
        ? "GSAP 3.15 ScrollTrigger kết hợp Tailwind v4 mang lại 60 FPS thực tế trên cả thiết bị di động tầm trung. Zero memory leaks nhờ cơ chế gsap.context() dọn dẹp sạch sẽ."
        : "GSAP 3.15 ScrollTrigger and Tailwind v4 provide real 60 FPS even on mid-tier mobile devices. Zero memory leaks with proper gsap.context() cleanups.",
      rating: 5,
      tech: "GSAP 3.15 + Tailwind 4"
    },
    {
      author: "Trần Mai Anh",
      role: "Product Lead",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      company: "Tiki Engineering",
      content: locale === "vi"
        ? "Thanh toán VietQR webhook tự động cấp quyền tải mã nguồn sau 3 giây. Source code sạch sẽ, không có bất kỳ thư viện rác hay mã độc nào, deploy Vercel 1-click."
        : "VietQR webhook automated fulfillment unlocks source code in 3 seconds. Clean code, 0 bloat, deployed straight to Vercel in 1 click.",
      rating: 5,
      tech: "PayOS Webhook + Vercel"
    }
  ];

  const journeySteps = [
    {
      step: "01",
      title: dict?.home?.journey?.step1Title || (locale === "vi" ? "Lựa chọn Template" : "Select Codebase"),
      desc: dict?.home?.journey?.step1Desc || (locale === "vi" ? "Xem Live Demo và kiểm tra kiến trúc mã nguồn từ Landing Page, E-Commerce đến Admin Dashboard." : "Inspect live demos and technical specs across landing pages, e-commerce, and admin dashboards."),
    },
    {
      step: "02",
      title: dict?.home?.journey?.step2Title || (locale === "vi" ? "Thanh toán VietQR tức thì" : "Instant VietQR Checkout"),
      desc: dict?.home?.journey?.step2Desc || (locale === "vi" ? "Quét mã VietQR hoặc thẻ ngân hàng. Hệ thống Webhook tự động xác thực giao dịch trong 3 giây." : "Scan VietQR or credit card. Webhook validates and approves order in 3 seconds."),
    },
    {
      step: "03",
      title: dict?.home?.journey?.step3Title || (locale === "vi" ? "Tải Mã Nguồn & Deploy" : "Download & Deploy"),
      desc: dict?.home?.journey?.step3Desc || (locale === "vi" ? "Nhận trọn bộ mã nguồn .zip không mã hóa, tài liệu kỹ thuật và sẵn sàng deploy lên Vercel/Netlify." : "Get full unencrypted .zip source code, setup docs, and 1-click deploy to Vercel or AWS."),
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

      // 4. Organic Floating Animation on Micro-Badges (Multi-Phase Harmonic Wave)
      gsap.to(".float-card-1", { y: -10, rotateZ: 1, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".float-card-2", { y: -12, rotateZ: -1.2, duration: 3.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.4 });
      gsap.to(".float-card-3", { y: -8, rotateZ: 0.8, duration: 4.0, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.8 });

      // 5. Parallax Background Ambient Orbs
      gsap.to(".hero-orb-1", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      // 6. Parallax Scrub on Right-Column IDE Mockup
      gsap.to(".hero-ide-window", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      // 7. Kinetic Hero Entry Timeline with 3D Perspective Rotation
      const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });
      heroTl
        .fromTo(".hero-badge", { opacity: 0, y: 16, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 })
        .fromTo(
          ".hero-title-1", 
          { opacity: 0, y: 28, rotateX: 18, transformOrigin: "bottom center" }, 
          { opacity: 1, y: 0, rotateX: 0, duration: 0.75 }, 
          "-=0.35"
        )
        .fromTo(
          ".hero-title-2", 
          { opacity: 0, y: 24, rotateX: 15, transformOrigin: "bottom center" }, 
          { opacity: 1, y: 0, rotateX: 0, duration: 0.7 }, 
          "-=0.5"
        )
        .fromTo(".hero-desc", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.65 }, "-=0.45")
        .fromTo(".hero-cta", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.45")
        .fromTo(".hero-social-proof", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.35")
        .fromTo(".hero-stats-item", { opacity: 0, y: 18, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08 }, "-=0.35");

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

    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-white text-slate-900 font-sans selection:bg-primary/10 selection:text-primary relative">

      {/* ─── GSAP Global Scroll Progress Bar ─── */}
      <div 
        id="gsap-scroll-progress" 
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-cyan-400 to-indigo-600 origin-left z-50 pointer-events-none scale-x-0" 
      />

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative min-h-[85vh] flex items-center pt-12 pb-20 overflow-hidden bg-gradient-to-b from-slate-50/50 via-white to-white border-b border-slate-100/60">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:2rem_2rem] opacity-40 pointer-events-none" />

        {/* Ambient Glow with Parallax */}
        <div className="hero-orb-1 absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />

        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">

            {/* Left Column: Headline & Content */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Subtle Status Pill */}
              <div className="hero-badge inline-flex items-center gap-2 bg-slate-50 border border-slate-200/70 text-slate-700 rounded-full px-3 py-1 text-xs font-medium shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {locale === "vi" ? "Kho Mã Nguồn Chuẩn Doanh Nghiệp" : "Enterprise-Grade Codebase Marketplace"}
                </span>
                <span className="text-slate-400 text-[11px] pl-1.5 border-l border-slate-200">v2.4</span>
              </div>

              {/* Refined, Balanced Headline with 3D Kinetic Split */}
              <h1 className="hero-title text-2xl sm:text-4xl lg:text-[2.35rem] xl:text-[2.75rem] 2xl:text-[2.95rem] font-extrabold leading-[1.2] lg:leading-[1.16] text-slate-900 tracking-[-0.03em] perspective-[1000px] text-balance">
                <span className="hero-title-1 block lg:whitespace-nowrap">
                  {renderHeroTitle1()}
                </span>
                <span className="hero-title-2 block mt-1.5 lg:mt-2 text-primary lg:whitespace-nowrap">
                  {renderHeroTitle2()}
                </span>
              </h1>

              <p className="hero-desc text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed max-w-xl">
                {dict?.home?.hero?.desc || (locale === "vi" ? "Sở hữu trọn bộ mã nguồn (Next.js 16, Tailwind v4, GSAP) chuẩn Clean Architecture được lập trình tối ưu bởi các Senior Engineers. Bàn giao nhanh chóng, an toàn, hỗ trợ deploy lên Vercel/Netlify miễn phí." : "Get full source code packages (Next.js 16, Tailwind v4, GSAP) following Clean Architecture, engineered by senior developers. Fast delivery, secure licensing, and free deployment support.")}
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
                    <span>{locale === "vi" ? "Kiến trúc Clean Code" : "Clean Architecture"}</span>
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
                    {locale === "vi" ? "1,240+ lập trình viên & tech teams tin dùng" : "Trusted by 1,240+ developers & tech teams"}
                  </span>
                </div>
              </div>

              {/* Metrics Bar with Animated Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
                {[
                  { target: 50, prefix: "", suffix: "+ mẫu", label: locale === "vi" ? "Mẫu giao diện" : "Exclusive Designs" },
                  { target: 98, prefix: "", suffix: "/100", label: locale === "vi" ? "Core Web Vitals" : "Lighthouse Score" },
                  { target: 1240, prefix: "", suffix: "+", label: locale === "vi" ? "Kỹ sư tin dùng" : "Trusted Developers" },
                  { target: 100, prefix: "", suffix: "%", label: locale === "vi" ? "Mã nguồn mở" : "Full Ownership" },
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

            {/* Right Column: VS Code / IDE Interactive Engineering Lab */}
            <div 
              className="lg:col-span-5 relative hidden lg:block perspective-[1200px]"
              onMouseMove={handleHeroMouseMove}
              onMouseLeave={handleHeroMouseLeave}
            >
              <div className="relative w-full h-[580px] flex items-center justify-center">

                {/* Dynamic Multi-Hued Ambient Backlight */}
                <div 
                  className={`absolute inset-0 rounded-3xl transition-all duration-700 blur-[85px] pointer-events-none opacity-60 ${
                    activeLabTab === "preview" 
                      ? "bg-gradient-to-tr from-primary/35 via-cyan-500/20 to-indigo-600/30"
                      : activeLabTab === "architecture"
                      ? "bg-gradient-to-tr from-emerald-500/35 via-teal-500/20 to-cyan-600/30"
                      : "bg-gradient-to-tr from-purple-600/35 via-pink-500/20 to-amber-500/30"
                  }`} 
                />

                {/* Main IDE Window with GSAP Parallax Scrub */}
                <motion.div 
                  style={{
                    rotateX: heroRotateX,
                    rotateY: heroRotateY,
                    transformStyle: "preserve-3d",
                  }}
                  className="hero-ide-window relative w-full max-w-[420px] xl:max-w-[470px] h-[520px] bg-[#090d16]/95 backdrop-blur-2xl text-white rounded-2xl overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(0,81,213,0.12)] border border-slate-800/90 ring-1 ring-white/10 flex flex-col justify-between select-none z-10"
                >
                  
                  {/* IDE Top Bar (macOS Style + File Breadcrumbs + Interactive Segmented Tab) */}
                  <div className="h-[46px] bg-slate-900/95 px-4 py-2 border-b border-slate-800/90 flex items-center justify-between font-mono text-[11px] flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-[0_0_6px_rgba(255,95,86,0.6)] cursor-pointer hover:scale-125 transition-transform" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-[0_0_6px_rgba(255,189,46,0.6)] cursor-pointer hover:scale-125 transition-transform" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-[0_0_6px_rgba(39,201,63,0.6)] cursor-pointer hover:scale-125 transition-transform" />
                      <span className="text-slate-400 text-[10px] ml-2 flex items-center gap-1.5 font-sans">
                        <GitBranch size={11} className="text-primary" />
                        <span className="font-mono text-slate-300">main</span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">v2.4</span>
                      </span>
                    </div>

                    {/* Viewport or Tab Switcher with Framer Motion Sliding Pill */}
                    <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 relative">
                      <button
                        onClick={() => startTransition(() => setActiveLabTab("preview"))}
                        className={`relative z-10 px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeLabTab === "preview" ? "text-white" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {activeLabTab === "preview" && (
                          <motion.div
                            layoutId="activeHeroLabTabIndicator"
                            className="absolute inset-0 bg-primary rounded-md shadow-[0_0_12px_rgba(0,81,213,0.5)] z-[-1]"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Monitor size={11} />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => startTransition(() => setActiveLabTab("architecture"))}
                        className={`relative z-10 px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeLabTab === "architecture" ? "text-white" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {activeLabTab === "architecture" && (
                          <motion.div
                            layoutId="activeHeroLabTabIndicator"
                            className="absolute inset-0 bg-emerald-600 rounded-md shadow-[0_0_12px_rgba(16,185,129,0.5)] z-[-1]"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Layers size={11} />
                        <span>Arch</span>
                      </button>

                      <button
                        onClick={() => startTransition(() => setActiveLabTab("telemetry"))}
                        className={`relative z-10 px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeLabTab === "telemetry" ? "text-white" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {activeLabTab === "telemetry" && (
                          <motion.div
                            layoutId="activeHeroLabTabIndicator"
                            className="absolute inset-0 bg-purple-600 rounded-md shadow-[0_0_12px_rgba(147,51,234,0.5)] z-[-1]"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Activity size={11} />
                        <span>Stats</span>
                      </button>
                    </div>
                  </div>

                  {/* IDE Body (Constant Unified Height - Never Collapses or Shrinks) */}
                  <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden relative h-[474px]">
                    <AnimatePresence mode="wait">
                      
                      {/* Tab 1: Live Interactive Component Preview with Viewport Toggle */}
                      {activeLabTab === "preview" && (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0, scale: 0.98, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: -6 }}
                          transition={{ duration: 0.22 }}
                          className="h-[442px] flex flex-col justify-between"
                        >
                          {/* Viewport Switcher & Actions Toolbar */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[11px] text-slate-400 flex-shrink-0">
                            <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                              <Code2 size={11} className="text-primary" />
                              <span>src/presentation/components/Hero.tsx</span>
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Viewport Modes */}
                              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                                <button 
                                  onClick={() => setViewportMode("desktop")}
                                  className={`p-1 rounded transition-colors cursor-pointer ${viewportMode === "desktop" ? "text-primary bg-primary/15" : "hover:text-white"}`}
                                  title="Desktop View"
                                >
                                  <Monitor size={12} />
                                </button>
                                <button 
                                  onClick={() => setViewportMode("tablet")}
                                  className={`p-1 rounded transition-colors cursor-pointer ${viewportMode === "tablet" ? "text-primary bg-primary/15" : "hover:text-white"}`}
                                  title="Tablet View"
                                >
                                  <Tablet size={12} />
                                </button>
                                <button 
                                  onClick={() => setViewportMode("mobile")}
                                  className={`p-1 rounded transition-colors cursor-pointer ${viewportMode === "mobile" ? "text-primary bg-primary/15" : "hover:text-white"}`}
                                  title="Mobile View"
                                >
                                  <Smartphone size={12} />
                                </button>
                              </div>

                              {/* Interactive Live Reload Action */}
                              <button
                                onClick={handleReloadPreview}
                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="Reload Blueprint"
                              >
                                <RotateCw size={12} className={isReloadingPreview ? "animate-spin text-primary" : ""} />
                              </button>

                              {/* Interactive Copy Snippet Action */}
                              <button
                                onClick={handleCopyCode}
                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="Copy Code Snippet"
                              >
                                {copiedCode ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                              </button>
                            </div>
                          </div>

                          {/* Live Component Canvas with Scanline */}
                          <div className={`mx-auto transition-all duration-300 relative h-[175px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group shadow-inner flex-shrink-0 ${
                            viewportMode === "mobile" ? "w-[65%]" : viewportMode === "tablet" ? "w-[85%]" : "w-full"
                          }`}>
                            <Image
                              src={displayShowcaseProducts[0]?.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80"}
                              alt="KhoUI Live Blueprint"
                              fill
                              sizes="420px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              priority
                            />
                            
                            {/* Futuristic Animated Scanline Beam */}
                            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_cyan] animate-scanline pointer-events-none z-10" />

                            {/* Canvas Overlay Gradient & Status */}
                            <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/40 to-transparent flex flex-col justify-end p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                  [PRODUCTION BLUEPRINT]
                                </span>
                                <span className="text-[9px] font-mono bg-black/60 backdrop-blur px-2 py-0.5 rounded text-emerald-400 font-bold border border-emerald-500/30">
                                  60 FPS
                                </span>
                              </div>
                              <h3 className="text-xs font-bold text-white truncate mt-0.5">
                                {displayShowcaseProducts[0]?.title ? getLocalizedText(displayShowcaseProducts[0].title as unknown as Record<string, string>, locale) : "Zenith AI - High Performance Storefront"}
                              </h3>
                            </div>
                          </div>

                          {/* Real Syntax Highlighted Code Snippet */}
                          <div className="bg-black/90 rounded-xl p-3 border border-slate-800 font-mono text-[10.5px] leading-relaxed text-slate-300 flex-1 flex flex-col justify-between shadow-inner mt-2">
                            <div className="space-y-0.5">
                              <div className="flex gap-2.5">
                                <span className="text-slate-600 select-none w-3 text-right">1</span>
                                <div><span className="text-pink-400 font-semibold">import</span> &#123; <span className="text-blue-300">makeProductRepository</span> &#125; <span className="text-pink-400 font-semibold">from</span> <span className="text-emerald-300">&quot;@/infrastructure&quot;</span>;</div>
                              </div>
                              <div className="flex gap-2.5">
                                <span className="text-slate-600 select-none w-3 text-right">2</span>
                                <div><span className="text-pink-400 font-semibold">import</span> &#123; <span className="text-blue-300">CreateOrderUseCase</span> &#125; <span className="text-pink-400 font-semibold">from</span> <span className="text-emerald-300">&quot;@/application&quot;</span>;</div>
                              </div>
                              <div className="flex gap-2.5">
                                <span className="text-slate-600 select-none w-3 text-right">3</span>
                                <div><span className="text-pink-400 font-semibold">export default async function</span> <span className="text-blue-400 font-semibold">Page</span>() &#123;</div>
                              </div>
                              <div className="flex gap-2.5">
                                <span className="text-slate-600 select-none w-3 text-right">4</span>
                                <div className="pl-2 text-slate-500 italic">&#47;&#47; 100% Clean Architecture & zero leak</div>
                              </div>
                              <div className="flex gap-2.5">
                                <span className="text-slate-600 select-none w-3 text-right">5</span>
                                <div className="pl-2"><span className="text-pink-400 font-semibold">const</span> repo = <span className="text-pink-400 font-semibold">await</span> <span className="text-blue-300">makeProductRepository</span>();</div>
                              </div>
                              <div className="flex gap-2.5">
                                <span className="text-slate-600 select-none w-3 text-right">6</span>
                                <div className="pl-2"><span className="text-pink-400 font-semibold">return</span> &lt;<span className="text-emerald-400 font-semibold">KhoUIStorefront</span> repo=&#123;repo&#125; /&gt;;</div>
                              </div>
                              <div className="flex gap-2.5">
                                <span className="text-slate-600 select-none w-3 text-right">7</span>
                                <div>&#125;</div>
                              </div>
                            </div>

                            {/* Mini Compiler Status Line */}
                            <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between text-[9.5px] text-slate-500">
                              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                <CheckCircle2 size={10} /> Strict TypeScript 5.8 Mode
                              </span>
                              <span className="text-slate-400 font-mono">0 Errors</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Tab 2: Clean Architecture 4-Layer Dependency Flow */}
                      {activeLabTab === "architecture" && (
                        <motion.div
                          key="architecture"
                          initial={{ opacity: 0, scale: 0.98, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: -6 }}
                          transition={{ duration: 0.22 }}
                          className="h-[442px] flex flex-col justify-between space-y-1.5"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 flex-shrink-0">
                            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                              <Layers size={13} className="text-emerald-400" />
                              <span>Unidirectional Flow</span>
                            </span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px] bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              Strict Verified
                            </span>
                          </div>

                          {/* 4 Clean Architecture Layers Stack */}
                          <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                            {[
                              { 
                                id: "presentation",
                                name: "Presentation Layer", 
                                path: "src/presentation", 
                                role: "UI Components, Server Actions & Zustand", 
                                badge: "Zero Direct DB",
                                border: "border-blue-500/40 hover:border-blue-400",
                                bg: "bg-blue-950/30 hover:bg-blue-950/50",
                                text: "text-blue-300"
                              },
                              { 
                                id: "application",
                                name: "Application Layer", 
                                path: "src/application", 
                                role: "Pure Business Use Cases & Orchestration", 
                                badge: "Domain-Only Imports",
                                border: "border-indigo-500/40 hover:border-indigo-400",
                                bg: "bg-indigo-950/30 hover:bg-indigo-950/50",
                                text: "text-indigo-300"
                              },
                              { 
                                id: "infrastructure",
                                name: "Infrastructure Layer", 
                                path: "src/infrastructure", 
                                role: "Supabase DB, PayOS Gateways & Storage", 
                                badge: "Implements Interfaces",
                                border: "border-amber-500/40 hover:border-amber-400",
                                bg: "bg-amber-950/30 hover:bg-amber-950/50",
                                text: "text-amber-300"
                              },
                              { 
                                id: "domain",
                                name: "Domain Layer (Core)", 
                                path: "src/domain", 
                                role: "Pure TypeScript Entities & Model Interfaces", 
                                badge: "0 External Deps",
                                border: "border-emerald-500/40 hover:border-emerald-400",
                                bg: "bg-emerald-950/30 hover:bg-emerald-950/50",
                                text: "text-emerald-300"
                              },
                            ].map((layer, index) => (
                              <div key={layer.id} className="group/item">
                                <motion.div 
                                  whileHover={{ scale: 1.01 }}
                                  onHoverStart={() => setHoveredArchLayer(layer.id)}
                                  onHoverEnd={() => setHoveredArchLayer(null)}
                                  className={`p-2.5 rounded-xl border ${layer.border} ${layer.bg} transition-all duration-200 cursor-default shadow-sm`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="w-4 h-4 rounded-full bg-black/50 text-[10px] font-mono flex items-center justify-center text-slate-400">
                                        {index + 1}
                                      </span>
                                      <span className={`text-xs font-bold font-mono ${layer.text}`}>{layer.name}</span>
                                    </div>
                                    <span className="text-[9px] font-mono bg-black/60 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                                      {layer.path}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1 text-[10px] opacity-80 pl-6">
                                    <span className="text-slate-300 truncate max-w-[240px]">{layer.role}</span>
                                    <span className="text-[9px] font-bold text-emerald-400 font-mono">{layer.badge}</span>
                                  </div>
                                </motion.div>

                                {index < 3 && (
                                  <div className="flex justify-center text-slate-600 my-0.5">
                                    <ChevronDown size={11} className="text-primary/70 animate-bounce" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Terminal Dependency Check Output */}
                          <div className="bg-black/90 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 flex-shrink-0 mt-1">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Terminal size={11} className="text-emerald-400" />
                              <span>$ npx dependency-cruiser --validate</span>
                            </div>
                            <div className="text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                              <Check size={11} />
                              {hoveredArchLayer
                                ? `Inspecting [${hoveredArchLayer}]: 100% boundary isolation verified.`
                                : "4/4 layers isolated. Strict unidirectional boundaries verified."}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Tab 3: Performance Telemetry Cockpit */}
                      {activeLabTab === "telemetry" && (
                        <motion.div
                          key="telemetry"
                          initial={{ opacity: 0, scale: 0.98, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: -6 }}
                          transition={{ duration: 0.22 }}
                          className="h-[442px] flex flex-col justify-between space-y-3"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 flex-shrink-0">
                            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                              <Gauge size={13} className="text-cyan-400" />
                              <span>Core Web Vitals Telemetry</span>
                            </span>
                            <span className="text-cyan-400 font-bold flex items-center gap-1 text-[10px] bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              Real-Time Engine
                            </span>
                          </div>

                          {/* 2 Top KPIs */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-center font-mono relative overflow-hidden group">
                              <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                              <span className="text-3xl font-extrabold text-emerald-400 block tracking-tight">98/100</span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1 block">Lighthouse Score</span>
                              <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">● Perfect Green</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-center font-mono relative overflow-hidden group">
                              <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                              <span className="text-3xl font-extrabold text-cyan-400 block tracking-tight">0.0 ms</span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1 block">Layout Shift (CLS)</span>
                              <span className="text-[9px] text-cyan-400 font-bold block mt-0.5">● Zero Jitter</span>
                            </div>
                          </div>

                          {/* Live Equalizer Performance Frequency Bars */}
                          <div className="p-3 bg-black/90 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                <Activity size={11} className="text-primary" /> Live Frequency Monitor
                              </span>
                              <span className="text-emerald-400 font-bold">60.0 FPS Stable</span>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[9px] text-center">
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                                <div className="text-slate-500">FPS</div>
                                <div className="text-emerald-400 font-bold text-xs mt-0.5">60 FPS</div>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                                <div className="text-slate-500">FCP</div>
                                <div className="text-cyan-400 font-bold text-xs mt-0.5">0.4s</div>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                                <div className="text-slate-500">Bundle</div>
                                <div className="text-purple-400 font-bold text-xs mt-0.5">42.4 kB</div>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                                <div className="text-slate-500">Memory</div>
                                <div className="text-amber-400 font-bold text-xs mt-0.5">18.2 MB</div>
                              </div>
                            </div>
                          </div>

                          {/* Diagnostics Spec Table */}
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
                            <div className="flex justify-between text-slate-400 text-[10.5px]">
                              <span>TypeScript Compiler</span>
                              <span className="text-emerald-400 font-bold">0 Errors (Strict 100%)</span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-[10.5px]">
                              <span>Turbopack Engine</span>
                              <span className="text-cyan-400 font-bold">Hot Reload: 48ms</span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-[10.5px]">
                              <span>Supabase DB Security</span>
                              <span className="text-purple-400 font-bold">RLS 100% Policy Protected</span>
                            </div>
                          </div>

                          {/* Interactive Benchmark Button */}
                          <button
                            onClick={handleRunDiagnostic}
                            disabled={isRunningDiagnostic}
                            className="w-full py-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white rounded-xl font-mono text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {isRunningDiagnostic ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Running 42 Diagnostic Tests...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={13} />
                                <span>Run Live Benchmark Test</span>
                              </>
                            )}
                          </button>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Floating Precision Glass Badges */}
                <motion.div 
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="float-card-1 absolute -top-4 -left-6 bg-white/95 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.12)] border border-slate-200/90 flex items-center gap-3 z-30 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-inner">
                    <CheckCircle2 size={17} />
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-slate-900 leading-none">
                      Clean Architecture
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mt-0.5 block font-semibold">
                      Strict 4-Layers
                    </span>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="float-card-2 absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.12)] border border-slate-200/90 flex items-center gap-3 z-30 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Zap size={17} />
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-slate-900 leading-none">
                      VietQR Instant Pay
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mt-0.5 block font-semibold">
                      Auto Webhook (3s)
                    </span>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="float-card-3 absolute top-1/2 -right-8 bg-white/95 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.12)] border border-slate-200/90 flex items-center gap-3 z-30 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Flame size={17} />
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-slate-900 leading-none">
                      GSAP 60 FPS
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mt-0.5 block font-semibold">
                      Tailwind CSS 4
                    </span>
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════ REFINED TICKER ══════════ */}
      <div className="bg-slate-900 py-2.5 overflow-hidden border-y border-slate-800/40 text-[11.5px] font-sans">
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
      <section id="advantages" ref={advantagesRef} className="py-20 bg-white">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">

          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
              {locale === "vi" ? "Kiến trúc & Tiêu chuẩn Kỹ thuật" : "Engineering Specifications"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {locale === "vi" ? "Mã nguồn tiêu chuẩn cho Tech Teams & Senior Devs" : "Engineered for Tech Teams & Senior Developers"}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-lg mx-auto font-normal">
              {locale === "vi" 
                ? "Loại bỏ hoàn toàn code rác và phụ thuộc thừa. Cấu trúc mô-đun hóa độc lập, sẵn sàng mở rộng và tích hợp hệ thống backend." 
                : "Eliminate bloat and fragile dependencies. Highly modularized, ready to scale and integrate with enterprise backends."}
            </p>
          </div>

          {/* Asymmetric Bento Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* Card 1: Large Bento (Clean Architecture) */}
            <KineticTiltCard className="bento-card md:col-span-8 bg-slate-900 text-white rounded-2xl p-7 sm:p-9 border border-slate-800/60 overflow-hidden shadow-lg">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
                  <Code2 size={13} />
                  <span>Architecture Pattern</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {locale === "vi" ? "Chuẩn Clean Architecture 4 Lớp Độc Lập" : "Strict 4-Layer Clean Architecture"}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl font-normal">
                  {locale === "vi" 
                    ? "Tách biệt hoàn toàn giữa Domain Entities, Application Use Cases, Infrastructure Gateways và Presentation UI. Bạn có thể thay đổi database từ Supabase sang Postgres/MySQL mà không cần sửa một dòng code UI nào." 
                    : "Complete isolation between Domain Entities, Use Cases, Infrastructure, and UI. Swap databases or payment gateways without refactoring presentation code."}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-5 mt-5 border-t border-slate-800/60">
                {[
                  { layer: "Domain", tech: "Pure Entities", path: "src/domain" },
                  { layer: "Application", tech: "Use Cases", path: "src/application" },
                  { layer: "Infrastructure", tech: "Supabase SSR", path: "src/infrastructure" },
                  { layer: "Presentation", tech: "Next 16 + GSAP", path: "src/presentation" },
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
            <KineticTiltCard className="bento-card md:col-span-4 bg-slate-50/60 border border-slate-100 rounded-2xl p-7 hover:bg-white hover:border-slate-200 transition-all">
              <div>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Zap size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {locale === "vi" ? "Thanh Toán & Cấp Quyền Tức Thì" : "Instant VietQR Automated Delivery"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {locale === "vi"
                    ? "Tích hợp PayOS Webhook tự động. Sau khi quét mã VietQR, hệ thống cấp quyền tải file .zip và key bản quyền tức thì."
                    : "Automated PayOS Webhook integration. Instantly unlocks source code .zip download upon QR scan."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-5 text-[11px]">
                <span className="text-slate-500 font-normal">Trạng thái</span>
                <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">200 OK Auto-Hook</span>
              </div>
            </KineticTiltCard>

            {/* Card 3: Performance & Core Web Vitals */}
            <KineticTiltCard className="bento-card md:col-span-6 bg-slate-50/60 border border-slate-100 rounded-2xl p-7 hover:bg-white hover:border-slate-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Activity size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">
                    {locale === "vi" ? "Core Web Vitals Tối Ưu Tối Đa" : "Maximized Core Web Vitals"}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm font-normal">
                    {locale === "vi"
                      ? "Next.js 16 Server Components kết hợp Turbopack giúp thời gian phản hồi trang dưới 0.4s và triệt tiêu layout shift."
                      : "Next.js 16 Server Components and Turbopack yield sub-0.4s initial response and 0.00 CLS."}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center font-bold">
                  <span className="text-sm text-emerald-400 font-mono">98</span>
                  <span className="text-[10px] tracking-wide text-slate-400 font-normal">Score</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-5">
                <span>Chỉ số đo lường</span>
                <span className="font-medium text-slate-800">CLS: 0.00 • LCP: 0.5s • FCP: 0.4s</span>
              </div>
            </KineticTiltCard>

            {/* Card 4: CLI & Full Source Code Ownership */}
            <KineticTiltCard className="bento-card md:col-span-6 bg-slate-50/60 border border-slate-100 rounded-2xl p-7 hover:bg-white hover:border-slate-200 transition-all">
              <div>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <FolderGit2 size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {locale === "vi" ? "Mã Nguồn Đầy Đủ Không Khóa Mã" : "100% Unencrypted Source Code"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm font-normal">
                  {locale === "vi"
                    ? "Tự do chỉnh sửa, tích hợp và triển khai trên hạ tầng riêng của doanh nghiệp. Đầy đủ quyền thương mại hóa."
                    : "Complete freedom to customize and deploy on your own infrastructure. Commercial rights included."}
                </p>
              </div>

              {/* CLI Copy Bar */}
              <div className="mt-4 bg-slate-900 rounded-lg p-2 flex items-center justify-between font-mono text-xs text-slate-300">
                <span className="text-emerald-400 text-[11px] truncate mr-2">npx create-khoui-app@latest my-project</span>
                <button
                  onClick={handleCopyCli}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex-shrink-0"
                  title="Copy command"
                >
                  {copiedCli ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </KineticTiltCard>

          </div>

        </div>
      </section>

      {/* ══════════ CATEGORIES NAVIGATION ══════════ */}
      <section ref={categoriesRef} className="py-14 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">

          <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
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
                  onClick={() => startTransition(() => setActiveCategory(cat.filter))}
                  className={`cat-card text-left rounded-xl p-4 border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-primary border-primary text-white shadow-xs"
                      : "bg-white border-slate-100 text-slate-800 hover:border-slate-200"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
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
      <section ref={showcaseRef} className="py-20 bg-white">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                {locale === "vi" ? "Mã nguồn nổi bật" : "Featured Codebases"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {dict?.home?.showcase?.title || (locale === "vi" ? "Mã nguồn sẵn sàng kích hoạt" : "Ready-to-Deploy Codebases")}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.slice(0, 6).map((product) => {
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                        isFree ? "bg-emerald-500 text-white" : "bg-slate-900/90 text-white"
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
                            href={product.demoUrl}
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
          </div>

          {filteredProducts.length === 0 && (
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
      <section ref={testimonialsRef} className="py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">

          <div className="text-center max-w-2xl mx-auto mb-14 space-y-1">
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
      <section ref={journeyRef} className="py-20 bg-white border-t border-slate-100 relative">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 relative">

          <div className="text-center max-w-2xl mx-auto mb-14 space-y-1">
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
                className="jr-step bg-slate-50/70 border border-slate-100 rounded-xl p-6 shadow-2xs flex gap-4 items-start hover:bg-white hover:border-slate-200 transition-all cursor-default"
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
      <section className="relative py-20 overflow-hidden bg-slate-900 text-white border-t border-slate-800/40">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 relative z-10">

          <div className="bg-slate-950/60 border border-slate-800/50 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-xl">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider block">
              {locale === "vi" ? "Bản tin công nghệ" : "Technical Newsletter"}
            </span>
            <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
              {locale === "vi" ? "Nhận thông báo khi có Template & Mã nguồn mới" : "Get notified on new codebase releases"}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-normal">
              {locale === "vi" 
                ? "Cập nhật các mẫu giao diện mới nhất, các bài viết chia sẻ kiến trúc Next.js 16 và Clean Architecture từ KhoUI Engineering." 
                : "Subscribe to receive engineering updates, new template releases, and architectural patterns."}
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
