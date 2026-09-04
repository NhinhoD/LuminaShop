"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Search, 
  Bell, 
  HelpCircle, 
  ExternalLink, 
  ChevronRight 
} from "lucide-react";
import { LanguageSwitcher } from "@/presentation/components/common/LanguageSwitcher";

interface AdminHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
  currentLocale: string;
  adminDict: Record<string, string>;
  userName?: string;
}

/**
 * Admin dashboard header component with breadcrumbs, global search, language switcher, and action buttons.
 * Adapts to sidebar collapsed state and provides mobile menu toggle.
 */
export function AdminHeader({
  isCollapsed,
  onToggleCollapse,
  onOpenMobile,
  currentLocale,
  adminDict,
  userName = "Admin",
}: AdminHeaderProps) {
  const pathname = usePathname();
  const [hasUnreadNotice] = useState(true);

  /**
   * Derives a localized breadcrumb title from the current pathname.
   */
  const getBreadcrumbTitle = () => {
    if (pathname === "/admin") return adminDict.navDashboard || (currentLocale === "vi" ? "Tổng quan" : "Dashboard");
    if (pathname.startsWith("/admin/products/new")) return adminDict.newProductTitle || (currentLocale === "vi" ? "Thêm sản phẩm mới" : "New Product");
    if (pathname.includes("/edit")) return adminDict.editProductTitle || (currentLocale === "vi" ? "Chỉnh sửa sản phẩm" : "Edit Product");
    if (pathname.startsWith("/admin/products")) return adminDict.navProducts || (currentLocale === "vi" ? "Sản phẩm" : "Products");
    if (pathname.startsWith("/admin/categories")) return adminDict.navCategories || (currentLocale === "vi" ? "Danh mục" : "Categories");
    if (pathname.startsWith("/admin/orders")) return adminDict.navOrders || (currentLocale === "vi" ? "Đơn hàng" : "Orders");
    if (pathname.startsWith("/admin/customers")) return adminDict.navCustomers || (currentLocale === "vi" ? "Khách hàng" : "Customers");
    if (pathname.startsWith("/admin/languages") || pathname.startsWith("/admin/settings/languages")) return adminDict.navLanguages || (currentLocale === "vi" ? "Ngôn ngữ" : "Languages");
    if (pathname.startsWith("/admin/translations")) return adminDict.navTranslations || (currentLocale === "vi" ? "Bản dịch động" : "Translations");
    if (pathname.startsWith("/admin/settings")) return adminDict.navSettings || (currentLocale === "vi" ? "Cài đặt" : "Settings");
    return adminDict.consoleTitle || (currentLocale === "vi" ? "Bảng Điều Khiển" : "Admin Console");
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 border-b z-40 border-slate-100 shadow-2xs bg-white/85 backdrop-blur-md font-sans text-slate-900 transition-all duration-300 ease-in-out select-none",
        "left-0",
        isCollapsed ? "lg:left-20" : "lg:left-64"
      )}
    >
      <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 w-full h-full gap-4">
        {/* Left Section: Mobile Menu + Toggle Collapse + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onOpenMobile}
            type="button"
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu size={20} />
          </button>

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggleCollapse}
            type="button"
            className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title={
              isCollapsed
                ? adminDict.expandMenu || (currentLocale === "vi" ? "Mở rộng thanh menu" : "Expand sidebar")
                : adminDict.collapseMenu || (currentLocale === "vi" ? "Thu gọn thanh menu" : "Collapse sidebar")
            }
          >
            {isCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>

          {/* Breadcrumbs Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">KhoUI</span>
            <ChevronRight size={13} className="text-slate-300" />
            <span className="font-semibold text-slate-800 truncate max-w-[180px] md:max-w-[260px]">
              {getBreadcrumbTitle()}
            </span>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full flex items-center">
            <Search size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 transition-all placeholder:text-slate-400 shadow-2xs"
              placeholder={adminDict.searchPlaceholder || (currentLocale === "vi" ? "Tìm kiếm trong hệ thống..." : "Search across store...")}
            />
            <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section: Actions & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Quick Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium transition-all shadow-2xs cursor-pointer active:scale-95"
            title={adminDict.viewStorefront || (currentLocale === "vi" ? "Xem cửa hàng" : "View Storefront")}
          >
            <ExternalLink size={13} className="text-slate-500" />
            <span>{adminDict.viewStorefront || (currentLocale === "vi" ? "Xem cửa hàng" : "View Store")}</span>
          </Link>

          {/* Language Switcher */}
          <div className="scale-95">
            <LanguageSwitcher initialLocale={currentLocale as "vi" | "en"} />
          </div>

          {/* Notifications Button */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title={adminDict.notifications || (currentLocale === "vi" ? "Thông báo hệ thống" : "System Notifications")}
          >
            <Bell size={18} />
            {hasUnreadNotice && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Help & Support Button */}
          <Link
            href="/admin/settings"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title={adminDict.help || (currentLocale === "vi" ? "Trợ giúp & Hướng dẫn" : "Help & Documentation")}
          >
            <HelpCircle size={18} />
          </Link>

          {/* Admin Avatar Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
