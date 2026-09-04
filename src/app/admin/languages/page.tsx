import { getLanguagesAction, setDefaultLanguageAction } from '@/presentation/actions/languageActions';
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { Globe } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminLanguagesPage() {
  const languages = await getLanguagesAction();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const adminDict = (dict.admin as Record<string, string>) || {};
  const locale = await getLocale();

  async function setDefault(code: string) {
    'use server';
    await setDefaultLanguageAction(code);
    revalidatePath('/admin/languages');
  }

  return (
    <div className="space-y-6 max-w-container-max mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Globe className="w-7 h-7 text-primary" />
            <span>{adminDict.languagesTitle || (locale === "vi" ? "Quản lý ngôn ngữ" : "Language Management")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-1">
            {adminDict.languagesSubtitle || (locale === "vi" ? "Quản lý các ngôn ngữ đang hoạt động trên hệ thống." : "Manage active languages for your storefront.")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-100 text-xs font-medium text-slate-500">
              <th className="px-6 py-3.5">{adminDict.thCode || (locale === "vi" ? "Mã ngôn ngữ" : "Language Code")}</th>
              <th className="px-6 py-3.5">{adminDict.thName || (locale === "vi" ? "Tên ngôn ngữ" : "Language Name")}</th>
              <th className="px-6 py-3.5 text-center">{adminDict.thDefault || (locale === "vi" ? "Mặc định" : "Default")}</th>
              <th className="px-6 py-3.5 text-right">{locale === "vi" ? "Thao tác" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {languages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs font-normal">
                  {adminDict.noLanguages || (locale === "vi" ? "Chưa có ngôn ngữ nào được cấu hình." : "No languages found.")}
                </td>
              </tr>
            ) : (
              languages.map((lang) => (
                <tr key={lang.code} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-medium text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md uppercase">
                      {lang.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{lang.name}</td>
                  <td className="px-6 py-4 text-center">
                    {lang.isDefault ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {adminDict.thDefault || (locale === "vi" ? "Mặc định" : "Default")}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={setDefault.bind(null, lang.code)}>
                      <button 
                        disabled={lang.isDefault}
                        className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {lang.isDefault ? (locale === "vi" ? "Mặc định" : "Default") : (adminDict.setDefault || (locale === "vi" ? "Đặt làm mặc định" : "Set as default"))}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

