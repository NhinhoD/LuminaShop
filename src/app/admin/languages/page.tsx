import { getLanguagesAction, toggleLanguageAction } from '@/presentation/actions/languageActions';
import { Globe, CheckCircle2, XCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminLanguagesPage() {
  const languages = await getLanguagesAction();

  async function toggleStatus(code: string, currentStatus: boolean) {
    'use server';
    await toggleLanguageAction(code, !currentStatus);
    revalidatePath('/admin/languages');
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Language Management
          </h1>
          <p className="text-on-surface/60 mt-1">Manage active languages for your storefront.</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/50 border-b border-outline-variant">
              <th className="px-6 py-4 font-semibold text-sm">Code</th>
              <th className="px-6 py-4 font-semibold text-sm">Name</th>
              <th className="px-6 py-4 font-semibold text-sm text-center">Default</th>
              <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {languages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-on-surface/60">
                  No languages found.
                </td>
              </tr>
            ) : (
              languages.map((lang) => (
                <tr key={lang.code} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4 font-medium uppercase">{lang.code}</td>
                  <td className="px-6 py-4">{lang.name}</td>
                  <td className="px-6 py-4 text-center">
                    {lang.isDefault ? (
                      <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md">Default</span>
                    ) : (
                      <span className="text-on-surface/40">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={toggleStatus.bind(null, lang.code, false)}>
                      <button 
                        disabled={lang.isDefault}
                        className="text-sm font-medium px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {lang.isDefault ? 'Default' : 'Set Default'}
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

