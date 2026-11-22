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
 *
 * @param props - Optional class overrides.
 * @returns Spec Sheet styled back control, or null when no history exists.
 */
export function BackButton({ className = "" }: BackButtonProps): React.JSX.Element | null {
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
      className={`group flex cursor-pointer items-center gap-2 text-dark/45 transition-colors hover:text-dark ${className}`}
      aria-label={dict?.common?.back || "Go back"}
      type="button"
    >
      <span className="flex h-7 w-7 items-center justify-center border border-border bg-surface transition-colors group-hover:border-dark">
        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
      </span>
      <span className="mono-meta hidden text-[8px] sm:inline">
        {dict?.common?.back || "Back"}
      </span>
    </button>
  );
}
