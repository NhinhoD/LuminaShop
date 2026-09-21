import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { 
  makeGetProductByIdUseCase, 
  makeCheckProductPurchasedUseCase, 
  makeGetCurrentUserUseCase, 
  getAppDictionary 
} from "@/server/di/container";
import { BreadcrumbSetter } from "@/client/components/common/BreadcrumbSetter";
import { ROUTES, SITE_URL } from "@/shared/constants";
import ProductSelection from "@/client/components/product/ProductSelection";
import ProductMediaGallery from "@/client/components/product/ProductMediaGallery";
import { getLocale } from "@/i18n/getDictionary";
import { getLocalizedText } from "@/shared/utils/locale";
import { Zap, Layers, ShieldCheck, HelpCircle, Star } from "lucide-react";
import { sanitizeProductForPublic } from "@/server/domain/entities/Product";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generates dynamic SEO metadata for the product detail page.
 * Localizes title and description, configures canonical URL, keywords, and OpenGraph/Twitter cards.
 *
 * @param {ProductPageProps} props - Page properties with async params.
 * @returns {Promise<Metadata>} Next.js page metadata object.
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const [locale, getProductUseCase] = await Promise.all([
    getLocale(),
    makeGetProductByIdUseCase(),
  ]);

  const productResult = await getProductUseCase.execute(id);
  if (!productResult.success || !productResult.data) {
    return {
      title: "Mẫu giao diện không tồn tại",
      description: "Không tìm thấy mẫu giao diện theo yêu cầu trên KhoUI.",
    };
  }

  const product = productResult.data;
  const rawTitle = getLocalizedText(product.title as unknown as Record<string, string>, locale);
  const rawDesc = getLocalizedText(product.description as unknown as Record<string, string>, locale);
  const title = rawTitle;
  const ogTitle = `${rawTitle} — Mẫu Giao Diện Website Cao Cấp`;
  const description = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc || "Mẫu giao diện website cao cấp, chuẩn SEO và tối ưu hiệu năng tại KhoUI.";
  const productUrl = `${SITE_URL}/product/${id}`;

  return {
    title,
    description,
    keywords: [
      rawTitle,
      ...(product.techStack || []),
      "website template",
      "source code",
      "kho giao diện",
      "Next.js template",
      "Tailwind CSS",
      "KhoUI",
    ],
    openGraph: {
      title: ogTitle,
      description,
      url: productUrl,
      siteName: "KhoUI",
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      images: product.imageUrl
        ? [
            {
              url: product.imageUrl,
              width: 1200,
              height: 630,
              alt: rawTitle,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Parallelize initial independent tasks: locale, dictionary, and DI factory creation
  const [locale, dict, getProductUseCase, getCurrentUserUseCase] = await Promise.all([
    getLocale(),
    getAppDictionary(),
    makeGetProductByIdUseCase(),
    makeGetCurrentUserUseCase(),
  ]);
  const prodDict = (dict?.product as Record<string, string>) || {};

  // Execute product query and user lookup in parallel to eliminate waterfall latency
  const [productResult, userResult] = await Promise.all([
    getProductUseCase.execute(id),
    getCurrentUserUseCase.execute(),
  ]);

  if (!productResult.success) {
    console.error("ProductDetailPage: failed to load product:", productResult.error);
    return (
      <main className="flex-grow bg-white py-16 font-sans">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            <p className="font-semibold text-sm">
              {locale === "vi" ? "Không thể tải thông tin sản phẩm từ máy chủ" : "Failed to load product details from database"}
            </p>
            <p className="text-xs text-red-500 mt-1">
              {locale === "vi" ? "Vui lòng thử lại sau." : "Please try again later."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!productResult.data) {
    notFound();
  }
  const product = productResult.data;

  let currentUser = null;
  let hasPurchased = false;
  let purchaseLookupError = false;

  if (!userResult.success) {
    console.error("ProductDetailPage: failed to get current user:", userResult.error);
    purchaseLookupError = true;
  } else {
    currentUser = userResult.data;
    if (currentUser) {
      const checkPurchasedUseCase = await makeCheckProductPurchasedUseCase();
      const purchasedResult = await checkPurchasedUseCase.execute(currentUser.id, product.id);
      if (purchasedResult.success) {
        hasPurchased = purchasedResult.data;
      } else {
        console.error("ProductDetailPage: failed to check purchased status:", purchasedResult.error);
        purchaseLookupError = true;
      }
    }
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

  const localizedTitle = getLocalizedText(product.title as unknown as Record<string, string>, locale);
  const localizedDesc = getLocalizedText(product.description as unknown as Record<string, string>, locale);
  const productUrl = `${SITE_URL}/product/${id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        "name": localizedTitle,
        "description": localizedDesc,
        "image": product.imageUrl ? [product.imageUrl] : [],
        "category": "Software > Web Development > Website Templates",
        "brand": {
          "@type": "Brand",
          "name": "KhoUI"
        },
        "offers": {
          "@type": "Offer",
          "url": productUrl,
          "priceCurrency": "VND",
          "price": product.price,
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition",
          "seller": {
            "@type": "Organization",
            "name": "KhoUI",
            "url": SITE_URL
          }
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${productUrl}#software`,
        "name": localizedTitle,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web, Next.js, Node.js",
        "softwareRequirements": (product.techStack || []).join(", "),
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "VND"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": locale === "vi" ? "Trang chủ" : "Home",
            "item": SITE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": locale === "vi" ? "Kho giao diện" : "Templates",
            "item": `${SITE_URL}/shop`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": localizedTitle,
            "item": productUrl
          }
        ]
      }
    ]
  };

  return (
    <main className="flex-grow bg-white py-10 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <BreadcrumbSetter
        currentLabel={localizedTitle}
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
            <ProductSelection 
              product={sanitizeProductForPublic(product, hasPurchased)} 
              hasPurchased={hasPurchased} 
              purchaseLookupError={purchaseLookupError}
            />

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
