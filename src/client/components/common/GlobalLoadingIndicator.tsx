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
export function GlobalLoadingIndicator(): React.JSX.Element | null {
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
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] transition-all duration-300"
      role="progressbar"
      aria-label={dict?.common?.loadingPage || (locale === "vi" ? "Đang tải trang..." : "Loading page...")}
    >
      {/* Top progress bar */}
      <div className="h-0.5 w-full overflow-hidden bg-border">
        <div className="animate-indeterminate h-full w-full bg-primary motion-reduce:animate-none" />
      </div>

      {/* Floating status chip */}
      <div className="absolute right-4 top-3 flex items-center gap-2 border border-border bg-surface px-2.5 py-1.5 shadow-sm sm:right-6">
        <Loader2 className="h-3 w-3 animate-spin text-primary motion-reduce:animate-none" />
        <span className="mono-meta text-[7.5px] text-dark/60">
          {dict?.common?.loading || (locale === "vi" ? "Đang tải..." : "Loading...")}
        </span>
      </div>
    </div>
  );
}
