"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  Users, 
  Globe, 
  Languages, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  LogOut,
  X
} from "lucide-react";
import { signout } from "@/presentation/actions/auth";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentLocale: string;
  adminDict: Record<string, string>;
  userEmail?: string;
  userName?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

/**
 * Collapsible admin sidebar navigation with grouped menu items, system status indicator, and user profile card.
 * Supports desktop collapsed state and mobile drawer mode with backdrop overlay.
 */
export function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  currentLocale,
  adminDict,
  userEmail = "admin@khoui.vn",
  userName = "Admin",
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      id: "overview",
      title: adminDict.navGroupOverview || (currentLocale === "vi" ? "TỔNG QUAN" : "OVERVIEW"),
      items: [
        {
          href: "/admin",
          label: adminDict.navDashboard || (currentLocale === "vi" ? "Tổng quan" : "Dashboard"),
          icon: LayoutDashboard,
        },
      ],
    },
    {
      id: "commerce",
      title: adminDict.navGroupCommerce || (currentLocale === "vi" ? "QUẢN LÝ CỬA HÀNG" : "COMMERCE"),
      items: [
        {
          href: "/admin/products",
          label: adminDict.navProducts || (currentLocale === "vi" ? "Sản phẩm" : "Products"),
          icon: Package,
          badge: "Kho",
          badgeColor: "bg-primary/10 text-primary border-primary/20",
        },
        {
          href: "/admin/categories",
          label: adminDict.navCategories || (currentLocale === "vi" ? "Danh mục" : "Categories"),
          icon: FolderTree,
        },
        {
          href: "/admin/orders",
          label: adminDict.navOrders || (currentLocale === "vi" ? "Đơn hàng" : "Orders"),
          icon: ShoppingCart,
          badge: "Live",
          badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        {
          href: "/admin/customers",
          label: adminDict.navCustomers || (currentLocale === "vi" ? "Khách hàng" : "Customers"),
          icon: Users,
        },
      ],
    },
    {
      id: "content",
      title: adminDict.navGroupContent || (currentLocale === "vi" ? "NỘI DUNG & DỊCH THUẬT" : "CONTENT & I18N"),
      items: [
        {
          href: "/admin/languages",
          label: adminDict.navLanguages || (currentLocale === "vi" ? "Ngôn ngữ" : "Languages"),
          icon: Globe,
        },
        {
          href: "/admin/translations",
          label: adminDict.navTranslations || (currentLocale === "vi" ? "Bản dịch động" : "Translations"),
          icon: Languages,
          badge: "DB",
          badgeColor: "bg-purple-50 text-purple-600 border-purple-200",
        },
      ],
    },
    {
      id: "system",
      title: adminDict.navGroupSystem || (currentLocale === "vi" ? "CẤU HÌNH HỆ THỐNG" : "SYSTEM"),
      items: [
        {
          href: "/admin/settings",
          label: adminDict.navSettings || (currentLocale === "vi" ? "Cài đặt" : "Settings"),
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-100/90 shadow-xs flex flex-col font-sans transition-all duration-300 ease-in-out select-none",
          // Desktop width
          isCollapsed ? "w-20" : "w-64",
          // Mobile responsive drawer transform
          isMobileOpen
            ? "translate-x-0 w-64 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Top Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100/80 flex-shrink-0">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 overflow-hidden transition-all duration-200",
              isCollapsed && !isMobileOpen ? "justify-center w-full" : ""
            )}
          >
            <div className="relative h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <span className="font-mono font-bold text-sm text-primary tracking-tight">K</span>
              <span className="font-mono font-bold text-sm text-white tracking-tight">UI</span>
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
                  {adminDict.panelTitle || (currentLocale === "vi" ? "Bảng Quản Trị" : "Admin Panel")}
                </span>
                <span className="text-[11px] font-normal text-slate-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  KhoUI Enterprise
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close mobile menu"
            >
              <X size={18} />
            </button>
          )}

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggleCollapse}
            type="button"
            className={cn(
              "hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer",
              isCollapsed ? "hidden" : "flex"
            )}
            title={adminDict.collapseMenu || (currentLocale === "vi" ? "Thu gọn menu" : "Collapse sidebar")}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
          {navGroups.map((group) => (
            <div key={group.id} className="space-y-1">
              {/* Group Title */}
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 tracking-wider uppercase whitespace-nowrap select-none">
                  {group.title}
                </div>
              )}

              {/* Items List */}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <li key={item.href} className="relative group">
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (isMobileOpen) onCloseMobile();
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-xs font-medium cursor-pointer relative",
                          isActive
                            ? "bg-primary text-white shadow-xs font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                          isCollapsed && !isMobileOpen ? "justify-center px-0 w-11 h-11 mx-auto" : ""
                        )}
                      >
                        <Icon
                          size={18}
                          className={cn(
                            "flex-shrink-0 transition-colors",
                            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                          )}
                        />

                        {(!isCollapsed || isMobileOpen) && (
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <span className="truncate whitespace-nowrap">{item.label}</span>
                            {item.badge && (
                              <span
                                className={cn(
                                  "text-[10px] font-medium px-2 py-0.5 rounded-full border leading-none ml-2 whitespace-nowrap font-mono",
                                  isActive
                                    ? "bg-white/20 text-white border-white/30"
                                    : item.badgeColor || "bg-slate-100 text-slate-600 border-slate-200"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>

                      {/* Tooltip on Collapsed Hover */}
                      {isCollapsed && !isMobileOpen && (
                        <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover:scale-100 flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] bg-slate-800 text-primary-light px-1.5 py-0.5 rounded font-mono">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section: System Status & Profile */}
        <div className="p-3 border-t border-slate-100/80 space-y-2 flex-shrink-0 bg-slate-50/40">
          {/* System Status Pill */}
          {(!isCollapsed || isMobileOpen) ? (
            <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Database
                </span>
                <span className="text-emerald-600 font-medium font-mono text-[10px]">Online</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
                <span>RLS Protected</span>
                <span>v2.4 Enterprise</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center group relative py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse cursor-pointer" />
              <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-lg z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                Supabase Online • RLS Active
              </div>
            </div>
          )}

          {/* View Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-primary hover:bg-white hover:border-slate-200 border border-transparent transition-all shadow-none hover:shadow-2xs",
              isCollapsed && !isMobileOpen ? "justify-center px-0 w-11 h-9 mx-auto" : ""
            )}
            title={adminDict.viewStorefront || (currentLocale === "vi" ? "Xem cửa hàng" : "View Storefront")}
          >
            <ExternalLink size={15} className="text-slate-400 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="truncate">{adminDict.viewStorefront || (currentLocale === "vi" ? "Xem cửa hàng" : "View Storefront")}</span>
            )}
          </Link>

          {/* User Profile Card */}
          <div
            className={cn(
              "flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 shadow-2xs",
              isCollapsed && !isMobileOpen ? "justify-center p-1.5" : ""
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate leading-tight">{userName}</p>
                  <p className="text-[10px] text-slate-400 truncate leading-tight font-mono">{userEmail}</p>
                </div>
              )}
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <form action={signout}>
                <button
                  type="submit"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut size={15} />
                </button>
              </form>
            )}
          </div>

          {/* Collapse/Expand Toggle at Footer */}
          {isCollapsed && !isMobileOpen && (
            <button
              onClick={onToggleCollapse}
              type="button"
              className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-all cursor-pointer"
              title={adminDict.expandMenu || (currentLocale === "vi" ? "Mở rộng thanh điều hướng" : "Expand sidebar")}
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
