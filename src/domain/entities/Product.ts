export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  priceAdjustment: number; // For VND, this is an integer
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  categoryId: string;
  title: Record<string, string>;
  slug: string;
  description: Record<string, string>;
  price: number; // VND, integer
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  demoUrl: string;
  sourceCodeUrl: string;
  techStack: string[];
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProductDTO = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants' | 'isActive'> & {
  variants?: (Omit<ProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt' | 'sku'> & { sku?: string })[];
};

export type UpdateProductDTO = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'>> & {
  variants?: (Omit<ProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt' | 'sku'> & { id?: string; sku?: string })[];
  isActive?: boolean;
};

/**
 * Sanitizes product entity for public exposure, stripping confidential sourceCodeUrl
 * unless the product is free (0đ) or has been verified as purchased by the user.
 *
 * @param product - The product entity to sanitize.
 * @param isPurchased - Whether the requesting user has verified purchase entitlement.
 * @returns Sanitized Product entity.
 */
export function sanitizeProductForPublic(product: Product, isPurchased = false): Product {
  const hasPaidVariant = product.variants?.some(
    (variant) => product.price + variant.priceAdjustment > 0
  ) ?? false;

  if (isPurchased || (product.price === 0 && !hasPaidVariant)) {
    return product;
  }
  return {
    ...product,
    sourceCodeUrl: '',
  };
}

/**
 * Sanitizes an array of products for public storefront display.
 *
 * @param products - Array of product entities to sanitize.
 * @returns Array of sanitized Product entities with sourceCodeUrl masked.
 */
export function sanitizeProductsForPublic(products: Product[]): Product[] {
  return products.map((p) => sanitizeProductForPublic(p, false));
}

