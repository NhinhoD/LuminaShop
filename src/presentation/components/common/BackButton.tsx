"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    // Check if there is history to go back to
    // Note: window.history.length > 1 doesn't always mean there's a previous page from our site,
    // but it's a good heuristic.
    if (typeof window !== "undefined" && window.history.length > 1) {
      setCanGoBack(true);
    }
  }, []);

  if (!canGoBack) return null;

  return (
    <button
      onClick={() => router.back()}
      className={`group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all duration-200 ${className}`}
      aria-label="Go back"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
        <span className="material-symbols-outlined text-[20px] font-bold">arrow_back</span>
      </div>
      <span className="text-xs font-bold tracking-[0.1em] uppercase hidden sm:inline">Back</span>
    </button>
  );
}
