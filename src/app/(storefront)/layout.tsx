import { Navbar } from "@/presentation/components/layout/Navbar";
import { Footer } from "@/presentation/components/layout/Footer";
import { AutoBreadcrumbs } from "@/presentation/components/common/AutoBreadcrumbs";
import { BreadcrumbProvider } from "@/presentation/components/common/BreadcrumbContext";
import { UI_CONFIG } from "@/presentation/constants";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BreadcrumbProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div style={{ paddingTop: UI_CONFIG.NAVBAR_HEIGHT }}>
          <AutoBreadcrumbs />
          {children}
        </div>
        <Footer />
      </div>
    </BreadcrumbProvider>
  );
}
