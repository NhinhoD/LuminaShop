import { NextRequest, NextResponse } from "next/server";

/**
 * 100% White-Label, Secure Preview Proxy with Origin Sandboxing & Resource Protection.
 * Conceals Supabase project identifiers and backend storage paths completely.
 *
 * Security & Resource Protections:
 * 1. Sandboxed Unique Origin (CSP sandbox without allow-same-origin) on HTML to isolate cookies/storage.
 * 2. Active asset sandbox (CSP sandbox on SVG images) to prevent malicious script execution on direct navigation.
 * 3. Strict read limits (readBoundedBuffer / readBoundedText) to prevent unbounded memory allocation.
 * 4. Direct response streaming for oversized non-HTML assets to bypass RAM buffering completely.
 * 5. On-demand 1:1 asset fetching without background amplification or speculative prefetching.
 */

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Maximum memory entries permitted in the in-memory LRU cache */
const MAX_CACHE_SIZE = 150;

/** Maximum byte length per cached item (2MB) - larger assets are streamed without RAM storage */
const MAX_CACHE_ITEM_SIZE_BYTES = 2 * 1024 * 1024;

/** In-memory cache time-to-live (30 minutes) */
const CACHE_TTL_MS = 1000 * 60 * 30;

interface CacheEntry {
  body: string | ArrayBuffer;
  contentType: string;
  isHtml: boolean;
  timestamp: number;
}

const previewCache = new Map<string, CacheEntry>();

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
 * Reads a response stream into an ArrayBuffer while strictly enforcing a maximum byte limit.
 * If the body exceeds maxBytes, reading is aborted and null is returned to prevent memory exhaustion.
 *
 * @param res - Fetch response stream.
 * @param maxBytes - Maximum permitted byte size.
 * @returns ArrayBuffer if within size limit, null if oversized or error.
 */
async function readBoundedBuffer(res: Response, maxBytes: number): Promise<ArrayBuffer | null> {
  const contentLength = Number(res.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes) {
    return null;
  }

  if (!res.body) {
    return new ArrayBuffer(0);
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          await reader.cancel("Size limit exceeded");
          return null;
        }
        chunks.push(value);
      }
    }
  } catch {
    return null;
  }

  const result = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result.buffer;
}

/**
 * Reads a response stream into a UTF-8 string while strictly enforcing a maximum byte limit.
 * If the body exceeds maxBytes, reading is aborted and null is returned to prevent memory exhaustion.
 *
 * @param res - Fetch response stream.
 * @param maxBytes - Maximum permitted byte size.
 * @returns Decoded UTF-8 string if within size limit, null if oversized.
 */
async function readBoundedText(res: Response, maxBytes: number): Promise<string | null> {
  const buffer = await readBoundedBuffer(res, maxBytes);
  if (!buffer) return null;
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(buffer);
}

/**
 * Rewrites relative HTML resource links and page navigations to use the clean preview proxy.
 *
 * @param html - Raw HTML text content.
 * @param clientFolderPrefix - Target proxy path prefix for client URLs.
 * @returns Transformed HTML string.
 */
function processPreviewHtml(
  html: string,
  clientFolderPrefix: string
): string {
  let processed = html.replace(
    /<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?Mock link disabled[\s\S]*?<\/script>/gi,
    ""
  );

  // 1. Rewrite internal page links to clean proxy route (e.g. href="about.html" -> href="/api/preview/previews/.../about.html")
  processed = processed.replace(
    /href=["'](\.\/)?([^"':#?]+\.html?)((?:#[^"']*)?)["']/gi,
    (_match, _dotSlash, page, hash) => {
      return `href="${clientFolderPrefix}${page}${hash || ""}"`;
    }
  );

  // 2. Rewrite relative resource references
  processed = processed.replace(
    /(href|src)=["']\.\/([^"']+\.(?:css|js|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|otf))["']/gi,
    (_match, attr, path) => {
      return `${attr}="${clientFolderPrefix}${path}"`;
    }
  );

  processed = processed.replace(
    /(href|src)=["'](css|js|assets|images|fonts)\/([^"']+)["']/gi,
    (_match, attr, folder, rest) => {
      const path = `${folder}/${rest}`;
      return `${attr}="${clientFolderPrefix}${path}"`;
    }
  );

  processed = processed.replace(/<base[^>]*>/gi, "");

  return processed;
}

/**
 * Standard HTTP response headers for isolated HTML preview delivery.
 * Enforces CSP sandbox without 'allow-same-origin' to prevent template scripts from
 * reaching host origin credentials, cookies, localStorage, or authenticated application endpoints.
 *
 * @param contentType - Response content type.
 * @returns Header dictionary.
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
 * Helper to build response headers for non-HTML assets.
 * Adds Content-Security-Policy sandbox to SVGs and active-content/non-image/non-font assets
 * (JavaScript, CSS, JSON, etc.) to isolate execution under an opaque origin if navigated to
 * directly in a top-level browser tab.
 *
 * Retains Access-Control-Allow-Origin: * intentionally for sandboxed preview contexts and
 * cross-origin subresources (such as web fonts, canvas images, and stylesheets) loaded by previews.
 *
 * @param contentType - MIME content type of the asset.
 * @returns Headers dictionary for non-HTML assets.
 */
function getAssetHeaders(contentType: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=86400, s-maxage=86400",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    // Intentionally retained for sandboxed preview contexts and cross-origin subresource loading
    "Access-Control-Allow-Origin": "*",
  };

  const isStandardImage = contentType.startsWith("image/") && contentType !== "image/svg+xml";
  const isFont = contentType.startsWith("font/");

  // Enforce restrictive sandbox CSP on SVGs and non-image/non-font assets (JS, CSS, JSON, etc.)
  // to isolate execution under an opaque origin if navigated to directly in top-level browser tab.
  if (!isStandardImage && !isFont) {
    headers["Content-Security-Policy"] =
      "sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src data:; object-src 'none';";
  }

  return headers;
}

/**
 * Resolves the Content-Disposition header value for download requests.
 * Uses custom filename if provided, otherwise extracts filename from storage path.
 * Respects upstream Content-Disposition if already provided by Supabase Storage.
 *
 * @param objectPath - Supabase storage object path.
 * @param customFilename - Optional custom filename requested via query parameter.
 * @param upstreamDisposition - Optional Content-Disposition header from upstream response.
 * @returns Formatted Content-Disposition header string.
 */
function resolveContentDisposition(
  objectPath: string,
  customFilename?: string,
  upstreamDisposition?: string | null
): string {
  if (upstreamDisposition && upstreamDisposition.toLowerCase().includes("attachment")) {
    return upstreamDisposition;
  }
  const fallbackFilename = objectPath.split("/").pop() || "download";
  const chosenName = (customFilename?.trim() || fallbackFilename).replace(/["\r\n/\\]/g, "");
  return `attachment; filename="${chosenName}"`;
}

/**
 * Preview Proxy Route Handler.
 * Supports both clean path routing (/api/preview/previews/...) and query parameter routing.
 * Provides origin sandbox isolation, memory budget enforcement, bounded streaming, SVG script protection,
 * and honors storage download semantics (?download parameter) by returning files as attachments.
 *
 * @param request - Next.js HTTP request object.
 * @param context - Route context containing async path parameters.
 * @returns HTTP response delivering the proxied preview resource or download.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
): Promise<NextResponse> {
  const { path: rawPathArray } = await context.params;

  let targetStoragePath = "";
  const queryUrl = request.nextUrl.searchParams.get("url");

  if (rawPathArray && rawPathArray.length > 0) {
    targetStoragePath = rawPathArray.join("/");
  } else {
    const queryPath = request.nextUrl.searchParams.get("path");

    if (queryPath) {
      targetStoragePath = queryPath.replace(/^\/+/, "");
    } else if (queryUrl) {
      const previewMarker = "/storage/v1/object/public/template-previews/";
      try {
        const parsedQueryUrl = new URL(queryUrl);
        const storageOrigin = ALLOWED_ORIGIN ? new URL(ALLOWED_ORIGIN).origin : "";
        if (storageOrigin && parsedQueryUrl.origin !== storageOrigin) {
          return NextResponse.json({ error: "Preview URL origin is not permitted" }, { status: 400 });
        }
        if (parsedQueryUrl.pathname.startsWith(previewMarker)) {
          targetStoragePath = parsedQueryUrl.pathname.substring(previewMarker.length);
        } else {
          return NextResponse.json({ error: "Invalid preview URL" }, { status: 400 });
        }
      } catch {
        const idx = queryUrl.indexOf(previewMarker);
        if (idx !== -1) {
          targetStoragePath = queryUrl.substring(idx + previewMarker.length);
        } else {
          return NextResponse.json({ error: "Invalid preview URL" }, { status: 400 });
        }
      }
    } else {
      return NextResponse.json({ error: "Missing preview path parameter" }, { status: 400 });
    }
  }

  // Security: Prevent directory traversal
  if (targetStoragePath.includes("..") || targetStoragePath.includes("//")) {
    return NextResponse.json({ error: "Invalid path traversal sequence" }, { status: 400 });
  }

  // Check for download parameter in request query or inside queryUrl
  let isDownload = request.nextUrl.searchParams.has("download");
  let downloadFilename = request.nextUrl.searchParams.get("download") ?? "";

  if (!isDownload && queryUrl) {
    try {
      const parsedQ = new URL(queryUrl);
      if (parsedQ.searchParams.has("download")) {
        isDownload = true;
        downloadFilename = parsedQ.searchParams.get("download") ?? "";
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  // Determine bucket and object path
  let bucket = "template-previews";
  let objectPath = targetStoragePath;

  if (targetStoragePath.startsWith("assets/")) {
    bucket = "template-assets";
    objectPath = targetStoragePath.substring("assets/".length);
  }

  const upstreamQuery = isDownload
    ? (downloadFilename ? `?download=${encodeURIComponent(downloadFilename)}` : "?download")
    : "";
  const internalTargetUrl = `${ALLOWED_ORIGIN}/storage/v1/object/public/${bucket}/${objectPath}${upstreamQuery}`;

  try {
    // 1. In-memory RAM cache check
    const cached = previewCache.get(internalTargetUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      if (isDownload) {
        const headers = new Headers(getAssetHeaders(cached.contentType));
        headers.set("Content-Disposition", resolveContentDisposition(objectPath, downloadFilename));
        return new NextResponse(cached.body, {
          status: 200,
          headers,
        });
      }

      if (cached.isHtml && typeof cached.body === "string") {
        const lastSlash = targetStoragePath.lastIndexOf("/");
        const clientFolderPrefix = lastSlash !== -1 ? `/api/preview/${targetStoragePath.substring(0, lastSlash + 1)}` : "/api/preview/";

        const processed = processPreviewHtml(cached.body, clientFolderPrefix);
        return new NextResponse(processed, {
          status: 200,
          headers: getPreviewHtmlHeaders(cached.contentType),
        });
      }

      return new NextResponse(cached.body, {
        status: 200,
        headers: getAssetHeaders(cached.contentType),
      });
    }

    // 2. Upstream fetch from Supabase Storage
    const upstreamResponse = await fetch(internalTargetUrl, {
      headers: { "Accept-Encoding": "identity" },
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: "Preview file not found" },
        { status: upstreamResponse.status === 404 ? 404 : 502 }
      );
    }

    const resolvedType = resolveContentType(targetStoragePath);
    const upstreamDisposition = upstreamResponse.headers.get("content-disposition");
    const dispositionHeader = isDownload
      ? resolveContentDisposition(objectPath, downloadFilename, upstreamDisposition)
      : null;

    // Case A: Download request (?download parameter) - return as file attachment without HTML rewriting
    if (isDownload) {
      const contentLength = Number(upstreamResponse.headers.get("content-length") ?? 0);
      const canCache = contentLength > 0 && contentLength <= MAX_CACHE_ITEM_SIZE_BYTES;

      const headers = new Headers(getAssetHeaders(resolvedType));
      if (dispositionHeader) {
        headers.set("Content-Disposition", dispositionHeader);
      }

      if (canCache) {
        const buffer = await readBoundedBuffer(upstreamResponse, MAX_CACHE_ITEM_SIZE_BYTES);
        if (buffer) {
          setCache(internalTargetUrl, { body: buffer, contentType: resolvedType, isHtml: false, timestamp: Date.now() });
          return new NextResponse(buffer, {
            status: 200,
            headers,
          });
        }
      }

      return new NextResponse(upstreamResponse.body, {
        status: 200,
        headers,
      });
    }

    // Case B: HTML documents for inline preview (enforce strict read limit before buffering into RAM for URL rewriting)
    if (isHtmlType(resolvedType)) {
      const rawHtml = await readBoundedText(upstreamResponse, MAX_CACHE_ITEM_SIZE_BYTES);

      if (rawHtml === null) {
        return NextResponse.json(
          { error: "Preview HTML file exceeds maximum allowed size" },
          { status: 413 }
        );
      }

      setCache(internalTargetUrl, { body: rawHtml, contentType: resolvedType, isHtml: true, timestamp: Date.now() });

      const lastSlash = targetStoragePath.lastIndexOf("/");
      const clientFolderPrefix = lastSlash !== -1 ? `/api/preview/${targetStoragePath.substring(0, lastSlash + 1)}` : "/api/preview/";

      const processed = processPreviewHtml(rawHtml, clientFolderPrefix);

      return new NextResponse(processed, {
        status: 200,
        headers: getPreviewHtmlHeaders(resolvedType),
      });
    }

    // Case C: Non-HTML assets (CSS, JS, images, fonts, binaries)
    const contentLength = Number(upstreamResponse.headers.get("content-length") ?? 0);
    const canCache = contentLength > 0 && contentLength <= MAX_CACHE_ITEM_SIZE_BYTES;

    if (canCache) {
      const buffer = await readBoundedBuffer(upstreamResponse, MAX_CACHE_ITEM_SIZE_BYTES);
      if (buffer) {
        setCache(internalTargetUrl, { body: buffer, contentType: resolvedType, isHtml: false, timestamp: Date.now() });
        return new NextResponse(buffer, {
          status: 200,
          headers: getAssetHeaders(resolvedType),
        });
      }
    }

    // Stream directly for oversized or unknown-length assets without loading into RAM
    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers: getAssetHeaders(resolvedType),
    });
  } catch (err: unknown) {
    console.error("[PreviewProxy] Error processing preview request:", err);
    return NextResponse.json({ error: "Failed to load preview resource" }, { status: 500 });
  }
}
