"use client";

import React from "react";
import { LoadingSpinner } from "@/client/components/common/LoadingSpinner";
import { useI18n } from "@/client/components/common/I18nContext";

export default function StorefrontLoading() {
  const { dict, locale } = useI18n();
  const text = dict?.common?.loadingPage || (locale === "vi" ? "Đang tải trang..." : "Loading page...");

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
      <LoadingSpinner size="lg" />
      <p className="text-xs font-medium text-slate-400 animate-pulse motion-reduce:animate-none tracking-wide font-sans">
        {text}
      </p>
    </div>
  );
}
