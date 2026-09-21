import { MetadataRoute } from 'next';
import { SITE_URL } from '@/shared/constants';

/**
 * Generates the robots.txt file for search engine crawlers.
 * Implements crawl budget protection by disallowing private and administrative routes.
 *
 * @returns {MetadataRoute.Robots} Robots configuration object.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/profile/',
          '/checkout',
          '/cart',
          '/orders/',
          '/auth/',
          '/demo/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
