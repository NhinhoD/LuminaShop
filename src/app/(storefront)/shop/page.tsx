import { makeProductRepository, makeLanguageRepository, makeCategoryRepository } from "@/infrastructure/supabase/container";
import ShopProductGrid from "@/presentation/components/product/ShopProductGrid";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";
import { getDictionary, getLocale } from "@/i18n/getDictionary";

interface ShopPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const currentPage = parseInt((params?.page as string) || "1", 10);
  const itemsPerPage = parseInt((params?.limit as string) || "9", 10);
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params?.q === 'string' ? params.q : undefined;
  const categorySlug = typeof params?.category === 'string' ? params.category : undefined;
  
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const shopDict = (dict?.shop as Record<string, string>) || {};

  let categoryId: string | undefined = undefined;
  if (categorySlug && categorySlug !== 'all') {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categorySlug);
    if (isUUID) {
       categoryId = categorySlug;
    } else {
       const categoryRepo = await makeCategoryRepository();
       const category = await categoryRepo.findBySlug(categorySlug);
       if (category) {
          categoryId = category.id;
       } else {
          categoryId = "00000000-0000-0000-0000-000000000000";
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
    <main className="flex-grow bg-white py-12 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-slate-100 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
              <span className="text-[11px] font-extrabold tracking-widest text-primary uppercase">
                {shopDict.breadcrumbsShop || (locale === "vi" ? "CỬA HÀNG TEMPLATE" : "TEMPLATE CATALOG")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-2 tracking-tight">
              {shopDict.title || (locale === "vi" ? "Bộ Sưu Tập Giao Diện & Mã Nguồn" : "Template & Codebase Catalog")}
            </h1>
            <p className="text-slate-500 text-sm">
              {shopDict.subtitle || (locale === "vi" ? "Khám phá các mẫu website chất lượng cao được thiết kế cho cuộc sống hiện đại." : "Discover high-performance web templates engineered for modern digital applications.")}{" "}
              ({total} {shopDict.templateCount || "templates"})
            </p>
          </div>
        </div>

        <ShopProductGrid 
          initialProducts={products} 
          currentSearch={search || ""} 
          currentSort={sortType} 
          currentCategory={categorySlug || "all"}
          initialCategory={categorySlug}
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
