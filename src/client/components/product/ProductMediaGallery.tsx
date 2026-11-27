"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Image as ImageIcon, ExternalLink, Lock } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/client/components/common/I18nContext";

import { resolveCleanPreviewUrl, generateSlug } from "@/shared/utils";

interface ProductMediaGalleryProps {
  productId: string;
  title: string;
  imageUrl?: string;
  demoUrl?: string;
}

/**
 * Safely trims an optional URL string.
 *
 * @param url - URL string or undefined.
 * @returns Trimmed URL string or empty string.
 */
function normalizeUrl(url?: string): string {
  return url ? url.trim() : "";
}

/**
 * Validates whether a preview URL has an acceptable web protocol or proxy path.
 *
 * @param url - Preview URL string.
 * @returns True if valid HTTP/HTTPS or local API path, false otherwise.
 */
function isValidPreviewUrl(url: string): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/api/");
}

/**
 * Formats a clean, branded white-label URL for the browser mockup bar,
 * concealing internal Supabase backend endpoints for aesthetics and privacy.
 *
 * @param url - Raw preview URL.
 * @param fallbackTitle - Fallback product title for slug generation.
 * @returns Object containing display domain and path.
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
  const slug = fallbackTitle ? generateSlug(fallbackTitle) : "preview";

  return {
    domain: "demo.khoui.io.vn",
    path: `/${slug}`,
  };
}

/**
 * Wraps Supabase Storage URLs through the local clean /api/preview proxy.
 * Completely conceals Supabase project identifiers and public storage URLs.
 *
 * @param url - Raw preview storage URL.
 * @returns Clean proxy relative path.
 */
function getProxiedPreviewUrl(url: string): string {
  return resolveCleanPreviewUrl(url);
}

/**
 * Product media gallery component supporting responsive mockup previews and interactive iframe live demos.
 *
 * @param props - Gallery props containing product title, image, and live demo URL.
 * @returns Rendered JSX element.
 */
export default function ProductMediaGallery({ productId: _productId, title, imageUrl, demoUrl }: ProductMediaGalleryProps) {
  const normalizedDemoUrl = normalizeUrl(demoUrl);
  const hasValidDemo = isValidPreviewUrl(normalizedDemoUrl);
  // Optimize LCP & Core Web Vitals: Default to static mockup image so the browser paints instantly.
  // The interactive iframe is lazy-mounted only when the user explicitly chooses the "live" tab.
  const [activeTab, setActiveTab] = useState<"image" | "live">(
    imageUrl ? "image" : hasValidDemo ? "live" : "image"
  );
  const [iframeLoading, setIframeLoading] = useState(true);
  const [prevDemoUrl, setPrevDemoUrl] = useState(normalizedDemoUrl);
  const { dict } = useI18n();

  if (normalizedDemoUrl !== prevDemoUrl) {
    setPrevDemoUrl(normalizedDemoUrl);
    setIframeLoading(true);
  }

  const resolvedIframeSrc = hasValidDemo ? getProxiedPreviewUrl(normalizedDemoUrl) : "";
  const mockUrl = getDisplayMockUrl(normalizedDemoUrl, title);

  return (
    <div className="space-y-3 font-sans">
      {/* Tab selectors */}
      {hasValidDemo && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setActiveTab("live");
                setIframeLoading(true);
              }}
              type="button"
              className={`relative flex items-center gap-1.5 px-3 py-2 mono-meta text-[9px] transition-colors ${
                activeTab === "live"
                  ? "bg-dark text-background"
                  : "border border-border bg-surface text-dark/55 hover:border-dark hover:text-dark"
              }`}
            >
              <Monitor size={11} />
              <span>{dict.media.liveDemo}</span>
              {activeTab === "live" && (
                <motion.div
                  layoutId="activeMediaTab"
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("image")}
              type="button"
              className={`relative flex items-center gap-1.5 px-3 py-2 mono-meta text-[9px] transition-colors ${
                activeTab === "image"
                  ? "bg-dark text-background"
                  : "border border-border bg-surface text-dark/55 hover:border-dark hover:text-dark"
              }`}
            >
              <ImageIcon size={11} />
              <span>{dict.media.designMockup}</span>
              {activeTab === "image" && (
                <motion.div
                  layoutId="activeMediaTab"
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </div>

          <Link
            href={resolvedIframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 border border-border bg-surface px-3 py-2 mono-meta text-[9px] text-dark/65 transition-colors hover:border-dark hover:text-dark"
          >
            <span>{dict.media.openFullscreen}</span>
            <ExternalLink size={11} />
          </Link>
        </div>
      )}

      {/* Media window */}
      <div
        className={`relative overflow-hidden border border-border transition-all duration-300 ${
          activeTab === "live" && hasValidDemo
            ? "h-[65vh] min-h-[460px] w-full"
            : "aspect-[4/3] bg-dark sm:aspect-[16/10]"
        }`}
      >
        {activeTab === "live" && hasValidDemo ? (
          <div className="relative h-full w-full bg-dark">
            {/* Browser chrome mock */}
            <div className="flex h-8 select-none items-center gap-2 border-b border-background/15 bg-dark px-3.5">
              <div className="flex shrink-0 gap-1.5">
                <span className="h-2 w-2 bg-primary/80" />
                <span className="h-2 w-2 bg-background/25" />
                <span className="h-2 w-2 bg-background/15" />
              </div>
              <div className="mx-3 flex h-5 flex-grow items-center overflow-hidden text-ellipsis whitespace-nowrap border border-background/15 bg-dark-surface px-2.5 font-mono text-[10px] sm:mx-8">
                <Lock size={9} className="mr-1.5 shrink-0 text-success" />
                <span className="select-none font-semibold text-success">https://</span>
                <span className="font-medium text-background/80">{mockUrl.domain}</span>
                <span className="text-background/40">{mockUrl.path}</span>
                <span className="mono-meta ml-auto hidden items-center gap-1 border border-background/20 px-1.5 py-0.5 text-[8px] text-background/50 md:inline-flex">
                  {dict.homeUi.labelVerified}
                </span>
              </div>
            </div>

            {/* Embedded live iframe */}
            <iframe
              src={resolvedIframeSrc}
              title={`Live Preview of ${title}`}
              className="h-[calc(100%-32px)] w-full border-0 bg-white"
              sandbox="allow-scripts allow-popups allow-forms"
              allow="autoplay; fullscreen; clipboard-read; clipboard-write; encrypted-media"
              onLoad={() => setIframeLoading(false)}
              loading="lazy"
            />

            {/* Loader overlay */}
            <AnimatePresence>
              {iframeLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-x-0 bottom-0 top-8 z-10 flex flex-col items-center justify-center gap-3 bg-dark/85"
                >
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-background/20 border-t-accent" />
                  <p className="mono-meta text-[8.5px] text-background/60">
                    {dict.media.loadingPreview}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="relative h-full w-full">
            {imageUrl ? (
              <Image
                alt={title}
                className="h-full w-full object-cover"
                src={imageUrl}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full w-full select-none flex-col items-center justify-center gap-2.5 bg-dark p-6 text-center">
                <span className="mono-meta text-[8px] text-background/30">
                  {dict.homeUi.labelPreview}
                </span>
                <ImageIcon size={30} className="text-background/25" />
                <span className="text-[12px] font-medium text-background/60">{title}</span>
                <span className="mono-meta text-[8px] text-background/30">
                  HTML5 · CSS3 · .ZIP
                </span>
              </div>
            )}

            <span className="mono-meta absolute left-2.5 top-2.5 border border-background/20 bg-dark/85 px-1.5 py-1 text-[8px] text-background/60">
              {dict.homeUi.labelSpec} / {title.slice(0, 20)}
            </span>
          </div>
        )}
      </div>

      {/* Helper notice for live frame */}
      {activeTab === "live" && hasValidDemo && (
        <p className="mono-meta text-center text-[8px] leading-relaxed text-dark/40">
          {dict.media.interactiveHint}
        </p>
      )}
    </div>
  );
}
