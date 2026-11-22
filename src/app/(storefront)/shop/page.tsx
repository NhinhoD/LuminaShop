import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { makeGetProductsUseCase, makeGetCategoriesUseCase, getAppDictionary } from "@/server/di/container";
import ShopProductGrid from "@/client/components/product/ShopProductGrid";
import { PaginationControls } from "@/client/components/common/PaginationControls";
import { getLocale } from "@/i18n/getDictionary";
import { Sparkles, Zap } from "lucide-react";
import { sanitizeProductsForPublic } from "@/server/domain/entities/Product";
import { SITE_URL } from "@/shared/constants";

export const metadata: Metadata = {
  title: "Kho Mẫu Giao Diện Website Tĩnh (HTML, CSS, JS, Bootstrap) Cao Cấp",
  description: "Khám phá và tải xuống các mẫu website template tĩnh chuẩn HTML5, CSS3, JavaScript, Bootstrap 5. Trọn bộ file .zip sẵn sàng tùy biến và sử dụng.",
  openGraph: {
    title: "Kho Mẫu Giao Diện Website Tĩnh (HTML, CSS, JS, Bootstrap) Cao Cấp",
    description: "Khám phá và tải xuống các mẫu website template tĩnh chuẩn HTML5, CSS3, JavaScript, Bootstrap 5. Trọn bộ file .zip sẵn sàng tùy biến và sử dụng.",
    url: `${SITE_URL}/shop`,
    siteName: "KhoUI",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/shop`,
  },
};

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

/**
 * Catalog storefront shop page.
 * Supports filtering by category, search query, and server-side pagination.
 *
 * @param {ShopPageProps} props - Component properties containing async searchParams.
 * @returns {Promise<React.ReactElement>} Next.js page element.
 */
export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const rawPage = typeof params?.page === "string" ? parseInt(params.page, 10) : 1;
  const currentPage = Number.isSafeInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const rawLimit = typeof params?.limit === "string" ? parseInt(params.limit, 10) : 6;
  const itemsPerPage = Number.isSafeInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 100 ? rawLimit : 6;
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params?.q === 'string' ? params.q : undefined;

  const rawCategory = typeof params?.category === 'string'
    ? params.category
    : (typeof params?.cat === 'string' ? params.cat : undefined);

  const categorySlug = rawCategory
    ? (CATEGORY_SLUG_MAP[rawCategory.toLowerCase()] || rawCategory)
    : undefined;

  const locale = await getLocale();
  const dict = await getAppDictionary();
  const shopDict = (dict?.shop as Record<string, string>) || {};

  const getCategoriesUseCase = await makeGetCategoriesUseCase();
  const categoriesResult = await getCategoriesUseCase.execute();

  if (!categoriesResult.success) {
    return (
      <main className="flex-grow py-16 font-sans">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
          <div className="mx-auto max-w-xl border border-error/40 bg-surface p-8">
            <span className="mono-meta text-error">{shopDict.loadCategoriesError}</span>
            <p className="mt-3 text-[12.5px] leading-relaxed text-dark/55">
              {shopDict.unknownError || (locale === "vi" ? "Lỗi không xác định" : "Unknown error")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const dbCategories = categoriesResult.data.categories;

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

  const getProductsUseCase = await makeGetProductsUseCase();
  const productsResult = await getProductsUseCase.execute({
    limit: itemsPerPage,
    offset,
    isActive: true,
    search,
    categoryId,
    sort: sortType
  });

  if (!productsResult.success) {
    return (
      <main className="flex-grow py-16 font-sans">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
          <div className="mx-auto max-w-xl border border-error/40 bg-surface p-8">
            <span className="mono-meta text-error">{shopDict.loadProductsError}</span>
            <p className="mt-3 text-[12.5px] leading-relaxed text-dark/55">
              {shopDict.unknownError || (locale === "vi" ? "Lỗi không xác định" : "Unknown error")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { products, total } = productsResult.data;

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  if (total > 0 && currentPage > totalPages) {
    const redirectParams = new URLSearchParams();
    if (params?.category) redirectParams.set("category", params.category as string);
    else if (params?.cat) redirectParams.set("cat", params.cat as string);
    if (params?.sort) redirectParams.set("sort", params.sort as string);
    if (search) redirectParams.set("q", search);
    if (itemsPerPage !== 6) redirectParams.set("limit", itemsPerPage.toString());
    redirectParams.set("page", totalPages.toString());
    redirect(`/shop?${redirectParams.toString()}`);
  }

  return (
    <main className="flex-grow font-sans">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14">
        {/* Header */}
        <div className="grid grid-cols-1 gap-6 border-b border-border pb-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <span className="mono-meta flex items-center gap-2 text-primary">
              <span className="h-1.5 w-1.5 bg-primary" />
              {shopDict.breadcrumbsShop}
              <span className="text-dark/25">/</span>
              <span className="text-dark/40">{shopDict.badgeTech}</span>
            </span>

            <h1 className="mt-4 display text-[clamp(1.8rem,4vw,3.4rem)] text-dark">
              {shopDict.headingLead}{" "}
              <span className="text-primary">{shopDict.headingHighlight}</span>{" "}
              {shopDict.headingTail}
            </h1>

            <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-dark/55 sm:text-sm">
              {shopDict.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:col-span-4">
            <div className="flex items-start gap-3 bg-surface p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-primary">
                <Sparkles size={14} />
              </span>
              <div className="min-w-0">
                <div className="font-mono text-[13px] font-semibold text-dark">
                  {String(total).padStart(2, "0")} {shopDict.templateCount}
                </div>
                <div className="mono-meta mt-1.5 text-[8px] leading-relaxed text-dark/40">
                  {shopDict.metricsQuality}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-surface p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-success">
                <Zap size={14} />
              </span>
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold leading-tight text-dark">
                  {shopDict.metricsInstant}
                </div>
                <div className="mono-meta mt-1.5 text-[8px] leading-relaxed text-dark/40">
                  {shopDict.metricsZip}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <ShopProductGrid
            initialProducts={sanitizeProductsForPublic(products)}
            currentSearch={search || ""}
            currentSort={sortType}
            currentCategory={categorySlug || "all"}
            initialCategory={categorySlug}
            dbCategories={dbCategories}
          />
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          itemName={{ vi: "template", en: "templates" }}
          layoutId="shop-page-pagination"
          className="mt-10"
        />
      </div>
    </main>
  );
}
