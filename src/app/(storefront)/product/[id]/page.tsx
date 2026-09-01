import { notFound } from "next/navigation";
import { makeProductRepository, makeSupabaseClient, makeLanguageRepository } from "@/infrastructure/supabase/container";
import { BreadcrumbSetter } from "@/presentation/components/common/BreadcrumbSetter";
import { ROUTES } from "@/presentation/constants";
import ProductSelection from "@/presentation/components/product/ProductSelection";
import ProductMediaGallery from "@/presentation/components/product/ProductMediaGallery";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { getLocalizedText } from "@/presentation/utils/locale";
import { Zap, Layers, ShieldCheck, HelpCircle } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productRepository = await makeProductRepository();
  const product = await productRepository.findById(id);

  if (!product) {
    notFound();
  }
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const prodDict = (dict?.product as Record<string, string>) || {};

  const supabase = await makeSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  let hasPurchased = false;

  if (user) {
    const { data: purchasedItems } = await supabase
      .from('order_items')
      .select('order_id, orders!inner(user_id, payment_status)')
      .eq('product_id', product.id)
      .eq('orders.user_id', user.id)
      .eq('orders.payment_status', 'paid')
      .limit(1);
    
    if (purchasedItems && purchasedItems.length > 0) {
      hasPurchased = true;
    }
  }

  const accordionItems = [
    { 
      title: prodDict.tabArchitecture || (locale === "vi" ? "Kiến trúc & Công nghệ" : "Architecture & Tech Stack"), 
      desc: prodDict.tabArchitectureDesc || (locale === "vi" ? "Next.js 15, Tailwind v4, GSAP ScrollTrigger, Clean Architecture chuẩn mực." : "Next.js 15, Tailwind v4, GSAP ScrollTrigger, and strict Clean Architecture."),
      Icon: Layers 
    },
    { 
      title: prodDict.tabLicense || (locale === "vi" ? "Quyền sở hữu & Giấy phép" : "License & Commercial Usage"), 
      desc: prodDict.tabLicenseDesc || (locale === "vi" ? "Cấp phép sử dụng cho dự án thương mại, miễn phí cập nhật trọn đời." : "Permitted for commercial client projects, lifetime free template updates included."),
      Icon: ShieldCheck 
    },
    { 
      title: prodDict.tabSupport || (locale === "vi" ? "Hỗ trợ kỹ thuật & Hướng dẫn" : "Support & Setup Guide"), 
      desc: prodDict.tabSupportDesc || (locale === "vi" ? "Tài liệu chi tiết kèm mã nguồn, hỗ trợ deploy lên Vercel/Netlify miễn phí." : "Comprehensive documentation included with free deployment guidance for Vercel/Netlify."),
      Icon: HelpCircle 
    },
  ];

  return (
    <main className="flex-grow bg-white py-12">
      <BreadcrumbSetter
        currentLabel={getLocalizedText(product.title as unknown as Record<string, string>, locale)}
        parentLabels={{ [ROUTES.SHOP]: locale === "vi" ? "Giao diện" : "Templates" }}
      />

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Media Gallery & Interactive Sandbox */}
          <div className="lg:col-span-7">
            <ProductMediaGallery
              productId={product.id}
              title={getLocalizedText(product.title as unknown as Record<string, string>, locale)}
              imageUrl={product.imageUrl}
              demoUrl={product.demoUrl}
            />
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-5 pt-2">
            <div className="mb-8">
              <p className="text-[0.7rem] font-bold text-[#0051d5] uppercase tracking-widest mb-3">
                {prodDict.badge || (locale === "vi" ? "GIAO DIỆN CAO CẤP" : "PREMIUM SELECTION")}
              </p>
              <h1 className="text-4xl font-black text-dark mb-4 leading-tight font-playfair">
                {getLocalizedText(product.title as unknown as Record<string, string>, locale)}
              </h1>
              <div className="flex items-center gap-3 text-secondary text-sm">
                <span>⭐ 4.9</span>
                <span className="text-[#bbb]">{prodDict.reviews || "(128 reviews)"}</span>
                <span className="w-px h-4 bg-[#ddd]" />
                <span className="text-emerald-600 text-[0.75rem] font-bold flex items-center gap-1">
                  <Zap size={14} />
                  {prodDict.instantDelivery || (locale === "vi" ? "Tải về tự động tức thì" : "Instant Automated Download")}
                </span>
              </div>
            </div>

            <div className="mb-8 pb-8 border-b border-[#f0f0f0]">
              <p className="text-[#777] leading-relaxed text-sm">
                {getLocalizedText(product.description as unknown as Record<string, string>, locale) ||
                  (locale === "vi" 
                    ? "Mẫu website chuyên nghiệp được lập trình chuẩn Clean Architecture, đầy đủ hiệu ứng GSAP và Tailwind CSS v4." 
                    : "Professional website template built with clean architecture, modern GSAP animations, and Tailwind CSS v4.")}
              </p>
            </div>

            <ProductSelection product={product} hasPurchased={hasPurchased} />

            {/* Extra Info Accordions */}
            <div className="mt-12 space-y-0">
              {accordionItems.map((item) => {
                const Icon = item.Icon;
                return (
                  <div
                    key={item.title}
                    className="py-5 border-t border-[#f0f0f0]"
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <Icon size={16} className="text-[#0051d5]" />
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-manrope">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 pl-7 leading-relaxed font-manrope">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
