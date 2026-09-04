import Link from "next/link";
import { makeGetDashboardMetricsUseCase, makeOrderRepository, makeLanguageRepository } from "@/infrastructure/supabase/container";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/presentation/components/orders/StatusBadge";
import { formatDate } from "@/presentation/utils";
import { Order } from "@/domain/entities/Order";
import { 
  Download, 
  TrendingUp, 
  ArrowUp, 
  Receipt, 
  Users, 
  PlusSquare, 
  Globe, 
  Languages, 
  SlidersHorizontal, 
  ChevronRight 
} from "lucide-react";

export default async function AdminDashboardPage() {
  const repo = await makeLanguageRepository();
  const dictionary = await getDictionary(repo);
  const dict = (dictionary.dashboard as Record<string, string>) || {};
  const locale = await getLocale();

  const dashboardUseCase = await makeGetDashboardMetricsUseCase();
  const orderRepo = await makeOrderRepository();

  const [metricsResult, recentOrdersResult] = await Promise.all([
    dashboardUseCase.execute(),
    orderRepo.findAll({ limit: 5 })
  ]);

  const metrics = metricsResult.success && metricsResult.data ? metricsResult.data : {
    totalRevenue: 0, revenueGrowth: 0, totalOrders: 0, ordersGrowth: 0, newCustomers: 0
  };
  const recentOrders = recentOrdersResult.orders || [];

  return (
    <div className="max-w-container-max mx-auto space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {dict.overview || (locale === "vi" ? "Tổng quan" : "Overview")}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            {dict.subtitle || (locale === "vi" ? "Tình hình kinh doanh hôm nay." : "Here's what's happening today.")}
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all flex items-center gap-2 shadow-xs text-xs cursor-pointer active:scale-95">
            <Download size={14} />
            <span>{dict.exportReport || (locale === "vi" ? "Xuất báo cáo" : "Export Report")}</span>
          </button>
        </div>
      </div>
      
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-12 gap-6">
        {/* Revenue Card */}
        <div className="col-span-12 lg:col-span-5 bg-dark text-white rounded-2xl p-7 shadow-sm flex flex-col justify-between min-h-[200px] relative overflow-hidden group border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/4 group-hover:scale-110 transition-transform duration-500 blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <span className="font-medium text-slate-400 text-xs">{dict.totalRevenue || (locale === "vi" ? "Tổng doanh thu" : "Total Revenue")}</span>
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-bold mb-1 tracking-tight text-white font-mono">{formatCurrency(metrics.totalRevenue, locale)}</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium font-mono">
              <ArrowUp size={12} />
              +{metrics.revenueGrowth}%
            </div>
          </div>
          <div className="relative z-10 mt-6 h-12 w-full flex items-end gap-1.5 opacity-80">
            {[1,2,4,3,5,4,6,7,5,8,10].map((h, i) => (
              <div key={i} className="flex-1 bg-primary rounded-t-xs transition-all hover:bg-primary-light" style={{ height: `${h * 10}%` }}></div>
            ))}
          </div>
        </div>
        
        {/* Orders & Customers Column */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex-1 flex flex-col justify-center hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Receipt size={14} />
              </div>
              <span className="font-medium text-slate-500 text-xs">{dict.orders || (locale === "vi" ? "Đơn hàng" : "Orders")}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5 tracking-tight font-mono">{metrics.totalOrders.toLocaleString()}</div>
            <div className="text-xs text-emerald-600 font-medium flex items-center gap-0.5 font-mono">
              +{metrics.ordersGrowth}%
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex-1 flex flex-col justify-center hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users size={14} />
              </div>
              <span className="font-medium text-slate-500 text-xs">{dict.newCustomers || (locale === "vi" ? "Khách hàng mới" : "New Customers")}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5 tracking-tight font-mono">{metrics.newCustomers.toLocaleString()}</div>
            <div className="text-xs text-slate-400 font-normal">
              {dict.stableGrowth || (locale === "vi" ? "Tăng trưởng ổn định" : "Steady growth")}
            </div>
          </div>
        </div>
        
        {/* Quick Actions Panel */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          <h3 className="font-semibold text-slate-900 mb-4 text-xs">{dict.quickActions || (locale === "vi" ? "Thao tác nhanh" : "Quick Actions")}</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/products/new" className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-primary/40 hover:bg-primary/5 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors">
                <PlusSquare size={16} />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center">{dict.addProduct || (locale === "vi" ? "Thêm sản phẩm" : "Add Product")}</span>
            </Link>
            <Link href="/admin/settings/languages" className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-primary/40 hover:bg-primary/5 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors">
                <Globe size={16} />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center">{locale === "vi" ? "Đa ngôn ngữ" : "Languages"}</span>
            </Link>
            <Link href="/admin/translations" className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-primary/40 hover:bg-primary/5 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors">
                <Languages size={16} />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center">{locale === "vi" ? "Bản dịch DB" : "Translations"}</span>
            </Link>
            <Link href="/admin/settings" className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-primary/40 hover:bg-primary/5 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors">
                <SlidersHorizontal size={16} />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center">{dict.storeSettings || (locale === "vi" ? "Cài đặt hệ thống" : "System Settings")}</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Orders Section */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs mt-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-semibold text-slate-900 text-sm">{dict.recentOrders || (locale === "vi" ? "Đơn hàng gần đây" : "Recent Orders")}</h2>
          <Link className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1" href="/admin/orders">
            <span>{dict.viewAll || (locale === "vi" ? "Xem tất cả" : "View All")}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="py-3.5 px-6 text-xs font-medium text-slate-500">{dict.orderId || (locale === "vi" ? "Mã đơn" : "Order ID")}</th>
                <th className="py-3.5 px-6 text-xs font-medium text-slate-500">{dict.customer || (locale === "vi" ? "Khách hàng" : "Customer")}</th>
                <th className="py-3.5 px-6 text-xs font-medium text-slate-500">{dict.date || (locale === "vi" ? "Ngày" : "Date")}</th>
                <th className="py-3.5 px-6 text-xs font-medium text-slate-500">{dict.status || (locale === "vi" ? "Trạng thái" : "Status")}</th>
                <th className="py-3.5 px-6 text-xs font-medium text-slate-500 text-right">{dict.amount || (locale === "vi" ? "Số tiền" : "Amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-normal">
                    {dict.noOrders || (locale === "vi" ? "Chưa có đơn hàng nào" : "No orders yet")}
                  </td>
                </tr>
              ) : recentOrders.map((order: Order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 text-xs font-medium text-slate-900 font-mono">
                    #{order.id.split('-')[0].toUpperCase()}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium uppercase font-sans">
                        {order.shippingAddress?.fullName?.slice(0, 2) || "KH"}
                      </div>
                      <span className="font-medium text-slate-900">{order.shippingAddress?.fullName || (locale === "vi" ? "Khách hàng" : "Customer")}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-slate-500 font-normal">{formatDate(order.createdAt)}</td>
                  <td className="py-3.5 px-6">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 px-6 text-xs font-bold text-slate-900 text-right font-mono">
                    {formatCurrency(order.totalAmount, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
