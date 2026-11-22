import type { Locale } from "@/client/components/common/I18nContext";
import type { vi } from "@/i18n/dictionaries/vi";

export interface SectionCopy {
  readonly dict: typeof vi;
  readonly locale: Locale;
}
