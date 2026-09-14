import { getPaginatedTranslationsAction } from '@/presentation/actions/i18n';
import { getAppDictionary } from "@/di/container";
import { getLocale } from "@/i18n/getDictionary";
import { Languages } from 'lucide-react';
import TranslationTableClient from './TranslationTableClient';

interface AdminTranslationsPageProps {
  searchParams: Promise<{ page?: string; q?: string; ns?: string }>;
}

export default async function AdminTranslationsPage({
  searchParams,
}: AdminTranslationsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const parsedPage = parseInt(params.page || '1', 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params.q === 'string' ? params.q.trim() : undefined;
  const namespace = typeof params.ns === 'string' && params.ns !== 'all' ? params.ns.trim() : undefined;

  const paginatedData = await getPaginatedTranslationsAction({
    limit: itemsPerPage,
    offset,
    search,
    namespace,
  });

  const dict = await getAppDictionary();
  const adminDict = (dict.admin as Record<string, string>) || {};
  const locale = await getLocale();

  const totalPages = Math.ceil(paginatedData.total / itemsPerPage);

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

      <TranslationTableClient 
        initialTranslations={paginatedData.translations}
        namespaces={paginatedData.namespaces}
        currentNamespace={params.ns || 'all'}
        currentSearch={search || ''}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={paginatedData.total}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
