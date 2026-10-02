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
 */
export default async function DemoPage({ params }: DemoPageProps) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as 'vi' | 'en') || 'vi';

  const { id: rawId } = await params;
  const id = rawId.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  const getProductByIdUseCase = await makeGetProductByIdUseCase();
  const productResult = await getProductByIdUseCase.execute(id);

  if (!productResult.success) {
    console.error("DemoPage: failed to load product preview:", productResult.error);
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto">
          <p className="font-semibold text-sm">
            {locale === "vi" ? "Không thể tải bản xem trước sản phẩm từ máy chủ" : "Failed to load product preview from database"}
          </p>
          <p className="text-xs text-red-500 mt-1">
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
