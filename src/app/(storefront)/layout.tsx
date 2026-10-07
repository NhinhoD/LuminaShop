import { Navbar } from "@/client/components/layout/Navbar";
import { Footer } from "@/client/components/layout/Footer";
import { AutoBreadcrumbs } from "@/client/components/common/AutoBreadcrumbs";
import CartDrawer from "@/client/components/layout/CartDrawer";

/**
 * StorefrontLayout
 * 
 * Provides the main layout structure for the storefront, including the Navbar,
 * CartDrawer, AutoBreadcrumbs, and Footer. Also handles layout spacing.
 *
 * @param children - The page content to render within the layout
 * @returns The rendered storefront layout
 */
export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen text-slate-900 font-sans">
      <Navbar />
      <CartDrawer />
      <AutoBreadcrumbs />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
