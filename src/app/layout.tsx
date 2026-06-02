import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuminaShop - Premium Food & Beverage",
  description: "Delicious fast food crafted from premium ingredients. From crispy burgers to gourmet pizzas - every bite is an adventure worth savoring.",
};

import { BreadcrumbProvider } from "@/presentation/components/common/BreadcrumbContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Poppins:wght@300;400;500;600;700&family=Dancing+Script:wght@700&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background font-poppins antialiased">
        <BreadcrumbProvider>
          {children}
        </BreadcrumbProvider>
      </body>
    </html>
  );
}
