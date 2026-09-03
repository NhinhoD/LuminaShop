import { notFound } from "next/navigation";
import { makeProductRepository, makeAuthRepository, makeOrderRepository, makeLanguageRepository } from "@/infrastructure/supabase/container";
import { BreadcrumbSetter } from "@/presentation/components/common/BreadcrumbSetter";
import { ROUTES } from "@/presentation/constants";
import ProductSelection from "@/presentation/components/product/ProductSelection";
import ProductMediaGallery from "@/presentation/components/product/ProductMediaGallery";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { getLocalizedText } from "@/presentation/utils/locale";
import { Zap, Layers, ShieldCheck, HelpCircle, Star } from "lucide-react";

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

  const authRepo = await makeAuthRepository();
  const currentUser = await authRepo.getCurrentUser();
  let hasPurchased = false;

  if (currentUser) {
    const orderRepo = await makeOrderRepository();
    hasPurchased = await orderRepo.hasPurchasedProduct(currentUser.id, product.id);
  }

  const accordionItems = [
    { 
      title: prodDict.tabArchitecture || (locale === "vi" ? "Kiến trúc & Công nghệ" : "Architecture & Tech Stack"), 
      desc: prodDict.tabArchitectureDesc || (locale === "vi" ? "Next.js 16, Tailwind CSS v4, GSAP 3.15 và Clean Architecture 4 lớp chuẩn mực." : "Next.js 16, Tailwind CSS v4, GSAP 3.15, and strict 4-layer Clean Architecture."),
      Icon: Layers 
    },
    { 
      title: prodDict.tabLicense || (locale === "vi" ? "Quyền sở hữu & Giấy phép" : "License & Commercial Usage"), 
      desc: prodDict.tabLicenseDesc || (locale === "vi" ? "Bản quyền thương mại vĩnh viễn cho dự án doanh nghiệp, miễn phí cập nhật trọn đời." : "Permitted for commercial client projects, lifetime free template updates included."),
      Icon: ShieldCheck 
    },
    { 
      title: prodDict.tabSupport || (locale === "vi" ? "Hỗ trợ kỹ thuật & Triển khai" : "Support & Setup Guide"), 
      desc: prodDict.tabSupportDesc || (locale === "vi" ? "Tài liệu chi tiết kèm mã nguồn, hỗ trợ deploy lên Vercel/Netlify miễn phí." : "Comprehensive documentation included with free deployment guidance for Vercel/Netlify."),
      Icon: HelpCircle 
    },
  ];

  return (
    <main className="flex-grow bg-white py-10 font-sans">
      <BreadcrumbSetter
        currentLabel={getLocalizedText(product.title as unknown as Record<string, string>, locale)}
        parentLabels={{ [ROUTES.SHOP]: locale === "vi" ? "Kho giao diện" : "Templates" }}
      />

      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
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
          <div className="lg:col-span-5 pt-1">
            <div className="mb-6">
              
              {/* Subtle Status Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200/70 mb-3 text-xs text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>
                  {prodDict.badge || (locale === "vi" ? "Mã Nguồn Đã Kiểm Thử" : "Verified Codebase")}
                </span>
              </div>

              {/* Refined Heading */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 leading-[1.25] tracking-tight">
                {getLocalizedText(product.title as unknown as Record<string, string>, locale)}
              </h1>

              {/* Rating & Delivery Info */}
              <div className="flex items-center gap-3 text-xs text-slate-500 font-normal">
                <div className="flex items-center gap-1 text-slate-800 font-semibold">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={11} fill="currentColor" />
                    ))}
                  </div>
                  <span className="ml-0.5">4.9/5</span>
                </div>
                <span className="text-slate-400 font-normal">{prodDict.reviews || "(128 đánh giá)"}</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <Zap size={12} />
                  {prodDict.instantDelivery || (locale === "vi" ? "Tự động bàn giao 24/7" : "Automated Delivery")}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm font-normal">
                {getLocalizedText(product.description as unknown as Record<string, string>, locale) ||
                  (locale === "vi" 
                    ? "Mẫu website chuyên nghiệp được lập trình chuẩn Clean Architecture, đầy đủ hiệu ứng GSAP và Tailwind CSS v4." 
                    : "Professional website template built with clean architecture, modern GSAP animations, and Tailwind CSS v4.")}
              </p>
            </div>

            {/* Price, Options & Purchase Actions */}
            <ProductSelection product={product} hasPurchased={hasPurchased} />

            {/* Technical Accordion / Info Items */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              {accordionItems.map((item) => {
                const Icon = item.Icon;
                return (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={14} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[11.5px] text-slate-500 leading-relaxed font-normal mt-0.5">
                        {item.desc}
                      </p>
                    </div>
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
