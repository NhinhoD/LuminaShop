export * from '@/shared/types/product';
import type { Product } from '@/shared/types/product';

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

