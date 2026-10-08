import type { Metadata } from "next";
import "./globals.css";

function getSafeMetadataBase(): URL {
  const raw = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || 'https://khoui.io.vn';
  try {
    return new URL(raw);
  } catch {
    return new URL('https://khoui.io.vn');
  }
}

export const metadata: Metadata = {
  metadataBase: getSafeMetadataBase(),
  title: {
    default: "KhoUI — Kho Giao Diện Website Template Tĩnh Chuẩn HTML5, CSS3 & Bootstrap",
    template: "%s | KhoUI",
  },
  description: "Nền tảng cung cấp template website tĩnh HTML5, CSS3, JavaScript và Bootstrap 5 chất lượng cao. Tải trọn bộ file tĩnh (.zip), mở trực tiếp trên trình duyệt, dễ dàng tùy biến.",
  keywords: [
    "KhoUI",
    "website template tĩnh",
    "template website",
    "mẫu giao diện html css",
    "template bootstrap 5",
    "html5 template",
    "giao diện web tĩnh",
    "mua template website",
    "file html css có sẵn",
    "landing page template",
  ],
  authors: [{ name: "KhoUI Team", url: "https://khoui.io.vn" }],
  creator: "KhoUI",
  publisher: "KhoUI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "KhoUI — Kho Giao Diện Website Template Tĩnh Chuẩn HTML5, CSS3 & Bootstrap",
    description: "Khám phá và sở hữu các mẫu template website tĩnh chuẩn W3C (HTML5, CSS3, JS, Bootstrap 5). Tải về file tĩnh (.zip) tức thì qua thanh toán VietQR tự động.",
    url: "https://khoui.io.vn",
    siteName: "KhoUI",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/LogoKhoUI.png",
        width: 1200,
        height: 630,
        alt: "KhoUI — Nền tảng Template Website Tĩnh HTML5 & Bootstrap",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KhoUI — Kho Giao Diện Website Template Tĩnh Chuẩn HTML5, CSS3 & Bootstrap",
    description: "Khám phá và sở hữu các mẫu template website tĩnh chuẩn W3C (HTML5, CSS3, JS, Bootstrap 5). Tải trọn bộ file tĩnh (.zip) tức thì.",
    images: ["/LogoKhoUI.png"],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};



import { Suspense } from "react";
import { BreadcrumbProvider } from "@/client/components/common/BreadcrumbContext";
import { I18nProvider, Locale } from "@/client/components/common/I18nContext";
import { getAppDictionary } from "@/server/di/container";
import { ToastContainer } from "@/client/components/common/ToastContainer";
import { GlobalLoadingIndicator } from "@/client/components/common/GlobalLoadingIndicator";
import { SmoothScrollProvider } from "@/client/components/common/SmoothScrollProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "vi";

  const dict = await getAppDictionary();

  return (
    <html lang={locale} className={`light ${plusJakartaSans.variable}`}>
      <body className="bg-background text-on-background font-sans antialiased selection:bg-primary/10 selection:text-primary">
        <I18nProvider locale={locale} customDict={dict as unknown as Record<string, unknown>}>
          <BreadcrumbProvider>
            <SmoothScrollProvider>
              <Suspense fallback={null}>
                <GlobalLoadingIndicator />
              </Suspense>
              {children}
              <ToastContainer />
              <SpeedInsights />
            </SmoothScrollProvider>
          </BreadcrumbProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
