import { MetadataRoute } from 'next';
import { SITE_URL } from '@/shared/constants';
import { makeGetProductsUseCase, makeGetCategoriesUseCase } from '@/server/di/container';

export const dynamic = 'force-dynamic';

/**
 * Generates the dynamic XML sitemap for KhoUI.
 * Includes static discoverable routes, active categories, and all active products with pagination support.
 *
 * @returns {Promise<MetadataRoute.Sitemap>} Array of sitemap URL entries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const [getProductsUseCase, getCategoriesUseCase] = await Promise.all([
      makeGetProductsUseCase(),
      makeGetCategoriesUseCase(),
    ]);

    // Paginate through all active products to guarantee complete catalog coverage
    const allProducts = [];
    const batchSize = 1000;
    let offset = 0;
    let total = Infinity;

    while (offset < total) {
      const pageResult = await getProductsUseCase.execute({
        limit: batchSize,
        offset,
        isActive: true,
      });

      if (!pageResult.success) {
        throw new Error(typeof pageResult.error === 'string' ? pageResult.error : 'Failed to fetch products for sitemap');
      }

      const products = pageResult.data?.products || [];
      allProducts.push(...products);
      total = pageResult.data.total ?? 0;
      offset += batchSize;

      if (products.length === 0) {
        break;
      }
    }

    const categoriesResult = await getCategoriesUseCase.execute();

    const categoryRoutes: MetadataRoute.Sitemap = (
      categoriesResult.success && categoriesResult.data?.categories ? categoriesResult.data.categories : []
    ).map((cat) => ({
      url: `${SITE_URL}/shop?cat=${encodeURIComponent(cat.slug || cat.id)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    }));

    const productRoutes: MetadataRoute.Sitemap = allProducts.map((product) => ({
      url: `${SITE_URL}/product/${product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : product.createdAt ? new Date(product.createdAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    // Graceful fallback to static routes if database is unreachable during sitemap generation
    console.error('sitemap generation error:', error);
  }

  return staticRoutes;
}
