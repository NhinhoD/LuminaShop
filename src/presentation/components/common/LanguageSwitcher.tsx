"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { setLanguageAction } from "@/presentation/actions/i18n";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ initialLocale = "vi" }: { initialLocale?: "vi" | "en" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [locale, setLocale] = useState<"vi" | "en">(initialLocale);

  const toggleLanguage = () => {
    const nextLocale = locale === "vi" ? "en" : "vi";
    setLocale(nextLocale);
    startTransition(async () => {
      await setLanguageAction(nextLocale);
      router.refresh();
    });
  };

  // Removed client-side cookie reading effect to avoid cascading renders.
  // The locale is managed by the server layout and passed down.

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 text-sm font-bold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
      title="Change Language"
    >
      <Globe className="w-4 h-4 text-[#0051d5]" />
      <span className="uppercase">{locale}</span>
    </button>
  );
}
