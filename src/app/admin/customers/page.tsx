import React from "react";
import { getAppDictionary } from "@/di/container";
import { getLocale } from "@/i18n/getDictionary";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/presentation/utils";
import { getPaginatedAdminCustomersAction } from "@/presentation/actions/admin";
import { CustomerSearchInput } from "./CustomerSearchInput";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";
import { 
  Users, 
  Mail, 
  ShoppingBag, 
  CreditCard, 
  ShieldCheck, 
  UserCheck, 
  TrendingUp, 
  Award 
} from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminCustomersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Admin customers management page.
 * Displays registered users with aggregated order statistics (total orders, total spent, last order).
 * Supports database-level search filtering by name, email, or user ID, and unified pagination.
 */
export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps): Promise<React.ReactElement> {
  const dict = await getAppDictionary();
  const adminDict = (dict.admin as Record<string, string>) || {};
  const locale = await getLocale();

  const params = await searchParams;
  const parsedPage = parseInt(typeof params.page === "string" ? params.page : "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const itemsPerPage = 10;
  const offset = (page - 1) * itemsPerPage;
  const search = typeof params.q === "string" ? params.q.trim() : undefined;

  const result = await getPaginatedAdminCustomersAction({
    limit: itemsPerPage,
    offset,
    search,
  });

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto my-12 font-sans">
        <p className="font-semibold text-sm">
          {locale === "vi" ? "Không thể tải dữ liệu khách hàng từ máy chủ" : "Failed to load customer metrics from database"}
        </p>
        <p className="text-xs text-red-500 mt-1">
          {result.error || (locale === "vi" ? "Vui lòng thử lại sau." : "Please try again later.")}
        </p>
      </div>
    );
  }

  const { customers, total, vipCount, totalSpent } = result.data;
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-primary" />
            <span>{adminDict.customersTitle || (locale === "vi" ? "Quản lý khách hàng" : "Customer Management")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-1">
            {adminDict.customersSubtitle || (locale === "vi" ? "Danh sách người dùng và lịch sử mua template kỹ thuật số." : "Registered users and digital template order history.")}
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">{locale === "vi" ? "Tổng tài khoản" : "Total Accounts"}</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">{total}</p>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <UserCheck size={13} /> {locale === "vi" ? "Đang hoạt động" : "Active status"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">{locale === "vi" ? "Khách hàng VIP" : "VIP Customers"}</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">{vipCount}</p>
            <p className="text-[11px] text-purple-600 font-medium flex items-center gap-1">
              <Award size={13} /> {locale === "vi" ? "Chi tiêu > 500k" : "Spent > 500k"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award size={20} />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">{locale === "vi" ? "Tổng tích lũy mua sắm" : "Total Lifetime Value"}</p>
            <p className="text-2xl font-bold text-primary font-mono">{formatCurrency(totalSpent, locale)}</p>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp size={13} /> {locale === "vi" ? "Bản quyền số" : "Digital licenses"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <CustomerSearchInput
            initialSearch={search || ""}
            placeholder={locale === "vi" ? "Tìm theo tên, email, ID..." : "Search name, email, ID..."}
          />
          <div className="text-xs text-slate-500 font-medium">
            {locale === "vi" ? "Tổng cộng" : "Total"}{" "}
            <span className="font-bold text-slate-900 font-mono">{total}</span>{" "}
            {locale === "vi" ? "khách hàng" : "customers"}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-medium text-slate-500">
                <th className="p-4 pl-6">{locale === "vi" ? "Khách hàng" : "Customer"}</th>
                <th className="p-4">{locale === "vi" ? "Vai trò" : "Role"}</th>
                <th className="p-4 text-center">{locale === "vi" ? "Đơn hàng" : "Orders"}</th>
                <th className="p-4 text-right">{locale === "vi" ? "Tổng chi tiêu" : "Total Spent"}</th>
                <th className="p-4 text-right pr-6">{locale === "vi" ? "Ngày tham gia" : "Joined Date"}</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-normal">
                    {locale === "vi" ? "Không tìm thấy khách hàng nào." : "No customers found."}
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:border-primary/40 transition-colors">
                          {cust.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{cust.fullName}</p>
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 font-mono">
                            <Mail size={11} className="text-slate-400" />
                            {cust.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {cust.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          <ShieldCheck size={12} /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          User
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-medium text-slate-900 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                        <ShoppingBag size={12} className="text-slate-400" />
                        {cust.totalOrders}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(cust.totalSpent, locale)}
                      </span>
                    </td>

                    <td className="p-4 text-right pr-6 text-slate-500 font-mono text-[11px]">
                      {cust.createdAt ? formatDate(cust.createdAt) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Unified Pagination Controls */}
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          itemName={{ vi: "khách hàng", en: "customers" }}
          layoutId="admin-customers-pagination"
          className="p-4 border-t border-slate-100"
        />
      </div>
    </div>
  );
}
