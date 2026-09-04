import { getTranslationsAction } from '@/presentation/actions/i18n';
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { Languages } from 'lucide-react';
import TranslationTableClient from './TranslationTableClient';

export default async function AdminTranslationsPage(): Promise<React.ReactElement> {
  const translations = await getTranslationsAction();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const adminDict = (dict.admin as Record<string, string>) || {};
  const locale = await getLocale();

  // Sort by namespace then key
  translations.sort((a, b) => a.key.localeCompare(b.key));

  return (
    <div className="space-y-6 max-w-container-max mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Languages className="w-7 h-7 text-primary" />
            <span>{adminDict.translationsTitle || (locale === "vi" ? "Quản lý bản dịch động" : "Dynamic Translations")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-1">
            {adminDict.translationsSubtitle || (locale === "vi" ? "Quản lý nội dung dịch giao diện trực tiếp từ cơ sở dữ liệu." : "Manage UI text translations across the application directly from the database.")}
          </p>
        </div>
      </div>

      <TranslationTableClient initialTranslations={translations} />
    </div>
  );
}
