import { notFound } from "next/navigation";
import { makeProductRepository } from "@/infrastructure/supabase/container";
import { cookies } from "next/headers";
import { getStaticDictionary } from "@/i18n/getDictionary";
import DemoViewerClient from "@/presentation/components/demo/DemoViewerClient";

interface DemoPageProps {
  params: Promise<{ id: string }>;
}

export default async function DemoPage({ params }: DemoPageProps) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as 'vi' | 'en') || 'vi';
  const dict = getStaticDictionary(locale);
  const demoDict = (dict?.demo as Record<string, string>) || {};

  const { id } = await params;
  const productRepository = await makeProductRepository();
  const product = await productRepository.findById(id);

  if (!product || !product.demoUrl) {
    notFound();
  }

  // Get proxied url logic as used in ProductMediaGallery
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
