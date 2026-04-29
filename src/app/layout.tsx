import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUMINA - E-commerce",
  description: "Built for excellence",
};

import { BreadcrumbProvider } from "@/presentation/components/common/BreadcrumbContext";
import { CartProvider } from "@/presentation/components/common/CartContext";

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
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background font-body-md text-body-md antialiased selection:bg-primary selection:text-on-primary">
        <BreadcrumbProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </BreadcrumbProvider>
      </body>
    </html>
  );
}
