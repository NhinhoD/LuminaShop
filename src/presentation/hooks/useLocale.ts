"use client";

import { useI18n } from "@/presentation/components/common/I18nContext";

export function useLocale(): "vi" | "en" {
  const { locale } = useI18n();
  return locale;
}
