import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { makeGetProductsUseCase, makeGetCategoriesUseCase, getAppDictionary } from "@/server/di/container";
import HomePageClient from "@/client/components/home/HomePageClient";
import { sanitizeProductsForPublic } from "@/server/domain/entities/Product";
import { productSchema } from "@/shared/validations/product";
import { getLocale } from "@/i18n/getDictionary";
import type { vi } from "@/i18n/dictionaries/vi";
import { z } from "zod";
import { SITE_URL } from "@/shared/constants";

export const metadata: Metadata = {
  title: "KhoUI — Sàn Giao Dịch Website Template & Source Code Cao Cấp",
  description: "Nền tảng website templates & source code chuẩn Clean Architecture hàng đầu Việt Nam. Tích hợp thanh toán PayOS VietQR tự động, bàn giao bản quyền tức thì.",
  openGraph: {
    title: "KhoUI — Sàn Giao Dịch Website Template & Source Code Cao Cấp",
    description: "Nền tảng website templates & source code chuẩn Clean Architecture hàng đầu Việt Nam. Tích hợp thanh toán PayOS VietQR tự động, bàn giao bản quyền tức thì.",
    url: SITE_URL,
    siteName: "KhoUI",
    type: "website",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

interface HomePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Storefront Homepage server component.
 * Renders hero section, category filters, featured products showcase, and JSON-LD structured data.
 *
 * @param {HomePageProps} props - Page properties with async searchParams.
 * @returns {Promise<React.ReactElement>} Next.js page element.
 */
export default async function HomePage({ searchParams }: HomePageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const rawPage = typeof params?.page === "string" ? parseInt(params.page, 10) : 1;
  const currentPage = Number.isSafeInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const categoryParam = typeof params?.category === "string" ? params.category : "all";
  const limit = 6;
  const offset = (currentPage - 1) * limit;

  const dictionary = await getAppDictionary();
  const locale = await getLocale();
  
  const getProductsUseCase = await makeGetProductsUseCase();
  const getCategoriesUseCase = await makeGetCategoriesUseCase();

  const categoryId = categoryParam !== "all" ? categoryParam : undefined;

  const [productsResult, categoriesResult] = await Promise.all([
    getProductsUseCase.execute({ 
      limit, 
      offset, 
      isActive: true,
      categoryId
    }),
    getCategoriesUseCase.execute(),
  ]);

  if (!productsResult.success) {
    console.error("[HomePage] Failed to fetch products from database:", productsResult.error);
    return (
      <main className="flex flex-col min-h-screen items-center justify-center p-6 bg-background-subtle/40 font-sans">
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto my-12 font-sans">
          <p className="font-semibold text-sm">
            {locale === "vi" ? "Không thể tải danh sách sản phẩm từ máy chủ" : "Failed to load products from database"}
          </p>
          <p className="text-xs text-red-500 mt-1 font-sans">
            {locale === "vi" ? "Vui lòng làm mới trang hoặc thử lại sau giây lát." : "Please refresh or try again shortly."}
          </p>
        </div>
      </main>
    );
  }

  if (!categoriesResult.success) {
    console.error("[HomePage] Failed to fetch categories from database:", categoriesResult.error);
    return (
      <main className="flex flex-col min-h-screen items-center justify-center p-6 bg-background-subtle/40 font-sans">
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto my-12 font-sans">
          <p className="font-semibold text-sm">
            {locale === "vi" ? "Không thể tải danh mục sản phẩm từ máy chủ" : "Failed to load product categories from database"}
          </p>
          <p className="text-xs text-red-500 mt-1 font-sans">
            {locale === "vi" ? "Vui lòng làm mới trang hoặc thử lại sau giây lát." : "Please refresh or try again shortly."}
          </p>
        </div>
      </main>
    );
  }

  const rawProducts = productsResult.data.products;
  const featuredProducts = z.array(productSchema).parse(rawProducts);
  const totalProducts = productsResult.data.total;
  const categories = categoriesResult.data.categories;

  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
  if (totalProducts > 0 && currentPage > totalPages) {
    const redirectParams = new URLSearchParams();
    if (categoryParam !== "all") {
      redirectParams.set("category", categoryParam);
    }
    if (totalPages > 1) {
      redirectParams.set("page", totalPages.toString());
    }
    const qs = redirectParams.toString();
    redirect(qs ? `/?${qs}#showcase` : "/#showcase");
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "KhoUI",
        "description": "Vietnam's Premium Website Template & Source Code Marketplace",
        "inLanguage": locale === "vi" ? "vi-VN" : "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/shop?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "KhoUI",
        "url": SITE_URL,
        "description": "Nền tảng cung cấp website templates & source code chuẩn Clean Architecture hàng đầu Việt Nam.",
        "sameAs": [
          "https://github.com/NhinhoD/LuminaShop"
        ]
      }
    ]
  };

  return (
    <main className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomePageClient 
        featuredProducts={sanitizeProductsForPublic(featuredProducts)} 
        totalProducts={totalProducts}
        initialPage={currentPage}
        initialCategory={categoryParam}
        categories={categories} 
        dict={dictionary as unknown as typeof vi} 
      />
    </main>
  );
}
