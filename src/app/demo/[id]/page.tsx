import { notFound } from "next/navigation";
import { makeGetProductByIdUseCase } from "@/di/container";
import { cookies } from "next/headers";
import { getStaticDictionary } from "@/i18n/getDictionary";
import DemoViewerClient from "@/presentation/components/demo/DemoViewerClient";

interface DemoPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Demo preview page for product templates.
 * Renders an interactive sandbox iframe viewer with device viewport controls and purchase CTA.
 */
export default async function DemoPage({ params }: DemoPageProps) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as 'vi' | 'en') || 'vi';
  const dict = getStaticDictionary(locale);
  const demoDict = (dict?.demo as Record<string, string>) || {};

  const { id } = await params;
  const getProductByIdUseCase = await makeGetProductByIdUseCase();
  const productResult = await getProductByIdUseCase.execute(id);

  if (!productResult.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto">
          <p className="font-semibold text-sm">
            {locale === "vi" ? "Không thể tải bản xem trước sản phẩm từ máy chủ" : "Failed to load product preview from database"}
          </p>
          <p className="text-xs text-red-500 mt-1 font-mono">
            {productResult.error.message || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  const product = productResult.data;

  if (!product || !product.demoUrl) {
    notFound();
  }

  /**
   * Proxies Supabase Storage URLs through the Next.js API route to correct MIME types.
   */
  function getProxiedPreviewUrl(url: string): string {
    if (url.includes("supabase.co/storage/")) {
      return "/api/preview?url=" + encodeURIComponent(url);
    }
    return url;
  }
  
  const resolvedIframeSrc = getProxiedPreviewUrl(product.demoUrl);

  return (
    <DemoViewerClient
      product={{
        id: product.id,
        title: product.title as Record<string, string>,
        price: Number(product.price),
        demoUrl: product.demoUrl,
      }}
      resolvedIframeSrc={resolvedIframeSrc}
      locale={locale}
      buyNowText={demoDict.buyNow || (locale === "vi" ? "Mua Bản Quyền Ngay" : "Buy License Now")}
      backText={demoDict.back || (locale === "vi" ? "Chi tiết" : "Back to Details")}
    />
  );
}
