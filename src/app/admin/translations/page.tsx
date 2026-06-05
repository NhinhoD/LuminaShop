import { makeTranslationRepository } from '@/infrastructure/supabase/container';
import { updateTranslationAction } from '@/presentation/actions/i18n';
import { Languages, Edit3 } from 'lucide-react';

export default async function AdminTranslationsPage() {
  const repo = await makeTranslationRepository();
  const translations = await repo.getAllTranslations();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Languages className="w-6 h-6 text-primary" />
            Static Translations
          </h1>
          <p className="text-on-surface/60 mt-1">Manage UI text translations across the application.</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/50 border-b border-outline-variant">
              <th className="px-6 py-4 font-semibold text-sm w-1/4">Key</th>
              <th className="px-6 py-4 font-semibold text-sm w-1/3">English (EN)</th>
              <th className="px-6 py-4 font-semibold text-sm w-1/3">Vietnamese (VI)</th>
              <th className="px-6 py-4 font-semibold text-sm text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {translations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-on-surface/60">
                  No translations found in database.
                </td>
              </tr>
            ) : (
              translations.map((t) => (
                <tr key={t.key} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-on-surface/70">{t.key}</td>
                  <td className="px-6 py-4 text-sm">{t.en}</td>
                  <td className="px-6 py-4 text-sm">{t.vi}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
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
