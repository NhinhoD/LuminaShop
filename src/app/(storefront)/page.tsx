import React from "react";
import { makeProductRepository, makeLanguageRepository, makeCategoryRepository } from "@/infrastructure/supabase/container";
import HomePageClient from "@/presentation/components/home/HomePageClient";
import { getDictionary } from "@/i18n/getDictionary";
import { sanitizeProductsForPublic } from "@/domain/entities/Product";

import { z } from "zod";

const productVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string(),
  name: z.string(),
  priceAdjustment: z.number(),
  stockQuantity: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const productSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  title: z.record(z.string(), z.string()),
  slug: z.string(),
  description: z.record(z.string(), z.string()),
  price: z.number(),
  stock: z.number(),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
  demoUrl: z.string(),
  sourceCodeUrl: z.string(),
  techStack: z.array(z.string()),
  variants: z.array(productVariantSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export default async function HomePage(): Promise<React.ReactElement> {
  const repo = await makeLanguageRepository();
  const dictionary = await getDictionary(repo);
  const productRepository = await makeProductRepository();
  const { products: rawProducts } = await productRepository.findAll({ limit: 4 });
  const featuredProducts = z.array(productSchema).parse(rawProducts);

  const categoryRepository = await makeCategoryRepository();
  const { categories } = await categoryRepository.findAll();

  return (
    <main className="flex flex-col min-h-screen">
      <HomePageClient featuredProducts={sanitizeProductsForPublic(featuredProducts)} categories={categories} dict={(dictionary.home as Record<string, Record<string, string>>) || {}} />
    </main>
  );
}
