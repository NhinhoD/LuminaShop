import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || 'https://khoui.io.vn'),

  title: "KhoUI - Premium UI Templates & Themes",
  description: "Discover exclusive, high-quality website templates and themes. Built with Next.js, Tailwind CSS, and GSAP for modern web development.",
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
