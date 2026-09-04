import React from "react";
import Link from "next/link";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  CreditCard, 
  Globe, 
  Languages, 
  Server, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  Layers 
} from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Admin settings hub page with quick navigation cards.
 * Provides access to translations, language management, payment configuration, and infrastructure settings.
 */
export default async function AdminSettingsPage() {
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const adminDict = (dict.admin as Record<string, string>) || {};
  const locale = await getLocale();

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-primary" />
          <span>{adminDict.settingsTitle || (locale === "vi" ? "Cài đặt hệ thống" : "System Settings")}</span>
        </h1>
        <p className="text-xs text-slate-500 font-normal mt-1">
          {adminDict.settingsSubtitle || (locale === "vi" ? "Cấu hình thương mại, cổng thanh toán VietQR và hạ tầng Supabase." : "Configure marketplace parameters, VietQR payments, and Supabase infrastructure.")}
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dynamic Translations Hub */}
        <Link
          href="/admin/translations"
          className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-sm hover:border-primary/30 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Languages size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                {locale === "vi" ? "Quản lý Bản dịch động (Database)" : "Dynamic Translations (DB)"}
                <ExternalLink size={14} className="text-slate-400" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                {locale === "vi" 
                  ? "Tùy chỉnh và cập nhật các chuỗi văn bản trực tiếp từ bảng site_translations mà không cần build lại mã nguồn."
                  : "Customize and live-update UI strings directly from the site_translations table without redeploying code."}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-medium">
            <span>{locale === "vi" ? "Mở công cụ quản lý từ điển" : "Open Translation Manager"}</span>
            <span>→</span>
          </div>
        </Link>

        {/* Languages & Locales */}
        <Link
          href="/admin/settings/languages"
          className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-sm hover:border-primary/30 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                {locale === "vi" ? "Quản lý Ngôn ngữ hỗ trợ" : "Supported Languages"}
                <ExternalLink size={14} className="text-slate-400" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                {locale === "vi" 
                  ? "Cấu hình ngôn ngữ mặc định (Tiếng Việt / English), thiết lập mã địa phương và kích hoạt ngôn ngữ mới."
                  : "Configure default active languages (VI / EN), regional locale codes, and enable new language packs."}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-primary font-medium">
            <span>{locale === "vi" ? "Xem danh sách ngôn ngữ" : "View Active Languages"}</span>
            <span>→</span>
          </div>
        </Link>
      </div>

      {/* System Infrastructure Details Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Server size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {locale === "vi" ? "Hạ tầng kỹ thuật & Cơ sở dữ liệu" : "Technical Infrastructure & Database"}
              </h3>
              <p className="text-[11px] text-slate-400 font-normal">
                Supabase PostgreSQL • Next.js 16 App Router • Clean Architecture
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {locale === "vi" ? "Hoạt động tối ưu" : "Operational"}
          </span>
        </div>

        <div className="p-6 divide-y divide-slate-100 text-xs">
          <div className="py-3.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium flex items-center gap-2">
              <Database size={15} className="text-slate-400" />
              {locale === "vi" ? "Dịch vụ Cơ sở dữ liệu" : "Database Engine"}
            </span>
            <span className="font-mono font-semibold text-slate-900">Supabase Cloud (shwofhhhfdokbycejeam)</span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium flex items-center gap-2">
              <Lock size={15} className="text-slate-400" />
              {locale === "vi" ? "Bảo mật Row-Level Security (RLS)" : "Row-Level Security (RLS)"}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 size={14} /> 100% Policy Protected
            </span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium flex items-center gap-2">
              <CreditCard size={15} className="text-slate-400" />
              {locale === "vi" ? "Cổng thanh toán tự động" : "Payment Gateway"}
            </span>
            <span className="font-mono font-semibold text-slate-900">VietQR Dynamic Code & PayOS Webhook</span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium flex items-center gap-2">
              <Layers size={15} className="text-slate-400" />
              {locale === "vi" ? "Lưu trữ tệp mã nguồn (.zip)" : "Source Code Storage (.zip)"}
            </span>
            <span className="font-mono text-slate-700">Bucket: template-assets (Public Download Token)</span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium flex items-center gap-2">
              <ShieldCheck size={15} className="text-slate-400" />
              {locale === "vi" ? "Kiến trúc hệ thống" : "System Architecture"}
            </span>
            <span className="font-mono text-primary font-semibold">Strict 4-Layer Clean Architecture</span>
          </div>
        </div>
      </div>

      {/* Store Profile Branding Info */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary text-white font-bold">KHOUI</span>
            <span className="text-xs text-slate-400">LuminaShop Digital Marketplace Engine</span>
          </div>
          <h4 className="text-base font-bold text-white tracking-tight">
            {locale === "vi" ? "Chợ Website Template Cao Cấp Chuẩn Clean Architecture" : "Premium Digital Template Marketplace Engine"}
          </h4>
          <p className="text-xs text-slate-400 font-normal">
            Phiên bản 2.4.0 • Thiết kế chuẩn Sarab Spec • GSAP 3 & Next.js 16 Turbopack
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer shadow-xs active:scale-95"
        >
          <ExternalLink size={13} />
          <span>{locale === "vi" ? "Truy cập Cửa hàng" : "Visit Storefront"}</span>
        </Link>
      </div>
    </div>
  );
}
