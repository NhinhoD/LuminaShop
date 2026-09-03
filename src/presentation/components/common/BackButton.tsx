"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "./I18nContext";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
}

/**
 * A reusable back button that returns the user to the previous page in history.
 * Browsers automatically preserve scroll position when using history.back().
 */
export function BackButton({ className = "" }: BackButtonProps) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);
  const { dict } = useI18n();

  useEffect(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      requestAnimationFrame(() => setCanGoBack(true));
    }
  }, []);

  if (!canGoBack) return null;

  return (
    <button
      onClick={() => router.back()}
      className={`group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all duration-200 cursor-pointer ${className}`}
      aria-label={dict?.common?.back || "Go back"}
      type="button"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
      </div>
      <span className="text-xs font-bold tracking-[0.1em] uppercase hidden sm:inline font-sans">
        {dict?.common?.back || "Back"}
      </span>
    </button>
  );
}

