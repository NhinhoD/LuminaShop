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
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
      title={currentLocale === "vi" ? "Đổi sang Tiếng Anh (Switch to English)" : "Switch to Vietnamese (Đổi sang Tiếng Việt)"}
    >
      <Globe className="w-3.5 h-3.5 text-[#0051d5]" />
      <span className="uppercase tracking-wider">{currentLocale}</span>
    </button>
  );
}
