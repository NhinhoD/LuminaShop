import { notFound } from "next/navigation";
import { makeProductRepository } from "@/infrastructure/supabase/container";
import Link from "next/link";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { cookies } from "next/headers";
import { getLocalizedText } from "@/presentation/utils/locale";

interface DemoPageProps {
  params: Promise<{ id: string }>;
}

export default async function DemoPage({ params }: DemoPageProps) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as 'vi' | 'en') || 'vi';
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
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#1A1A1A]">
      {/* Top Bar */}
      <div className="h-[56px] w-full bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center">
          <Link href="/" className="text-white font-playfair font-bold text-xl tracking-wide hover:text-blue-400 transition-colors">
            KhoUI
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4 text-[#888]">
          <button className="hover:text-white transition-colors" title="Desktop View">
            <Monitor size={18} />
          </button>
          <button className="hover:text-white transition-colors" title="Tablet View">
            <Tablet size={18} />
          </button>
          <button className="hover:text-white transition-colors" title="Mobile View">
            <Smartphone size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href={`/product/${product.id}`}
            className="bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          >
            Buy Now
          </Link>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-grow w-full relative bg-slate-950">
        <iframe 
          src={resolvedIframeSrc} 
          className="w-full h-full border-0 bg-white" 
          sandbox="allow-scripts allow-same-origin allow-popups"
          allow="autoplay; fullscreen; clipboard-read; clipboard-write; encrypted-media"
          title={`Live Demo of ${getLocalizedText(product.title as Record<string, string>, locale)}`}
        />
      </div>
    </div>
  );
}
