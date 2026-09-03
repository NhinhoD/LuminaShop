import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KhoUI - Premium UI Templates & Themes",
  description: "Discover exclusive, high-quality website templates and themes. Built with Next.js, Tailwind CSS, and GSAP for modern web development.",
};

import { BreadcrumbProvider } from "@/presentation/components/common/BreadcrumbContext";
import { I18nProvider, Locale } from "@/presentation/components/common/I18nContext";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { getDictionary } from "@/i18n/getDictionary";
import { ToastContainer } from "@/presentation/components/common/ToastContainer";

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

  const repo = await makeLanguageRepository();
  const dict = await getDictionary(repo);

  return (
    <html lang={locale} className={`light ${plusJakartaSans.variable}`}>
      <body className="bg-background text-on-background font-sans antialiased selection:bg-primary/10 selection:text-primary">
        <I18nProvider locale={locale} customDict={dict as unknown as Record<string, unknown>}>
          <BreadcrumbProvider>
            {children}
            <ToastContainer />
          </BreadcrumbProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
