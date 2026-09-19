import { Navbar } from "@/client/components/layout/Navbar";
import { Footer } from "@/client/components/layout/Footer";
import { AutoBreadcrumbs } from "@/client/components/common/AutoBreadcrumbs";
import CartDrawer from "@/client/components/layout/CartDrawer";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans">
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
