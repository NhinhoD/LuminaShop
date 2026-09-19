import LanguageTableClient from "./LanguageTableClient";
import { TranslationEntry } from "@/server/domain/repositories/ITranslationRepository";
import { getAppDictionary } from "@/server/di/container";
import { getLocale } from "@/i18n/getDictionary";
import { getTranslationsAction } from "@/server/presentation/actions/i18n";

export const dynamic = 'force-dynamic';

export default async function AdminLanguagesPage() {
  let translations: TranslationEntry[] = [];
  const locale = await getLocale();
  const dict = await getAppDictionary();
  const adminDict = (dict?.admin as Record<string, string>) || {};

  try {
    translations = await getTranslationsAction();
  } catch {
    translations = [];
  }

  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            {adminDict.translationsTitle || (locale === "vi" ? "Ngôn ngữ & Dịch thuật" : "Languages & Translations")}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            {adminDict.translationsSubtitle || (locale === "vi" ? "Quản lý và tùy chỉnh đa ngôn ngữ cho toàn bộ website." : "Manage dynamic multi-language text tokens across the storefront and admin panel.")}
          </p>
        </div>
      </div>
      
      {translations.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl text-xs">
          <h3 className="font-semibold text-sm mb-1">{locale === "vi" ? "Chưa có dữ liệu ngôn ngữ" : "No translation data available"}</h3>
          <p className="font-normal">{locale === "vi" ? "Vui lòng kiểm tra bảng site_translations trên Supabase." : "Please inspect the site_translations table in Supabase."}</p>
        </div>
      ) : (
        <LanguageTableClient initialTranslations={translations} locale={locale} />
      )}
    </div>
  );
}
