import { MetadataRoute } from 'next';
import { SITE_URL } from '@/shared/constants';

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
