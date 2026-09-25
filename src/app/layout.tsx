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
    default: "KhoUI — Sàn Giao Dịch Website Template & Source Code Cao Cấp",
    template: "%s | KhoUI",
  },
  description: "Nền tảng cung cấp website template & source code chất lượng cao hàng đầu Việt Nam. Chuẩn Clean Architecture, Next.js 16, Tailwind CSS 4, GSAP. Bản quyền thương mại và thanh toán tự động.",
  keywords: [
    "KhoUI",
    "website templates",
    "mẫu website",
    "source code",
    "Next.js template",
    "Tailwind CSS",
    "GSAP animation",
    "React template",
    "mua mã nguồn",
    "giao diện website",
    "clean architecture",
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
    title: "KhoUI — Sàn Giao Dịch Website Template & Source Code Cao Cấp",
    description: "Khám phá và sở hữu các mẫu website template chuẩn Clean Architecture, Next.js 16, Tailwind CSS 4, GSAP. Tích hợp thanh toán PayOS VietQR tự động.",
    url: "https://khoui.io.vn",
    siteName: "KhoUI",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/LogoKhoUI.png",
        width: 1200,
        height: 630,
        alt: "KhoUI — Nền tảng Website Template & Source Code",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KhoUI — Sàn Giao Dịch Website Template & Source Code Cao Cấp",
    description: "Khám phá và sở hữu các mẫu website template chuẩn Clean Architecture, Next.js 16, Tailwind CSS 4, GSAP.",
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



import { BreadcrumbProvider } from "@/client/components/common/BreadcrumbContext";
import { I18nProvider, Locale } from "@/client/components/common/I18nContext";
import { getAppDictionary } from "@/server/di/container";
import { ToastContainer } from "@/client/components/common/ToastContainer";
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
            {children}
            <ToastContainer />
            <SpeedInsights />
          </BreadcrumbProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
