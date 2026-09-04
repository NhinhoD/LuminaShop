import React from "react";
import { createClient as createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/presentation/utils";
import { 
  Users, 
  Search, 
  Mail, 
  ShoppingBag, 
  CreditCard, 
  ShieldCheck, 
  UserCheck, 
  TrendingUp, 
  Award 
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CustomerWithStats {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const adminDict = (dict.admin as Record<string, string>) || {};
  const locale = await getLocale();

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.toLowerCase() : "";

  const supabase = await createServerSupabaseClient();

  // 1. Fetch profiles
  const { data: profiles = [] } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  // 2. Fetch all orders to aggregate by customer
  const { data: orders = [] } = await supabase
    .from("orders")
    .select("id, user_id, contact_email, total_amount, status, payment_status, created_at");

  // Build customer stats map
  const ordersByUser: Record<string, { totalOrders: number; totalSpent: number; lastOrderDate: string; email: string }> = {};

  (orders || []).forEach((ord) => {
    const uid = ord.user_id;
    if (!uid) return;

    if (!ordersByUser[uid]) {
      ordersByUser[uid] = {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: ord.created_at,
        email: ord.contact_email || "",
      };
    }

    ordersByUser[uid].totalOrders += 1;
    if (ord.status === "completed" || ord.payment_status === "paid") {
      ordersByUser[uid].totalSpent += Number(ord.total_amount || 0);
    }
    if (new Date(ord.created_at) > new Date(ordersByUser[uid].lastOrderDate)) {
      ordersByUser[uid].lastOrderDate = ord.created_at;
    }
    if (!ordersByUser[uid].email && ord.contact_email) {
      ordersByUser[uid].email = ord.contact_email;
    }
  });

  const customers: CustomerWithStats[] = (profiles || []).map((p) => {
    const stats = ordersByUser[p.id] || { totalOrders: 0, totalSpent: 0, lastOrderDate: "", email: "" };
    return {
      id: p.id,
      fullName: p.full_name || (locale === "vi" ? "Khách hàng ẩn danh" : "Anonymous Customer"),
      email: stats.email || (p.role === "admin" ? "admin@khoui.vn" : `${p.id.slice(0, 8)}@user.khoui.vn`),
      role: p.role || "user",
      createdAt: p.created_at,
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      lastOrderDate: stats.lastOrderDate,
    };
  });

  // Filter if search keyword provided
  const filteredCustomers = customers.filter((c) => {
    if (!search) return true;
    return (
      c.fullName.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.id.toLowerCase().includes(search)
    );
  });

  // KPI calculations
  const totalCustomersCount = customers.length;
  const vipCustomersCount = customers.filter((c) => c.totalSpent > 500000).length;
  const totalCustomerSpend = customers.reduce((acc, c) => acc + c.totalSpent, 0);

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
            <p className="text-2xl font-bold text-slate-900 font-mono">{totalCustomersCount}</p>
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
            <p className="text-2xl font-bold text-slate-900 font-mono">{vipCustomersCount}</p>
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
            <p className="text-2xl font-bold text-primary font-mono">{formatCurrency(totalCustomerSpend, locale)}</p>
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
        <form className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder={locale === "vi" ? "Tìm theo tên, email, ID..." : "Search name, email, ID..."}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {locale === "vi" ? "Hiển thị" : "Showing"}{" "}
            <span className="font-bold text-slate-900 font-mono">{filteredCustomers.length}</span>{" "}
            {locale === "vi" ? "khách hàng" : "customers"}
          </div>
        </form>

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
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-normal">
                    {locale === "vi" ? "Không tìm thấy khách hàng nào." : "No customers found."}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
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
      </div>
    </div>
  );
}
