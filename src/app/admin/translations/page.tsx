import { makeTranslationRepository } from '@/infrastructure/supabase/container';
import { Languages } from 'lucide-react';
import TranslationTableClient from './TranslationTableClient';

export default async function AdminTranslationsPage() {
  const repo = await makeTranslationRepository();
  const translations = await repo.getAllTranslations();

  // Sort by namespace then key
  translations.sort((a, b) => a.key.localeCompare(b.key));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Languages className="w-6 h-6 text-primary" />
            Dynamic Translations
          </h1>
          <p className="text-on-surface/60 mt-1">Manage UI text translations across the application directly from the database.</p>
        </div>
      </div>

      <TranslationTableClient initialTranslations={translations} />
    </div>
  );
}
