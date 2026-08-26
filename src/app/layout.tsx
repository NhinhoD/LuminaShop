import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KhoUI - Premium UI Templates & Themes",
  description: "Discover exclusive, high-quality website templates and themes. Built with Next.js, Tailwind CSS, and GSAP for modern web development.",
};

import { BreadcrumbProvider } from "@/presentation/components/common/BreadcrumbContext";

import { Bricolage_Grotesque, Poppins, Playfair_Display, Dancing_Script, Manrope } from 'next/font/google';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-dancing',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
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

  const fontClasses = `${bricolageGrotesque.variable} ${poppins.variable} ${playfairDisplay.variable} ${dancingScript.variable} ${manrope.variable}`;

  return (
    <html lang={locale} className={`light ${fontClasses}`}>
      <body className="bg-background text-on-background font-bricolage antialiased">
        <BreadcrumbProvider>
          {children}
        </BreadcrumbProvider>
      </body>
    </html>
  );
}
