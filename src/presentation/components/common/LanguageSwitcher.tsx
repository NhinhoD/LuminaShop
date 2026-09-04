"use client";

import { useTransition } from "react";
import { setLanguageAction } from "@/presentation/actions/i18n";
import { Globe } from "lucide-react";
import { useI18n, Locale } from "./I18nContext";

export function LanguageSwitcher({ initialLocale }: { initialLocale?: Locale } = {}) {
  const [isPending, startTransition] = useTransition();
  const { locale: contextLocale } = useI18n();
  const currentLocale = contextLocale || initialLocale || "vi";

  const toggleLanguage = () => {
    const nextLocale = currentLocale === "vi" ? "en" : "vi";
    startTransition(async () => {
      await setLanguageAction(nextLocale);
      window.location.reload();
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-700 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
      title={currentLocale === "vi" ? "Đổi sang Tiếng Anh (Switch to English)" : "Switch to Vietnamese (Đổi sang Tiếng Việt)"}
    >
      <Globe className="w-3.5 h-3.5 text-primary" />
      <span className="uppercase tracking-wide text-xs font-mono font-medium">{currentLocale}</span>
    </button>
  );
}
