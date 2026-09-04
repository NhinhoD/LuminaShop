"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminShellProps {
  children: React.ReactNode;
  currentLocale: string;
  adminDict: Record<string, string>;
  userEmail?: string;
  userName?: string;
}

/**
 * Main layout shell for the admin dashboard.
 * Manages sidebar collapse state, mobile drawer, and renders AdminSidebar, AdminHeader, and page content.
 */
export function AdminShell({
  children,
  currentLocale,
  adminDict,
  userEmail,
  userName,
}: AdminShellProps) {
  // Lazy initialize collapse preference from localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("admin_sidebar_collapsed");
        return saved === "true";
      } catch {
        return false;
      }
    }
    return false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleOpenMobile = () => setIsMobileOpen(true);
  const handleCloseMobile = () => setIsMobileOpen(false);

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans flex flex-col text-slate-900 overflow-x-hidden">
      {/* Interactive Collapsible Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={handleCloseMobile}
        currentLocale={currentLocale}
        adminDict={adminDict}
        userEmail={userEmail}
        userName={userName}
      />

      {/* Top Application Header */}
      <AdminHeader
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onOpenMobile={handleOpenMobile}
        currentLocale={currentLocale}
        adminDict={adminDict}
        userName={userName}
      />

      {/* Main Dynamic Content Canvas with Silky Transition */}
      <main
        className={cn(
          "mt-16 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 transition-all duration-300 ease-in-out min-w-0",
          isCollapsed ? "lg:ml-20" : "lg:ml-64",
          "ml-0"
        )}
      >
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
