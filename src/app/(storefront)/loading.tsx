"use client";

import React from "react";
import { LoadingSpinner } from "@/client/components/common/LoadingSpinner";
import { useI18n } from "@/client/components/common/I18nContext";

/**
 * Storefront route-level loading state.
 *
 * @returns Spec Sheet style loading placeholder.
 */
export default function StorefrontLoading(): React.JSX.Element {
  const { dict, locale } = useI18n();
  const text = dict?.common?.loadingPage || (locale === "vi" ? "Đang tải trang..." : "Loading page...");

  return (
    <div className="flex min-h-[50vh] flex-grow flex-col items-center justify-center gap-4 bg-background px-5 py-16 font-sans">
      <LoadingSpinner size="lg" />
      <p className="mono-meta animate-pulse text-[8.5px] text-dark/40 motion-reduce:animate-none">
        {text}
      </p>
    </div>
  );
}
