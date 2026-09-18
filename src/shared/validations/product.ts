import { z } from 'zod';

export const productVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string(),
  name: z.string(),
  priceAdjustment: z.number(),
  stockQuantity: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const productSchema = z.object({
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
