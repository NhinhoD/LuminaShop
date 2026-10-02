import { NextRequest, NextResponse } from "next/server";

/**
 * 100% White-Label, Secure Preview Proxy
 * Conceals Supabase project identifiers and storage paths entirely.
 *
 * Clean routing support:
 *   /api/preview/previews/<template-folder>/index.html
 *   /api/preview/previews/<template-folder>/css/style.css
 * Backward compatibility:
 *   /api/preview?path=previews/...
 *   /api/preview?url=https://...
 */

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

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

function isHtmlType(contentType: string): boolean {
  return contentType.startsWith("text/html");
}

interface CacheEntry {
  body: string | ArrayBuffer;
  contentType: string;
  isHtml: boolean;
  timestamp: number;
}

const previewCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes in RAM
const MAX_CACHE_SIZE = 500;

function setCache(key: string, entry: CacheEntry) {
  if (previewCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = previewCache.keys().next().value;
    if (oldestKey) previewCache.delete(oldestKey);
  }
  previewCache.set(key, entry);
}

function warmUpTemplateCache(baseInternalUrl: string, discoveredFiles: string[]) {
  const filesToWarm = Array.from(new Set(discoveredFiles));
  for (const relPath of filesToWarm) {
    const targetUrl = `${baseInternalUrl}${relPath}`;
    if (previewCache.has(targetUrl)) continue;

    fetch(targetUrl, { headers: { "Accept-Encoding": "identity" } })
      .then(async (res) => {
        if (!res.ok) return;
        const resolvedType = resolveContentType(targetUrl);
        if (isHtmlType(resolvedType)) {
          const text = await res.text();
          setCache(targetUrl, { body: text, contentType: resolvedType, isHtml: true, timestamp: Date.now() });
        } else {
          const buffer = await res.arrayBuffer();
          setCache(targetUrl, { body: buffer, contentType: resolvedType, isHtml: false, timestamp: Date.now() });
        }
      })
      .catch(() => {});
  }
}

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
          headers: {
            "Content-Type": cached.contentType,
            "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "SAMEORIGIN",
            "Content-Security-Policy":
              "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; style-src 'self' https: 'unsafe-inline'; font-src 'self' https: data:; img-src 'self' https: data: blob:; script-src 'self' https: 'unsafe-inline' 'unsafe-eval'; object-src 'none'; frame-ancestors 'self'; base-uri 'self' https:;",
          },
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

    // 2. Upstream fetch from Supabase Storage (strictly backend-to-backend)
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

    if (isHtmlType(resolvedType)) {
      const rawHtml = await upstreamResponse.text();
      setCache(internalTargetUrl, { body: rawHtml, contentType: resolvedType, isHtml: true, timestamp: Date.now() });

      const lastSlash = targetStoragePath.lastIndexOf("/");
      const clientFolderPrefix = lastSlash !== -1 ? `/api/preview/${targetStoragePath.substring(0, lastSlash + 1)}` : "/api/preview/";
      const internalFolderPrefix = internalTargetUrl.substring(0, internalTargetUrl.lastIndexOf("/") + 1);

      const { processed, discoveredFiles } = processPreviewHtml(rawHtml, clientFolderPrefix, internalFolderPrefix);

      warmUpTemplateCache(internalFolderPrefix, discoveredFiles);

      return new NextResponse(processed, {
        status: 200,
        headers: {
          "Content-Type": resolvedType,
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "SAMEORIGIN",
          "Content-Security-Policy":
            "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; style-src 'self' https: 'unsafe-inline'; font-src 'self' https: data:; img-src 'self' https: data: blob:; script-src 'self' https: 'unsafe-inline' 'unsafe-eval'; object-src 'none'; frame-ancestors 'self'; base-uri 'self' https:;",
        },
      });
    }

    const body = await upstreamResponse.arrayBuffer();
    setCache(internalTargetUrl, { body, contentType: resolvedType, isHtml: false, timestamp: Date.now() });

    return new NextResponse(body, {
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
