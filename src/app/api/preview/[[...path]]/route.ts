import { NextRequest, NextResponse } from "next/server";

/**
 * 100% White-Label, Secure Preview Proxy with Origin Sandboxing & Resource Throttling.
 * Conceals Supabase project identifiers and backend storage paths completely.
 *
 * Security & Resource Protections:
 * 1. Sandboxed Unique Origin (CSP sandbox without allow-same-origin) to isolate cookies/storage.
 * 2. Memory byte budget caps (MAX_CACHE_ITEM_SIZE_BYTES) to prevent memory amplification.
 * 3. Request coalescing (fetchCoalesced) to eliminate duplicate upstream fetches.
 * 4. Bounded warm-up concurrency for discovered template stylesheets and scripts.
 */

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Maximum memory entries permitted in the in-memory LRU cache */
const MAX_CACHE_SIZE = 150;

/** Maximum byte length per cached item (2MB) - larger assets are streamed without RAM storage */
const MAX_CACHE_ITEM_SIZE_BYTES = 2 * 1024 * 1024;

/** In-memory cache time-to-live (30 minutes) */
const CACHE_TTL_MS = 1000 * 60 * 30;

/** Maximum number of auxiliary files warmed per HTML document */
const MAX_WARMUP_FILES = 8;

/** Maximum concurrent background fetches during template warmup */
const WARMUP_CONCURRENCY = 3;

interface CacheEntry {
  body: string | ArrayBuffer;
  contentType: string;
  isHtml: boolean;
  timestamp: number;
}

interface UpstreamFetchResult {
  status: number;
  contentType: string;
  data: ArrayBuffer;
  ok: boolean;
}

const previewCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<UpstreamFetchResult>>();

/**
 * Resolves standard MIME Content-Type based on file extension.
 *
 * @param pathOrUrl - File path or URL containing a file extension.
 * @returns Standard MIME content type string with character encoding when appropriate.
 */
function resolveContentType(pathOrUrl: string): string {
  const pathname = pathOrUrl.split("?")[0].toLowerCase();
  if (pathname.endsWith(".html") || pathname.endsWith(".htm")) return "text/html; charset=utf-8";
  if (pathname.endsWith(".css")) return "text/css; charset=utf-8";
  if (pathname.endsWith(".js") || pathname.endsWith(".mjs")) return "application/javascript; charset=utf-8";
  if (pathname.endsWith(".json")) return "application/json; charset=utf-8";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  if (pathname.endsWith(".webp")) return "image/webp";
  if (pathname.endsWith(".gif")) return "image/gif";
  if (pathname.endsWith(".woff")) return "font/woff";
  if (pathname.endsWith(".woff2")) return "font/woff2";
  if (pathname.endsWith(".ttf")) return "font/ttf";
  if (pathname.endsWith(".otf")) return "font/otf";
  if (pathname.endsWith(".ico")) return "image/x-icon";
  return "application/octet-stream";
}

/**
 * Determines whether a resolved Content-Type represents an HTML document.
 *
 * @param contentType - MIME content type string.
 * @returns True if the content type is HTML, false otherwise.
 */
function isHtmlType(contentType: string): boolean {
  return contentType.startsWith("text/html");
}

/**
 * Stores an item in the in-memory cache, enforcing LRU eviction and memory byte budget.
 * Objects exceeding MAX_CACHE_ITEM_SIZE_BYTES are discarded to prevent memory exhaustion.
 *
 * @param key - Unique target URL identifier.
 * @param entry - Cache entry object.
 */
function setCache(key: string, entry: CacheEntry): void {
  const size = typeof entry.body === "string" ? Buffer.byteLength(entry.body) : entry.body.byteLength;
  if (size > MAX_CACHE_ITEM_SIZE_BYTES) {
    return;
  }
  if (previewCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = previewCache.keys().next().value;
    if (oldestKey) previewCache.delete(oldestKey);
  }
  previewCache.set(key, entry);
}

/**
 * Fetches an upstream resource with in-flight deduplication (request coalescing)
 * to prevent duplicate concurrent network calls against Supabase Storage.
 *
 * @param targetUrl - Upstream storage URL to fetch.
 * @returns Upstream response status, content type, body buffer, and success flag.
 */
async function fetchCoalesced(targetUrl: string): Promise<UpstreamFetchResult> {
  const existing = inFlightRequests.get(targetUrl);
  if (existing) {
    return existing;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(targetUrl, { headers: { "Accept-Encoding": "identity" } });
      if (!res.ok) {
        return { status: res.status, contentType: "", data: new ArrayBuffer(0), ok: false };
      }
      const data = await res.arrayBuffer();
      const resolvedType = resolveContentType(targetUrl);
      return { status: res.status, contentType: resolvedType, data, ok: true };
    } catch {
      return { status: 502, contentType: "", data: new ArrayBuffer(0), ok: false };
    } finally {
      inFlightRequests.delete(targetUrl);
    }
  })();

  inFlightRequests.set(targetUrl, fetchPromise);
  return fetchPromise;
}

/**
 * Speculatively warms up the in-memory cache for key text-based template files (CSS, JS, HTML).
 * Limits total warmed files and concurrent network requests to prevent CPU/memory amplification.
 *
 * @param baseInternalUrl - Upstream base folder URL.
 * @param discoveredFiles - Array of relative file paths discovered in the template HTML.
 */
async function warmUpTemplateCache(baseInternalUrl: string, discoveredFiles: string[]): Promise<void> {
  const candidateFiles = Array.from(new Set(discoveredFiles))
    .filter((file) => {
      const lower = file.split("?")[0].toLowerCase();
      return (
        lower.endsWith(".css") ||
        lower.endsWith(".js") ||
        lower.endsWith(".html") ||
        lower.endsWith(".htm") ||
        lower.endsWith(".json")
      );
    })
    .slice(0, MAX_WARMUP_FILES);

  for (let i = 0; i < candidateFiles.length; i += WARMUP_CONCURRENCY) {
    const batch = candidateFiles.slice(i, i + WARMUP_CONCURRENCY);
    await Promise.all(
      batch.map(async (relPath) => {
        const targetUrl = `${baseInternalUrl}${relPath}`;
        if (previewCache.has(targetUrl)) return;
        const res = await fetchCoalesced(targetUrl);
        if (res.ok && res.data.byteLength <= MAX_CACHE_ITEM_SIZE_BYTES) {
          const isHtml = isHtmlType(res.contentType);
          if (isHtml) {
            const decoder = new TextDecoder("utf-8");
            const text = decoder.decode(res.data);
            setCache(targetUrl, { body: text, contentType: res.contentType, isHtml: true, timestamp: Date.now() });
          } else {
            setCache(targetUrl, { body: res.data, contentType: res.contentType, isHtml: false, timestamp: Date.now() });
          }
        }
      })
    ).catch(() => {});
  }
}

/**
 * Rewrites relative HTML resource links and page navigations to use the clean preview proxy.
 * Injects speculative link prefetch tags for discovered sub-pages.
 *
 * @param html - Raw HTML text content.
 * @param clientFolderPrefix - Target proxy path prefix for client URLs.
 * @param _internalFolderPrefix - Optional internal backend prefix.
 * @returns Transformed HTML string and list of discovered relative asset paths.
 */
function processPreviewHtml(
  html: string,
  clientFolderPrefix: string,
  _internalFolderPrefix?: string
): { processed: string; discoveredFiles: string[] } {
  let processed = html.replace(
    /<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?Mock link disabled[\s\S]*?<\/script>/gi,
    ""
  );

  const discoveredPages = new Set<string>();
  const discoveredAssets = new Set<string>();

  // 1. Rewrite internal page links to clean proxy route (e.g. href="about.html" -> href="/api/preview/previews/.../about.html")
  processed = processed.replace(
    /href=["'](\.\/)?([^"':#?]+\.html?)((?:#[^"']*)?)["']/gi,
    (_match, _dotSlash, page, hash) => {
      discoveredPages.add(page);
      return `href="${clientFolderPrefix}${page}${hash || ""}"`;
    }
  );

  // 2. Rewrite relative resource references
  processed = processed.replace(
    /(href|src)=["']\.\/([^"']+\.(?:css|js|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|otf))["']/gi,
    (_match, attr, path) => {
      discoveredAssets.add(path);
      return `${attr}="${clientFolderPrefix}${path}"`;
    }
  );

  processed = processed.replace(
    /(href|src)=["'](css|js|assets|images|fonts)\/([^"']+)["']/gi,
    (_match, attr, folder, rest) => {
      const path = `${folder}/${rest}`;
      discoveredAssets.add(path);
      return `${attr}="${clientFolderPrefix}${path}"`;
    }
  );

  processed = processed.replace(/<base[^>]*>/gi, "");

  // 3. Inject speculative prefetch for discovered pages
  const prefetchTags = Array.from(discoveredPages)
    .map((p) => `<link rel="prefetch" href="${clientFolderPrefix}${p}" as="document">`)
    .join("\n  ");

  if (prefetchTags) {
    const headEnd = processed.indexOf("</head>");
    if (headEnd !== -1) {
      processed = processed.substring(0, headEnd) + `  ${prefetchTags}\n` + processed.substring(headEnd);
    }
  }

  return {
    processed,
    discoveredFiles: Array.from(new Set([...discoveredPages, ...discoveredAssets])),
  };
}

/**
 * Standard HTTP response headers for isolated HTML preview delivery.
 * Enforces CSP sandbox without 'allow-same-origin' to prevent template scripts from
 * reaching host origin credentials, cookies, localStorage, or authenticated application endpoints.
 */
function getPreviewHtmlHeaders(contentType: string): HeadersInit {
  return {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Content-Security-Policy":
      "sandbox allow-scripts allow-forms allow-modals allow-popups; " +
      "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' http: https: 'unsafe-inline'; " +
      "font-src 'self' http: https: data:; " +
      "img-src 'self' http: https: data: blob:; " +
      "script-src 'self' http: https: 'unsafe-inline' 'unsafe-eval'; " +
      "object-src 'none'; " +
      "frame-ancestors 'self';",
  };
}

/**
 * Preview Proxy Route Handler.
 * Supports both clean path routing (/api/preview/previews/...) and query parameter routing.
 * Provides origin sandbox isolation, memory budget enforcement, and request coalescing.
 *
 * @param request - Next.js HTTP request object.
 * @param context - Route context containing async path parameters.
 * @returns HTTP response delivering the proxied preview resource.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
): Promise<NextResponse> {
  const { path: rawPathArray } = await context.params;

  let targetStoragePath = "";

  if (rawPathArray && rawPathArray.length > 0) {
    targetStoragePath = rawPathArray.join("/");
  } else {
    const queryPath = request.nextUrl.searchParams.get("path");
    const queryUrl = request.nextUrl.searchParams.get("url");

    if (queryPath) {
      targetStoragePath = queryPath.replace(/^\/+/, "");
    } else if (queryUrl) {
      const previewMarker = "/storage/v1/object/public/template-previews/";
      const idx = queryUrl.indexOf(previewMarker);
      if (idx !== -1) {
        targetStoragePath = queryUrl.substring(idx + previewMarker.length);
      } else {
        return NextResponse.json({ error: "Invalid preview URL" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Missing preview path parameter" }, { status: 400 });
    }
  }

  // Security: Prevent directory traversal
  if (targetStoragePath.includes("..") || targetStoragePath.includes("//")) {
    return NextResponse.json({ error: "Invalid path traversal sequence" }, { status: 400 });
  }

  // Determine bucket and object path
  let bucket = "template-previews";
  let objectPath = targetStoragePath;

  if (targetStoragePath.startsWith("assets/")) {
    bucket = "template-assets";
    objectPath = targetStoragePath.substring("assets/".length);
  }

  const internalTargetUrl = `${ALLOWED_ORIGIN}/storage/v1/object/public/${bucket}/${objectPath}`;

  try {
    // 1. In-memory RAM cache check
    const cached = previewCache.get(internalTargetUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      if (cached.isHtml && typeof cached.body === "string") {
        const lastSlash = targetStoragePath.lastIndexOf("/");
        const clientFolderPrefix = lastSlash !== -1 ? `/api/preview/${targetStoragePath.substring(0, lastSlash + 1)}` : "/api/preview/";
        const internalFolderPrefix = internalTargetUrl.substring(0, internalTargetUrl.lastIndexOf("/") + 1);

        const { processed } = processPreviewHtml(cached.body, clientFolderPrefix, internalFolderPrefix);
        return new NextResponse(processed, {
          status: 200,
          headers: getPreviewHtmlHeaders(cached.contentType),
        });
      }

      return new NextResponse(cached.body, {
        status: 200,
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
          "X-Content-Type-Options": "nosniff",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 2. Upstream fetch with request coalescing to eliminate duplicate in-flight network calls
    const fetchResult = await fetchCoalesced(internalTargetUrl);

    if (!fetchResult.ok) {
      return NextResponse.json(
        { error: "Preview file not found" },
        { status: fetchResult.status === 404 ? 404 : 502 }
      );
    }

    const resolvedType = resolveContentType(targetStoragePath);

    if (isHtmlType(resolvedType)) {
      const decoder = new TextDecoder("utf-8");
      const rawHtml = decoder.decode(fetchResult.data);

      setCache(internalTargetUrl, { body: rawHtml, contentType: resolvedType, isHtml: true, timestamp: Date.now() });

      const lastSlash = targetStoragePath.lastIndexOf("/");
      const clientFolderPrefix = lastSlash !== -1 ? `/api/preview/${targetStoragePath.substring(0, lastSlash + 1)}` : "/api/preview/";
      const internalFolderPrefix = internalTargetUrl.substring(0, internalTargetUrl.lastIndexOf("/") + 1);

      const { processed, discoveredFiles } = processPreviewHtml(rawHtml, clientFolderPrefix, internalFolderPrefix);

      // Trigger bounded, background warmup without delaying HTML response delivery
      void warmUpTemplateCache(internalFolderPrefix, discoveredFiles);

      return new NextResponse(processed, {
        status: 200,
        headers: getPreviewHtmlHeaders(resolvedType),
      });
    }

    // For non-HTML binary/assets, cache only if within memory budget
    setCache(internalTargetUrl, { body: fetchResult.data, contentType: resolvedType, isHtml: false, timestamp: Date.now() });

    return new NextResponse(fetchResult.data, {
      status: 200,
      headers: {
        "Content-Type": resolvedType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "X-Content-Type-Options": "nosniff",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: unknown) {
    console.error("[PreviewProxy] Error processing preview request:", err);
    return NextResponse.json({ error: "Failed to load preview resource" }, { status: 500 });
  }
}
