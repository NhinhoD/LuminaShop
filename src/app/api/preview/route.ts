import { NextRequest, NextResponse } from "next/server";

/**
 * White-Label Preview Proxy API Route
 *
 * Supabase Storage intentionally forces `Content-Type: text/plain` and injects
 * a restrictive Content-Security-Policy (`default-src 'none'; sandbox`) on ALL
 * HTML files as an XSS security measure. This cannot be overridden at the
 * upload or bucket level.
 *
 * This proxy route fetches the raw file bytes from Supabase Storage and
 * re-serves them with the correct MIME type headers, enabling live HTML
 * previews in storefront iframes without raw-text rendering bugs.
 *
 * For HTML files, a `<base>` tag is injected so that relative sub-resource
 * references (CSS, JS, images) resolve against the original Supabase Storage
 * directory rather than the Next.js host.
 *
 * Usage: /api/preview?url=<supabase_public_storage_url>
 */

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Maps file extensions to correct MIME types for proper browser rendering.
 */
function resolveContentType(url: string): string {
  const pathname = new URL(url).pathname.toLowerCase();
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
 * Extracts the directory URL from a full file URL for base tag injection.
 */
function getBaseUrl(fileUrl: string): string {
  const lastSlash = fileUrl.lastIndexOf("/");
  return lastSlash > 0 ? fileUrl.substring(0, lastSlash + 1) : fileUrl;
}

/**
 * Checks if a content type represents HTML.
 */
function isHtmlType(contentType: string): boolean {
  return contentType.startsWith("text/html");
}

/**
 * Inject a <base> tag into HTML content so that relative resource URLs
 * (CSS, JS, images) resolve against the original Supabase Storage directory.
 */
function injectBaseTag(html: string, baseUrl: string): string {
  const baseTag = `<base href="${baseUrl}" />`;
  // Insert after <head> if present
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch && headMatch.index !== undefined) {
    const insertPos = headMatch.index + headMatch[0].length;
    return html.substring(0, insertPos) + baseTag + html.substring(insertPos);
  }
  // Fallback: insert at beginning of <html> or document
  const htmlMatch = html.match(/<html[^>]*>/i);
  if (htmlMatch && htmlMatch.index !== undefined) {
    const insertPos = htmlMatch.index + htmlMatch[0].length;
    return html.substring(0, insertPos) + "<head>" + baseTag + "</head>" + html.substring(insertPos);
  }
  // Last resort: prepend
  return baseTag + html;
}

/**
 * API route handler that proxies Supabase Storage files with corrected MIME types.
 * Injects base tags into HTML for relative resource resolution and enforces SSRF protection.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const targetUrl = request.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing 'url' query parameter" }, { status: 400 });
  }

  // Security: strictly parse URL and verify origin and path against Supabase public storage
  try {
    const parsedTarget = new URL(targetUrl);
    if (!ALLOWED_ORIGIN) {
      return NextResponse.json({ error: "Server configuration error: Supabase origin missing" }, { status: 500 });
    }
    const parsedAllowed = new URL(ALLOWED_ORIGIN);

    // Exact hostname & protocol verification to block SSRF and sub-domain collision
    if (parsedTarget.protocol !== "https:" && parsedTarget.protocol !== "http:") {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }
    if (parsedTarget.hostname.toLowerCase() !== parsedAllowed.hostname.toLowerCase()) {
      return NextResponse.json({ error: "URL is not from the allowed Supabase origin" }, { status: 403 });
    }

    // Path validation: only allow public preview and storage assets
    const lowerPath = parsedTarget.pathname.toLowerCase();
    if (!lowerPath.startsWith("/storage/v1/object/public/")) {
      return NextResponse.json({ error: "URL path is restricted" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Malformed URL parameter" }, { status: 400 });
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      headers: {
        "Accept-Encoding": "identity",
      },
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: "Upstream fetch failed with status " + upstreamResponse.status },
        { status: upstreamResponse.status }
      );
    }

    const resolvedType = resolveContentType(targetUrl);

    // For HTML files, inject <base> tag and serve as text
    if (isHtmlType(resolvedType)) {
      const rawHtml = await upstreamResponse.text();
      const baseUrl = getBaseUrl(targetUrl);
      const processedHtml = injectBaseTag(rawHtml, baseUrl);

      return new NextResponse(processedHtml, {
        status: 200,
        headers: {
          "Content-Type": resolvedType,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
          "X-Content-Type-Options": "nosniff",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // For non-HTML files, stream binary directly
    const body = await upstreamResponse.arrayBuffer();
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
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Proxy fetch error: " + message }, { status: 500 });
  }
}
