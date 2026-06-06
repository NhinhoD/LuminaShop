import React from "react";
import { makeProductRepository } from "@/infrastructure/supabase/container";
import HomePageClient from "@/presentation/components/home/HomePageClient";
import { getDictionary } from "@/i18n/getDictionary";

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
  const dictionary = await getDictionary();
  const productRepository = await makeProductRepository();
  const { products: rawProducts } = await productRepository.findAll({ limit: 4 });
  const featuredProducts = z.array(productSchema).parse(rawProducts);

  return (
    <main className="flex flex-col min-h-screen">
      <HomePageClient featuredProducts={featuredProducts} dict={dictionary.home} />
    </main>
  );
}
