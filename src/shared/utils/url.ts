import { SITE_URL, TRUSTED_HOSTS } from '../constants';

/**
 * Resolves the appropriate base URL for redirects, callbacks, and payment gateways.
 * Prioritizes the incoming request host if it matches trusted hosts, ensuring users
 * stay on the domain they are actively visiting (e.g. khoui.io.vn).
 *
 * @param rawHost Optional host header value (from 'x-forwarded-host' or 'host')
 * @returns Fully qualified base URL (e.g. 'https://khoui.io.vn')
 */
export function resolveBaseUrl(rawHost?: string | null): string {
  if (rawHost) {
    const hostWithoutPort = rawHost.split(':')[0].trim().toLowerCase();

    // 1. Localhost support in development
    if (
      (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') &&
      process.env.NODE_ENV !== 'production'
    ) {
      return `http://${rawHost}`;
    }

    // 2. Validate against trusted hosts whitelist & Vercel deployment domains
    const isTrusted =
      (TRUSTED_HOSTS as readonly string[]).includes(hostWithoutPort) ||
      Boolean(process.env.VERCEL_PROJECT_PRODUCTION_URL && hostWithoutPort === process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
      Boolean(process.env.VERCEL_URL && hostWithoutPort === process.env.VERCEL_URL);


    if (isTrusted) {
      return `https://${hostWithoutPort}`;
    }
  }

  // 3. Check configured environment variables (SITE_URL, NEXT_PUBLIC_SITE_URL, or APP_URL)
  const envUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL;

  if (envUrl) {
    try {
      const parsed = new URL(envUrl);
      if (process.env.NODE_ENV !== 'production' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // Ignore invalid URL format
    }
  }

  // 4. Fallback defaults: production uses SITE_URL, development uses localhost
  if (process.env.NODE_ENV === 'production') {
    return SITE_URL;
  }

  return 'http://localhost:3000';
}

/**
 * Transforms a Supabase Storage public preview URL into a clean, white-labeled proxy URL.
 * Completely strips the Supabase project domain and storage path from client-facing URLs,
 * preventing SSRF probes, project ref disclosure, and unauthenticated scraping.
 *
 * Example:
 * In:  https://xyz.supabase.co/storage/v1/object/public/template-previews/previews/sample/index.html
 * Out: /api/preview/previews/sample/index.html
 *
 * @param url - Raw Supabase public preview URL.
 * @returns Clean, white-labeled relative proxy path or original string.
 */
export function resolveCleanPreviewUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();

  const previewMarker = '/storage/v1/object/public/template-previews/';
  const previewIdx = trimmed.indexOf(previewMarker);
  if (previewIdx !== -1) {
    const relativePath = trimmed.substring(previewIdx + previewMarker.length);
    return `/api/preview/${relativePath}`;
  }

  const assetsMarker = '/storage/v1/object/public/template-assets/';
  const assetsIdx = trimmed.indexOf(assetsMarker);
  if (assetsIdx !== -1) {
    const relativePath = trimmed.substring(assetsIdx + assetsMarker.length);
    return `/api/preview/assets/${relativePath}`;
  }

  return trimmed;
}
