import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KhoUI - Premium UI Templates & Themes",
  description: "Discover exclusive, high-quality website templates and themes. Built with Next.js, Tailwind CSS, and GSAP for modern web development.",
};

import { BreadcrumbProvider } from "@/presentation/components/common/BreadcrumbContext";

import { Bricolage_Grotesque } from 'next/font/google';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "vi";

  return (
    <html lang={locale} className={`light ${bricolageGrotesque.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Poppins:wght@300;400;500;600;700&family=Dancing+Script:wght@700&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background font-bricolage antialiased">
        <BreadcrumbProvider>
          {children}
        </BreadcrumbProvider>
      </body>
    </html>
  );
}
