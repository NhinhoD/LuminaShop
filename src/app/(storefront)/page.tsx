import React from "react";
import { makeGetProductsUseCase, makeGetCategoriesUseCase, getAppDictionary } from "@/di/container";
import HomePageClient from "@/presentation/components/home/HomePageClient";
import { sanitizeProductsForPublic } from "@/domain/entities/Product";
import { productSchema } from "@/lib/validations/product";
import { z } from "zod";

export default async function HomePage(): Promise<React.ReactElement> {
  const dictionary = await getAppDictionary();
  
  const getProductsUseCase = await makeGetProductsUseCase();
  const getCategoriesUseCase = await makeGetCategoriesUseCase();

  const [productsResult, categoriesResult] = await Promise.all([
    getProductsUseCase.execute({ limit: 4 }),
    getCategoriesUseCase.execute(),
  ]);

  const rawProducts = productsResult.success ? productsResult.data.products : [];
  const featuredProducts = z.array(productSchema).parse(rawProducts);
  const categories = categoriesResult.success ? categoriesResult.data.categories : [];

  return (
    <main className="flex flex-col min-h-screen">
      <HomePageClient featuredProducts={sanitizeProductsForPublic(featuredProducts)} categories={categories} dict={(dictionary.home as Record<string, Record<string, string>>) || {}} />
    </main>
  );
}
