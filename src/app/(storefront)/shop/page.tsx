import { makeProductRepository, makeLanguageRepository, makeCategoryRepository } from "@/infrastructure/supabase/container";
import ShopProductGrid from "@/presentation/components/product/ShopProductGrid";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { Sparkles, Zap } from "lucide-react";
import { sanitizeProductsForPublic } from "@/domain/entities/Product";

interface ShopPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const CATEGORY_SLUG_MAP: Record<string, string> = {
  ecommerce: "e-commerce",
  admin: "saas-tech",
  portfolio: "portfolio-agency",
  fintech: "fintech-corporate",
  saas: "saas-tech",
  food: "food-hospitality",
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const currentPage = parseInt((params?.page as string) || "1", 10);
  const itemsPerPage = parseInt((params?.limit as string) || "9", 10);
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params?.q === 'string' ? params.q : undefined;

  const rawCategory = typeof params?.category === 'string'
    ? params.category
    : (typeof params?.cat === 'string' ? params.cat : undefined);

  const categorySlug = rawCategory
    ? (CATEGORY_SLUG_MAP[rawCategory.toLowerCase()] || rawCategory)
    : undefined;
  
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const shopDict = (dict?.shop as Record<string, string>) || {};

  const categoryRepo = await makeCategoryRepository();
  const { categories: dbCategories } = await categoryRepo.findAll();

  let categoryId: string | undefined = undefined;
  if (categorySlug && categorySlug !== 'all') {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categorySlug);
    if (isUUID) {
       categoryId = categorySlug;
    } else {
       const matchedCategory = dbCategories.find(
         (c) => c.slug.toLowerCase() === categorySlug.toLowerCase() || c.id === categorySlug
       );
       if (matchedCategory) {
          categoryId = matchedCategory.id;
       } else {
          const category = await categoryRepo.findBySlug(categorySlug);
          categoryId = category ? category.id : "00000000-0000-0000-0000-000000000000";
       }
    }
  }
  let sortType: 'newest' | 'price_asc' | 'price_desc' | 'popular' = 'newest';
  if (
    params?.sort === 'price_asc' || 
    params?.sort === 'price_desc' || 
    params?.sort === 'popular'
  ) {
    sortType = params.sort as 'newest' | 'price_asc' | 'price_desc' | 'popular';
  }

  const productRepository = await makeProductRepository();
  const { products, total } = await productRepository.findAll({ 
    limit: itemsPerPage, 
    offset, 
    isActive: true,
    search,
    categoryId,
    sort: sortType
  });
  
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <main className="flex-grow bg-background-subtle/40 py-12 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-100/80 pb-8 gap-6">
          <div className="max-w-2xl">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 mb-3.5 backdrop-blur-xs">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary tracking-wide">
                {shopDict.breadcrumbsShop || (locale === "vi" ? "Kho Giao Diện Chọn Lọc" : "Curated Template Store")}
              </span>
              <span className="text-primary/30">•</span>
              <span className="text-xs font-medium text-slate-500">Next.js 16 & Clean Architecture</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
              {locale === "vi" ? (
                <>
                  Bộ sưu tập <span className="bg-gradient-to-r from-primary via-indigo-600 to-violet-600 bg-clip-text text-transparent">Giao diện & Mã nguồn</span> cao cấp
                </>
              ) : (
                <>
                  Curated <span className="bg-gradient-to-r from-primary via-indigo-600 to-violet-600 bg-clip-text text-transparent">Templates & Codebases</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
              {shopDict.subtitle || (locale === "vi" ? "Khám phá các mẫu website chất lượng cao được thiết kế tỉ mỉ, tối ưu trải nghiệm và sẵn sàng triển khai ngay vào dự án của bạn." : "Production-ready web templates engineered with clean architecture, modern aesthetics, and instant source code delivery.")}
            </p>
          </div>

          {/* Quick Metrics & Highlights */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 font-mono">{total} {shopDict.templateCount || (locale === "vi" ? "giao diện" : "templates")}</div>
                <div className="text-[11px] text-slate-500 font-normal">{locale === "vi" ? "Đã kiểm định chất lượng" : "Production Tested"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{locale === "vi" ? "Tải về tức thì" : "Instant Access"}</div>
                <div className="text-[11px] text-slate-500 font-normal">{locale === "vi" ? "Kèm mã nguồn .zip" : "Full Source Code"}</div>
              </div>
            </div>
          </div>
        </div>

        <ShopProductGrid 
          initialProducts={sanitizeProductsForPublic(products)} 
          currentSearch={search || ""} 
          currentSort={sortType} 
          currentCategory={categorySlug || "all"}
          initialCategory={categorySlug}
          dbCategories={dbCategories}
        />
        
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <PaginationControls currentPage={currentPage} totalPages={totalPages} />
          </div>
        )}
      </div>
    </main>
  );
}
