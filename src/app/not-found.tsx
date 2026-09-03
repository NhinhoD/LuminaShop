import Link from "next/link";
import { Navbar } from "@/presentation/components/layout/Navbar";
import { Footer } from "@/presentation/components/layout/Footer";
import CartDrawer from "@/presentation/components/layout/CartDrawer";
import { cookies } from "next/headers";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { getDictionary, Locale } from "@/i18n/getDictionary";
import { Home, ShoppingBag, ArrowLeft } from "lucide-react";

export default async function NotFound() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "vi";

  const repo = await makeLanguageRepository();
  const dict = await getDictionary(repo);
  const notFoundDict = (dict?.notFound as Record<string, string>) || {};

  const title = notFoundDict.title || (locale === "vi" ? "Không tìm thấy trang" : "Page Not Found");
  const desc1 = notFoundDict.desc1 || (locale === "vi" ? "Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển." : "The page you're looking for doesn't exist or has been moved.");
  const desc2 = notFoundDict.desc2 || (locale === "vi" ? "Hãy quay lại trang chủ hoặc khám phá bộ sưu tập giao diện của chúng tôi." : "Let's get you back on track to explore our template collections.");
  const backHomeText = notFoundDict.backHome || (locale === "vi" ? "Về trang chủ" : "Back to Homepage");
  const browseShopText = notFoundDict.browseShop || (locale === "vi" ? "Khám phá giao diện" : "Browse Templates");

  return (
    <div className="flex flex-col min-h-screen bg-background-subtle text-slate-900 font-sans selection:bg-primary/10 selection:text-primary">
      <Navbar />
      <CartDrawer />

      {/* ─── Main 404 Hero Container ─── */}
      <main className="flex-grow flex items-center justify-center px-6 py-20 md:py-28 relative overflow-hidden">
        {/* Soft atmospheric background lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.04] pointer-events-none rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-2xl text-center flex flex-col items-center">
          {/* Subtle Status Pill */}
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-3.5 py-1.5 shadow-sm border border-slate-200/80 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-600">
              Error 404 • {locale === "vi" ? "Đường dẫn không hợp lệ" : "Page Not Found"}
            </span>
          </div>

          {/* Large Stylized 404 */}
          <h1 className="font-extrabold text-[clamp(4.5rem,10vw,7rem)] leading-none text-slate-950 tracking-tight mb-2 select-none">
            4<span className="text-primary">0</span>4
          </h1>

          {/* Headline */}
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            {title}
          </h2>

          {/* Description */}
          <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-8">
            {desc1} <br className="hidden sm:inline" />
            {desc2}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
            <Link
              href="/"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all"
            >
              <Home size={14} />
              <span>{backHomeText}</span>
            </Link>

            <Link
              href="/shop"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-sm"
            >
              <ShoppingBag size={14} />
              <span>{browseShopText}</span>
            </Link>
          </div>

          {/* Quick Helper Link */}
          <div className="mt-10 pt-5 border-t border-slate-200/60 w-full max-w-xs flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-primary text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={13} />
              <span>{locale === "vi" ? "Quay lại trang trước" : "Return to Homepage"}</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
