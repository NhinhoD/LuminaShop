import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { makeGetProductByIdUseCase } from "@/server/di/container";
import { resolveCleanPreviewUrl } from "@/shared/utils";

interface DemoPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Demo preview redirect route.
 * Directly redirects to the full clean preview URL (/api/preview/previews/...).
 *
 * @param props - Component props containing the async params object with product ID.
 * @returns Resolves with a Next.js redirect or error fallback UI.
 */
export const metadata = { title: { absolute: "Xem trước template | KhoUI" } };

/**
 * Redirects to the sandboxed preview for the requested product.
 */
export default async function DemoPage({ params }: DemoPageProps): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as 'vi' | 'en') || 'vi';

  const { id: rawId } = await params;
  const id = rawId.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  const getProductByIdUseCase = await makeGetProductByIdUseCase();
  const productResult = await getProductByIdUseCase.execute(id);

  if (!productResult.success) {
    console.error("DemoPage: failed to load product preview:", productResult.error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 font-sans">
        <div className="mx-auto max-w-xl border border-error/40 bg-surface p-8">
          <span className="mono-meta text-error">
            {locale === "vi" ? "Không thể tải bản xem trước sản phẩm" : "Failed to load product preview"}
          </span>
          <p className="mt-3 text-[12.5px] leading-relaxed text-dark/55">
            {locale === "vi" ? "Vui lòng thử lại sau." : "Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  const product = productResult.data;
  const normalizedDemoUrl = product?.demoUrl?.trim() || "";

  const isUrlValid = Boolean(
    normalizedDemoUrl &&
    (normalizedDemoUrl.startsWith("http://") || normalizedDemoUrl.startsWith("https://") || normalizedDemoUrl.startsWith("/api/"))
  );

  if (!product || !normalizedDemoUrl || !isUrlValid) {
    notFound();
  }

  const resolvedIframeSrc = resolveCleanPreviewUrl(normalizedDemoUrl);
  redirect(resolvedIframeSrc);
}
