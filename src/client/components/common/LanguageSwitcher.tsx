"use client";

import { useTransition } from "react";
import { setLanguageAction } from "@/server/presentation/actions/i18n";
import { Globe, Loader2 } from "lucide-react";
import { useI18n, Locale } from "./I18nContext";

/**
 * Locale toggle for the navigation action rail.
 *
 * @param props - Optional initial locale when rendered outside the provider.
 * @returns Square hairline language button.
 */
export function LanguageSwitcher({ initialLocale }: { initialLocale?: Locale } = {}): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const { locale: contextLocale, dict } = useI18n();
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
      className="flex h-9 items-center gap-1.5 border border-border px-2.5 text-dark/65 transition-colors hover:border-dark hover:text-dark disabled:cursor-not-allowed disabled:opacity-50"
      title={currentLocale === "vi" ? dict.nav.switchToEnglish : dict.nav.switchToVietnamese}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
      ) : (
        <Globe className="h-3.5 w-3.5 text-primary" />
      )}
      <span className="mono-meta text-[9px] uppercase">{currentLocale}</span>
    </button>
  );
}
