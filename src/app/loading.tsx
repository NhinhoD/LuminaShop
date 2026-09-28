"use client";

import React from "react";
import { LoadingSpinner } from "@/client/components/common/LoadingSpinner";
import { useI18n } from "@/client/components/common/I18nContext";

export default function RootLoading() {
  const { dict, locale } = useI18n();
  const text = dict?.common?.loadingData || (locale === "vi" ? "Đang tải dữ liệu..." : "Loading data...");

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8">
      <LoadingSpinner size="lg" />
      <p className="text-xs font-medium text-slate-400 animate-pulse tracking-wide font-sans">
        {text}
      </p>
    </div>
  );
}
