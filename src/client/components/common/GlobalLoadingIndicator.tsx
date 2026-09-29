"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useI18n } from "./I18nContext";

/**
 * GlobalLoadingIndicator:
 * Provides instant visual feedback (top bar + spinning badge) whenever:
 * 1. The user clicks on any internal link (page transition).
 * 2. An async navigation occurs.
 * Prevents user confusion and reduces repeated spam clicks.
 */
export function GlobalLoadingIndicator() {
  const { dict, locale } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = `${pathname}?${searchParams.toString()}`;
  const [prevUrl, setPrevUrl] = useState(currentUrl);
  const [isNavigating, setIsNavigating] = useState(false);
  const [, startTransition] = useTransition();

  // Reset navigation state when URL changes (standard React state-during-render pattern)
  if (prevUrl !== currentUrl) {
    setPrevUrl(currentUrl);
    setIsNavigating(false);
  }

  // Safety timeout: automatically clear pending navigation if transition stalls or fails
  useEffect(() => {
    if (!isNavigating) return;
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isNavigating]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      // Skip non-navigational links
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        targetAttr === "_blank" ||
        target.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if it's an internal route
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          const isSamePage =
            url.pathname === window.location.pathname &&
            url.search === window.location.search;
          if (!isSamePage) {
            startTransition(() => {
              setIsNavigating(true);
            });

            // Verify if subsequent event handlers prevented the navigation
            setTimeout(() => {
              if (e.defaultPrevented) {
                setIsNavigating(false);
              }
            }, 0);
          }
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    // Capture click events during capturing phase for immediate feedback
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9999] pointer-events-none transition-all duration-300"
      role="progressbar"
      aria-label={dict?.common?.loadingPage || (locale === "vi" ? "Đang tải trang..." : "Loading page...")}
    >
      {/* Top Animated Progress Bar */}
      <div className="h-1 w-full bg-slate-100 overflow-hidden shadow-xs">
        <div className="h-full bg-gradient-to-r from-primary via-indigo-500 to-primary w-full animate-indeterminate rounded-r-full motion-reduce:animate-none" />
      </div>

      {/* Floating Spinner Badge at top-right */}
      <div className="absolute top-3 right-4 sm:right-6 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200/80 flex items-center gap-2 text-slate-800 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 motion-reduce:animate-none">
        <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none text-primary" />
        <span className="font-sans">{dict?.common?.loading || (locale === "vi" ? "Đang tải..." : "Loading...")}</span>
      </div>
    </div>
  );
}
