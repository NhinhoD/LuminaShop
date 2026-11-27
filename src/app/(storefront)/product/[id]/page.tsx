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
  const { id: rawId } = await params;
  const id = rawId.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
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
  const ogTitle = `${rawTitle} — Mẫu Template Website Tĩnh Cao Cấp`;
  const description = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc || "Mẫu template website tĩnh HTML5, CSS3, JavaScript hoặc Bootstrap 5 chất lượng cao tại KhoUI.";
  const productUrl = `${SITE_URL}/product/${id}`;

  const rawImageUrl = product.imageUrl?.trim();
  const productImageUrl = rawImageUrl
    ? rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")
      ? rawImageUrl
      : `${SITE_URL}${rawImageUrl.startsWith("/") ? "" : "/"}${rawImageUrl}`
    : `${SITE_URL}/LogoKhoUI.png`;

  return {
    title,
    description,
    keywords: [
      rawTitle,
      ...(product.techStack || []),
      "template website tĩnh",
      "mẫu html css",
      "template bootstrap 5",
      "giao diện web tĩnh",
      "html5 template",
      "KhoUI",
    ],
    openGraph: {
      title: ogTitle,
      description,
      url: productUrl,
      siteName: "KhoUI",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      type: "website",
      images: [
        {
          url: productImageUrl,
          width: 1200,
          height: 630,
          alt: rawTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [productImageUrl],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

/**
 * Product detail page server component.
 * Displays interactive product media, tech stack, pricing, license accordion, and JSON-LD structured data.
 *
 * @param {ProductPageProps} props - Page properties with async params.
 * @returns {Promise<React.ReactElement>} Next.js page element.
 */
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id: rawId } = await params;
  const id = rawId.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');

  // Parallelize initial independent tasks: locale, dictionary, and DI factory creation
  const [locale, dict, getProductUseCase, getCurrentUserUseCase] = await Promise.all([
    getLocale(),
    getAppDictionary(),
    makeGetProductByIdUseCase(),
    makeGetCurrentUserUseCase(),
  ]);
  const prodDict = (dict?.product as Record<string, string>) || {};
  const homeUi = (dict?.homeUi as Record<string, string>) || {};

  // Execute product query and user lookup in parallel to eliminate waterfall latency
  const [productResult, userResult] = await Promise.all([
    getProductUseCase.execute(id),
    getCurrentUserUseCase.execute(),
  ]);

  if (!productResult.success) {
    console.error("ProductDetailPage: failed to load product:", productResult.error);
    return (
      <main className="flex-grow py-16 font-sans">
        <div className="mx-auto max-w-xl px-6">
          <div className="border border-error/40 bg-surface p-8">
            <span className="mono-meta text-error">
              {locale === "vi" ? "Không thể tải thông tin sản phẩm" : "Failed to load product details"}
            </span>
            <p className="mt-3 text-[12.5px] leading-relaxed text-dark/55">
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
      title: prodDict.tabArchitecture || (locale === "vi" ? "Định dạng file & Công nghệ" : "File Format & Tech Stack"), 
      desc: prodDict.tabArchitectureDesc || (locale === "vi" ? "HTML5 Semantic, CSS3, JavaScript thuần hoặc Bootstrap 5. Cấu trúc file tĩnh chuẩn mực, mở trực tiếp trên trình duyệt." : "HTML5 Semantic, CSS3, Vanilla JS or Bootstrap 5. Clean static files, ready to open in any browser."),
      Icon: Layers 
    },
    { 
      title: prodDict.tabLicense || (locale === "vi" ? "Quyền sở hữu & Giấy phép" : "License & Commercial Usage"), 
      desc: prodDict.tabLicenseDesc || (locale === "vi" ? "Cấp phép sử dụng cho mục đích cá nhân và thương mại của dự án bạn xây dựng, tải lại không giới hạn." : "Permitted for commercial and client projects, lifetime unlimited re-downloads."),
      Icon: ShieldCheck 
    },
    { 
      title: prodDict.tabSupport || (locale === "vi" ? "Hướng dẫn sử dụng & Tùy biến" : "Usage Guide & Customization"), 
      desc: prodDict.tabSupportDesc || (locale === "vi" ? "Tài liệu cấu trúc thư mục, hướng dẫn thay đổi nội dung, màu sắc, hình ảnh và cách nhúng vào các dự án web." : "Comprehensive documentation included with guides for customizing content, images, and static hosting."),
      Icon: HelpCircle 
    },
  ];

  const localizedTitle = getLocalizedText(product.title as unknown as Record<string, string>, locale);
  const localizedDesc = getLocalizedText(product.description as unknown as Record<string, string>, locale);
  const productUrl = `${SITE_URL}/product/${id}`;

  const rawImageUrl = product.imageUrl?.trim();
  const productImageUrl = rawImageUrl
    ? rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")
      ? rawImageUrl
      : `${SITE_URL}${rawImageUrl.startsWith("/") ? "" : "/"}${rawImageUrl}`
    : `${SITE_URL}/LogoKhoUI.png`;

  const validFromIso = product.createdAt
    ? new Date(product.createdAt).toISOString()
    : "2026-01-01T00:00:00.000Z";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        "name": localizedTitle,
        "description": localizedDesc,
        "image": [productImageUrl],
        "sku": product.id,
        "mpn": product.id,
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
          "validFrom": validFromIso,
          "priceValidUntil": "2027-12-31T23:59:59.000Z",
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "itemCondition": "https://schema.org/NewCondition",
          "seller": {
            "@type": "Organization",
            "name": "KhoUI",
            "url": SITE_URL,
            "logo": `${SITE_URL}/LogoKhoUI.png`
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "VND"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "VN"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 0,
                "unitCode": "DAY"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 0,
                "unitCode": "DAY"
              }
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "VN",
            "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted",
            "merchantReturnDays": 0
          }
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${productUrl}#software`,
        "name": localizedTitle,
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Web Browser, HTML5, CSS3, Bootstrap 5",
        "softwareRequirements": (product.techStack || []).join(", ") || "HTML5, CSS3, JavaScript, Bootstrap 5",
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "VND",
          "validFrom": validFromIso,
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
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
            "name": locale === "vi" ? "Kho giao diện tĩnh" : "Static Templates",
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
    <main className="flex-grow py-8 font-sans sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <BreadcrumbSetter
        currentLabel={localizedTitle}
        parentLabels={{ [ROUTES.SHOP]: locale === "vi" ? "Kho giao diện tĩnh" : "Static Templates" }}
      />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: media gallery & interactive sandbox */}
          <div className="lg:col-span-7">
            <ProductMediaGallery
              productId={product.id}
              title={localizedTitle}
              imageUrl={product.imageUrl}
              demoUrl={product.demoUrl}
            />
          </div>

          {/* Right: product details */}
          <div className="lg:col-span-5">
            <div className="mb-6 border-b border-border pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="stamp">
                  <span className="h-1.5 w-1.5 bg-success" />
                  {prodDict.badge}
                </span>
                <span className="mono-meta text-[8.5px] text-dark/35">
                  {homeUi.labelSpec} / {product.slug.slice(0, 14)}
                </span>
              </div>

              <h1 className="mt-4 font-display text-[clamp(1.7rem,3.2vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.04em] text-dark">
                {localizedTitle}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-primary">
                  <span className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={10} fill="currentColor" />
                    ))}
                  </span>
                  <span className="mono-meta ml-1 text-[9px] text-dark">4.9/5</span>
                </span>
                <span className="mono-meta text-[8.5px] text-dark/40">{prodDict.reviews}</span>
                <span className="h-3 w-px bg-border" />
                <span className="mono-meta flex items-center gap-1 text-[8.5px] text-success">
                  <Zap size={10} />
                  {prodDict.instantDelivery}
                </span>
              </div>
            </div>

            <div className="mb-6 border-b border-border pb-6">
              <p className="text-[13px] leading-relaxed text-dark/60">
                {localizedDesc ||
                  (locale === "vi"
                    ? "Mẫu template website tĩnh chuẩn HTML5, CSS3, JavaScript hoặc Bootstrap 5, giao diện hiện đại và tối ưu hiển thị trên mọi thiết bị."
                    : "Professional static website template crafted with HTML5, CSS3, JavaScript or Bootstrap 5, responsive and ready to customize.")}
              </p>
            </div>

            <ProductSelection
              product={sanitizeProductForPublic(product, hasPurchased)}
              hasPurchased={hasPurchased}
              purchaseLookupError={purchaseLookupError}
            />

            <div className="mt-8 border-t border-border">
              {accordionItems.map((item, index) => {
                const Icon = item.Icon;
                return (
                  <div key={item.title} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-border py-4">
                    <span className="mono-meta pt-1 text-[9px] text-dark/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="flex items-center gap-2 text-[12.5px] font-semibold leading-tight text-dark">
                        <Icon size={13} className="text-primary" />
                        {item.title}
                      </h4>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-dark/55">{item.desc}</p>
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
