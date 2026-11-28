import Link from "next/link";
import { Navbar } from "@/client/components/layout/Navbar";
import { Footer } from "@/client/components/layout/Footer";
import CartDrawer from "@/client/components/layout/CartDrawer";
import { cookies } from "next/headers";
import { getAppDictionary } from "@/server/di/container";
import { Locale } from "@/i18n/getDictionary";
import { Home, ShoppingBag, ArrowLeft } from "lucide-react";

/**
 * Global 404 page rendered inside the Spec Sheet storefront shell.
 */
export default async function NotFound(): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "vi";

  const dict = await getAppDictionary();
  const notFoundDict = (dict?.notFound as Record<string, string>) || {};

  const title = notFoundDict.title || (locale === "vi" ? "Không tìm thấy trang" : "Page Not Found");
  const desc1 = notFoundDict.desc1 || (locale === "vi" ? "Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển." : "The page you're looking for doesn't exist or has been moved.");
  const desc2 = notFoundDict.desc2 || (locale === "vi" ? "Hãy quay lại trang chủ hoặc khám phá bộ sưu tập giao diện của chúng tôi." : "Let's get you back on track to explore our template collections.");
  const backHomeText = notFoundDict.backHome || (locale === "vi" ? "Về trang chủ" : "Back to Homepage");
  const browseShopText = notFoundDict.browseShop || (locale === "vi" ? "Khám phá giao diện" : "Browse Templates");

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />
      <CartDrawer />

      <main className="mx-auto flex w-full max-w-[1440px] flex-grow flex-col justify-center px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Code column */}
          <div className="lg:col-span-5">
            <span className="mono-meta flex items-center gap-2 text-error">
              <span className="h-1.5 w-1.5 animate-pulse bg-error motion-reduce:animate-none" />
              ERROR 404 / {locale === "vi" ? "Đường dẫn không hợp lệ" : "Page Not Found"}
            </span>
            <h1 className="mt-4 select-none font-display text-[clamp(5rem,14vw,11rem)] font-bold leading-[0.82] tracking-[-0.06em] text-dark">
              4<span className="text-primary">0</span>4
            </h1>
          </div>

          {/* Copy column */}
          <div className="border-t border-border pt-8 lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <h2 className="display text-[clamp(1.7rem,3.6vw,2.8rem)] text-dark">{title}</h2>
            <p className="mt-4 max-w-md text-[13px] leading-relaxed text-dark/55">
              {desc1} {desc2}
            </p>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-dark px-5 py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary"
              >
                <Home size={13} />
                <span>{backHomeText}</span>
              </Link>

              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 border border-border bg-surface px-5 py-3 text-[11.5px] font-medium text-dark/70 transition-colors hover:border-dark hover:text-dark"
              >
                <ShoppingBag size={13} />
                <span>{browseShopText}</span>
              </Link>
            </div>

            <div className="mt-7 inline-flex border-t border-border pt-4">
              <Link
                href="/"
                className="mono-meta inline-flex items-center gap-1.5 text-[8.5px] text-dark/40 transition-colors hover:text-primary"
              >
                <ArrowLeft size={11} />
                <span>{locale === "vi" ? "Quay lại trang chủ" : "Return to Homepage"}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
