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
 * Supported query parameters for Supabase public storage URLs.
 * Preserves storage download semantics in clean proxy URLs.
 */
const SUPPORTED_STORAGE_PARAMS = ['download'] as const;

/**
 * Extracts supported storage query parameters (e.g. ?download or ?download=name)
 * from a URL search params object to preserve expected storage behaviors while
 * filtering out extraneous or unsupported query parameters.
 *
 * @param searchParams - URLSearchParams object.
 * @returns Query string with leading '?' or empty string if no supported parameters are present.
 */
function getSupportedStorageQuery(searchParams: URLSearchParams): string {
  const supported = new URLSearchParams();
  for (const key of SUPPORTED_STORAGE_PARAMS) {
    if (searchParams.has(key)) {
      const val = searchParams.get(key);
      if (val) {
        supported.set(key, val);
      } else {
        supported.append(key, '');
      }
    }
  }

  const queryStr = supported.toString();
  if (!queryStr) return '';

  return `?${queryStr.replace(/=(?=&|$)/g, '')}`;
}

/**
 * Transforms a Supabase Storage public preview URL into a clean, white-labeled proxy URL.
 * Restricts rewriting strictly to URLs originating from the configured NEXT_PUBLIC_SUPABASE_URL,
 * completely stripping the project identifier and storage path to prevent SSRF probes and storage disclosure.
 * Preserves supported storage query parameters (such as `download`) while omitting unsupported parameters.
 *
 * Examples:
 * In:  https://xyz.supabase.co/storage/v1/object/public/template-previews/previews/sample/index.html
 * Out: /api/preview/previews/sample/index.html
 *
 * In:  https://xyz.supabase.co/storage/v1/object/public/template-previews/previews/sample/file.pdf?download=sample.pdf
 * Out: /api/preview/previews/sample/file.pdf?download=sample.pdf
 *
 * @param url - Raw candidate URL string.
 * @returns Clean, white-labeled relative proxy path or original string if not matching storage origin.
 */
export function resolveCleanPreviewUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();

  let parsedUrl: URL;
  let storageUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
    storageUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  } catch {
    return trimmed;
  }

  if (parsedUrl.origin !== storageUrl.origin) return trimmed;

  const storageQuery = getSupportedStorageQuery(parsedUrl.searchParams);
  const hash = parsedUrl.hash;

  const previewMarker = '/storage/v1/object/public/template-previews/';
  if (parsedUrl.pathname.startsWith(previewMarker)) {
    const relativePath = parsedUrl.pathname.substring(previewMarker.length);
    return `/api/preview/${relativePath}${storageQuery}${hash}`;
  }

  const assetsMarker = '/storage/v1/object/public/template-assets/';
  if (parsedUrl.pathname.startsWith(assetsMarker)) {
    const relativePath = parsedUrl.pathname.substring(assetsMarker.length);
    return `/api/preview/assets/${relativePath}${storageQuery}${hash}`;
  }

  return trimmed;
}
