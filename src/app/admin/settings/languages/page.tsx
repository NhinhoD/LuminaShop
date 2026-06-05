import { makeTranslationRepository } from "@/infrastructure/supabase/container";
import LanguageTableClient from "./LanguageTableClient";
import { TranslationEntry } from "@/domain/repositories/ITranslationRepository";

export default async function AdminLanguagesPage() {
  let translations: TranslationEntry[] = [];
  try {
    const repo = await makeTranslationRepository();
    translations = await repo.getAllTranslations();
  } catch (error) {
    console.error("Failed to fetch translations:", error);
  }

  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-h1 text-on-surface">Ngôn ngữ & Dịch thuật</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Quản lý và tùy chỉnh đa ngôn ngữ cho toàn bộ website.</p>
        </div>
      </div>
      
      {translations.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl">
          <h3 className="font-bold text-lg mb-2">Chưa có dữ liệu ngôn ngữ</h3>
          <p className="text-sm">Vui lòng chạy file script SQL `migration_translations.sql` trong cửa sổ SQL Editor trên Supabase Dashboard để tạo bảng và nạp dữ liệu mẫu.</p>
        </div>
      ) : (
        <LanguageTableClient initialTranslations={translations} />
      )}
    </div>
  );
}
