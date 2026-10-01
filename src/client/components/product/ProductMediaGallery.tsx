"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Image as ImageIcon, ExternalLink, Lock } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/client/components/common/I18nContext";

interface ProductMediaGalleryProps {
  productId: string;
  title: string;
  imageUrl?: string;
  demoUrl?: string;
}

function normalizeUrl(url?: string): string {
  return url ? url.trim() : "";
}

function isValidPreviewUrl(url: string): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/api/");
}

/**
 * Formats a clean, branded white-label URL for the browser mockup bar,
 * concealing internal Supabase backend endpoints for aesthetics and privacy.
 */
function getDisplayMockUrl(url: string, fallbackTitle: string): { domain: string; path: string } {
  // If preview directory is stored under /previews/<slug>-<timestamp>/...
  const previewMatch = url.match(/\/previews\/([^/]+)/);
  if (previewMatch && previewMatch[1]) {
    const cleanSlug = previewMatch[1].replace(/-\d{10,}$/, "");
    return {
      domain: "demo.khoui.io.vn",
      path: `/${cleanSlug}`,
    };
  }

  // If already an external custom domain (not Supabase)
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("supabase.co")) {
      return {
        domain: parsed.hostname,
        path: parsed.pathname.length > 1 ? parsed.pathname : "",
      };
    }
  } catch {
    // Ignore invalid URL parsing
  }

  // Fallback slug from product title
  const slug = fallbackTitle
    ? fallbackTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    : "preview";

  return {
    domain: "demo.khoui.io.vn",
    path: `/${slug}`,
  };
}

/**
 * Wraps Supabase Storage URLs through the local /api/preview proxy
 * to bypass Supabase's forced text/plain Content-Type on HTML files.
 * Non-Supabase URLs pass through unchanged.
 */
function getProxiedPreviewUrl(url: string): string {
  if (url.includes("supabase.co/storage/")) {
    return "/api/preview?url=" + encodeURIComponent(url);
  }
  return url;
}

export default function ProductMediaGallery({ productId, title, imageUrl, demoUrl }: ProductMediaGalleryProps) {
  const normalizedDemoUrl = normalizeUrl(demoUrl);
  const hasValidDemo = isValidPreviewUrl(normalizedDemoUrl);
  // Optimize LCP & Core Web Vitals: Default to static mockup image so the browser paints instantly.
  // The interactive iframe is lazy-mounted only when the user explicitly chooses the "live" tab.
  const [activeTab, setActiveTab] = useState<"image" | "live">(
    imageUrl ? "image" : hasValidDemo ? "live" : "image"
  );
  const [iframeLoading, setIframeLoading] = useState(true);
  const [prevDemoUrl, setPrevDemoUrl] = useState(normalizedDemoUrl);
  const { dict, locale } = useI18n();

  if (normalizedDemoUrl !== prevDemoUrl) {
    setPrevDemoUrl(normalizedDemoUrl);
    setIframeLoading(true);
  }

  const resolvedIframeSrc = hasValidDemo ? getProxiedPreviewUrl(normalizedDemoUrl) : "";
  const mockUrl = getDisplayMockUrl(normalizedDemoUrl, title);

  return (
    <div className="space-y-4 font-sans">
      {/* Tab Selectors */}
      {hasValidDemo && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab("live");
                setIframeLoading(true);
              }}
              type="button"
              className={`flex items-center gap-1.5 pb-2 text-xs font-medium relative cursor-pointer transition-colors ${
                activeTab === "live" ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Monitor size={13} />
              <span>{dict?.media?.liveDemo || (locale === "vi" ? "Trải nghiệm trực tiếp" : "Live Demo")}</span>
              {activeTab === "live" && (
                <motion.div
                  layoutId="activeMediaTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("image")}
              type="button"
              className={`flex items-center gap-1.5 pb-2 text-xs font-medium relative cursor-pointer transition-colors ${
                activeTab === "image" ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ImageIcon size={13} />
              <span>{dict?.media?.designMockup || (locale === "vi" ? "Ảnh giao diện" : "Design Mockup")}</span>
              {activeTab === "image" && (
                <motion.div
                  layoutId="activeMediaTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </div>

          <Link
            href={`/demo/${productId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-2xs -mt-1.5"
          >
            <span>{dict?.media?.openFullscreen || (locale === "vi" ? "Toàn màn hình" : "Fullscreen")}</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      )}

      {/* Media Window Container */}
      <div className={`rounded-xl overflow-hidden shadow-xs border border-slate-200/70 relative transition-all duration-300 ${
        activeTab === "live" && hasValidDemo
          ? "w-full h-[65vh] min-h-[460px]"
          : "aspect-[4/3] sm:aspect-[16/10] bg-slate-900"
      }`}>
        {activeTab === "live" && hasValidDemo ? (
          <div className="w-full h-full relative bg-slate-950">
            {/* Top Browser Bar Mock */}
            <div className="h-8 bg-slate-900 border-b border-slate-800/60 flex items-center px-3.5 gap-2 select-none">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-grow mx-3 sm:mx-8 bg-slate-950 h-5.5 rounded flex items-center px-2.5 text-[11px] font-mono overflow-hidden whitespace-nowrap text-ellipsis border border-slate-800/60 shadow-inner">
                <Lock size={10} className="text-emerald-400 mr-1.5 shrink-0" />
                <span className="text-emerald-400 font-semibold select-none">https://</span>
                <span className="text-slate-200 font-medium">{mockUrl.domain}</span>
                <span className="text-slate-400">{mockUrl.path}</span>
                <span className="ml-auto text-[9px] text-emerald-400/90 font-sans font-semibold uppercase tracking-wider bg-emerald-950/70 border border-emerald-800/40 px-1.5 py-0.5 rounded hidden md:inline-flex items-center gap-1 select-none">
                  Verified
                </span>
              </div>
            </div>

            {/* Embedded Live Iframe */}
            <iframe
              src={resolvedIframeSrc}
              title={`Live Preview of ${title}`}
              className="w-full h-[calc(100%-32px)] border-0 bg-white"
              sandbox="allow-scripts allow-popups allow-forms"
              allow="autoplay; fullscreen; clipboard-read; clipboard-write; encrypted-media"
              onLoad={() => setIframeLoading(false)}
              loading="lazy"
            />

            {/* Loader Overlay */}
            <AnimatePresence>
              {iframeLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-x-0 bottom-0 top-8 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10"
                >
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs text-slate-300 font-normal">
                    {dict?.media?.loadingPreview || (locale === "vi" ? "Đang tải giao diện trực tiếp..." : "Loading live preview...")}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {imageUrl ? (
              <Image
                alt={title}
                className="w-full h-full object-cover"
                src={imageUrl}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-2.5 p-6 text-center select-none">
                <ImageIcon size={32} className="text-slate-600" />
                <span className="text-xs text-slate-400 font-medium">{title}</span>
                <span className="text-[11px] text-slate-500 font-mono">Template tĩnh (.zip) • HTML5 & CSS3</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extra helper notice for live frame */}
      {activeTab === "live" && hasValidDemo && (
        <p className="text-[11px] text-slate-400 font-normal text-center">
          {dict?.media?.interactiveHint || (locale === "vi" ? "Bạn có thể tương tác trực tiếp bên trong khung xem trước." : "You can interact directly inside the preview window.")}
        </p>
      )}
    </div>
  );
}
