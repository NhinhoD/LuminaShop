import React from "react";
import { redirect } from "next/navigation";
import { makeGetProductsUseCase, makeGetCategoriesUseCase, getAppDictionary } from "@/server/di/container";
import HomePageClient from "@/client/components/home/HomePageClient";
import { sanitizeProductsForPublic } from "@/server/domain/entities/Product";
import { productSchema } from "@/shared/validations/product";
import { getLocale } from "@/i18n/getDictionary";
import type { vi } from "@/i18n/dictionaries/vi";
import { z } from "zod";

interface HomePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const rawPage = typeof params?.page === "string" ? parseInt(params.page, 10) : 1;
  const currentPage = Number.isSafeInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const categoryParam = typeof params?.category === "string" ? params.category : "all";
  const limit = 6;
  const offset = (currentPage - 1) * limit;

  const dictionary = await getAppDictionary();
  const locale = await getLocale();
  
  const getProductsUseCase = await makeGetProductsUseCase();
  const getCategoriesUseCase = await makeGetCategoriesUseCase();

  const categoryId = categoryParam !== "all" ? categoryParam : undefined;

  const [productsResult, categoriesResult] = await Promise.all([
    getProductsUseCase.execute({ 
      limit, 
      offset, 
      isActive: true,
      categoryId
    }),
    getCategoriesUseCase.execute(),
  ]);

  if (!productsResult.success) {
    console.error("[HomePage] Failed to fetch products from database:", productsResult.error);
    return (
      <main className="flex flex-col min-h-screen items-center justify-center p-6 bg-background-subtle/40 font-sans">
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto my-12 font-sans">
          <p className="font-semibold text-sm">
            {locale === "vi" ? "Không thể tải danh sách sản phẩm từ máy chủ" : "Failed to load products from database"}
          </p>
          <p className="text-xs text-red-500 mt-1 font-sans">
            {locale === "vi" ? "Vui lòng làm mới trang hoặc thử lại sau giây lát." : "Please refresh or try again shortly."}
          </p>
        </div>
      </main>
    );
  }

  if (!categoriesResult.success) {
    console.error("[HomePage] Failed to fetch categories from database:", categoriesResult.error);
    return (
      <main className="flex flex-col min-h-screen items-center justify-center p-6 bg-background-subtle/40 font-sans">
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto my-12 font-sans">
          <p className="font-semibold text-sm">
            {locale === "vi" ? "Không thể tải danh mục sản phẩm từ máy chủ" : "Failed to load product categories from database"}
          </p>
          <p className="text-xs text-red-500 mt-1 font-sans">
            {locale === "vi" ? "Vui lòng làm mới trang hoặc thử lại sau giây lát." : "Please refresh or try again shortly."}
          </p>
        </div>
      </main>
    );
  }

  const rawProducts = productsResult.data.products;
  const featuredProducts = z.array(productSchema).parse(rawProducts);
  const totalProducts = productsResult.data.total;
  const categories = categoriesResult.data.categories;

  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
  if (totalProducts > 0 && currentPage > totalPages) {
    const redirectParams = new URLSearchParams();
    if (categoryParam !== "all") {
      redirectParams.set("category", categoryParam);
    }
    if (totalPages > 1) {
      redirectParams.set("page", totalPages.toString());
    }
    const qs = redirectParams.toString();
    redirect(qs ? `/?${qs}#showcase` : "/#showcase");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <HomePageClient 
        featuredProducts={sanitizeProductsForPublic(featuredProducts)} 
        totalProducts={totalProducts}
        initialPage={currentPage}
        initialCategory={categoryParam}
        categories={categories} 
        dict={dictionary as unknown as typeof vi} 
      />
    </main>
  );
}
