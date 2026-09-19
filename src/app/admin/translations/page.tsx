import { redirect } from 'next/navigation';
import { getPaginatedTranslationsAction } from '@/server/presentation/actions/i18n';
import { getAppDictionary } from "@/server/di/container";
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
  const rawPage = typeof params?.page === 'string' ? parseInt(params.page, 10) : 1;
  const currentPage = Number.isSafeInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params?.q === 'string' ? params.q.trim() : undefined;
  const namespace = typeof params?.ns === 'string' && params.ns !== 'all' ? params.ns.trim() : undefined;

  const dict = await getAppDictionary();
  const adminDict = (dict.admin as Record<string, string>) || {};
  const locale = await getLocale();

  let paginatedData;
  try {
    paginatedData = await getPaginatedTranslationsAction({
      limit: itemsPerPage,
      offset,
      search,
      namespace,
    });
  } catch (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto my-12 font-sans">
        <p className="font-semibold text-sm">
          {locale === "vi" ? "Không thể tải danh sách bản dịch từ máy chủ" : "Failed to load translations from database"}
        </p>
        <p className="text-xs text-red-500 mt-1 font-mono">
          {error instanceof Error ? error.message : "Failed to load translations"}
        </p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(paginatedData.total / itemsPerPage));

  if (paginatedData.total > 0 && currentPage > totalPages) {
    const redirectParams = new URLSearchParams();
    if (params?.ns && params.ns !== 'all') {
      redirectParams.set('ns', params.ns);
    }
    if (search) {
      redirectParams.set('q', search);
    }
    redirectParams.set('page', totalPages.toString());
    redirect(`/admin/translations?${redirectParams.toString()}`);
  }

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
