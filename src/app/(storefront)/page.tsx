import React from "react";
import { makeGetProductsUseCase, makeGetCategoriesUseCase, getAppDictionary } from "@/di/container";
import HomePageClient from "@/presentation/components/home/HomePageClient";
import { sanitizeProductsForPublic } from "@/domain/entities/Product";
import { productSchema } from "@/lib/validations/product";
import { getLocale } from "@/i18n/getDictionary";
import { z } from "zod";

export default async function HomePage(): Promise<React.ReactElement> {
  const dictionary = await getAppDictionary();
  const locale = await getLocale();
  
  const getProductsUseCase = await makeGetProductsUseCase();
  const getCategoriesUseCase = await makeGetCategoriesUseCase();

  const [productsResult, categoriesResult] = await Promise.all([
    getProductsUseCase.execute({ limit: 4 }),
    getCategoriesUseCase.execute(),
  ]);

  if (!productsResult.success) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center p-6 bg-background-subtle/40 font-sans">
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto my-12 font-sans">
          <p className="font-semibold text-sm">
            {locale === "vi" ? "Không thể tải danh sách sản phẩm từ máy chủ" : "Failed to load products from database"}
          </p>
          <p className="text-xs text-red-500 mt-1 font-mono">
            {productsResult.error?.message || "Unknown error"}
          </p>
        </div>
      </main>
    );
  }

  if (!categoriesResult.success) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center p-6 bg-background-subtle/40 font-sans">
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto my-12 font-sans">
          <p className="font-semibold text-sm">
            {locale === "vi" ? "Không thể tải danh mục sản phẩm từ máy chủ" : "Failed to load product categories from database"}
          </p>
          <p className="text-xs text-red-500 mt-1 font-mono">
            {categoriesResult.error?.message || "Unknown error"}
          </p>
        </div>
      </main>
    );
  }

  const rawProducts = productsResult.data.products;
  const featuredProducts = z.array(productSchema).parse(rawProducts);
  const categories = categoriesResult.data.categories;

  return (
    <main className="flex flex-col min-h-screen">
      <HomePageClient featuredProducts={sanitizeProductsForPublic(featuredProducts)} categories={categories} dict={(dictionary.home as Record<string, Record<string, string>>) || {}} />
    </main>
  );
}
