import Link from "next/link";
import { makeGetDashboardMetricsUseCase, makeOrderRepository, makeLanguageRepository } from "@/infrastructure/supabase/container";
import { getDictionary } from "@/i18n/getDictionary";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/presentation/components/orders/StatusBadge";
import { formatDate } from "@/presentation/utils";
import { Order } from "@/domain/entities/Order";

export default async function AdminDashboardPage() {
  const repo = await makeLanguageRepository();
  const dictionary = await getDictionary(repo);
  const dict = (dictionary.dashboard as Record<string, string>) || {};

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
    <div className="max-w-container-max mx-auto space-y-md">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-h1 text-on-surface">{dict.overview}</h1>
          <p className="text-body-md text-on-surface-variant mt-1">{dict.subtitle}</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-[#0051d5] text-white rounded-lg font-bold hover:bg-[#0041ab] transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Report
          </button>
        </div>
      </div>
      
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-12 gap-6">
        {/* Revenue Card */}
        <div className="col-span-12 lg:col-span-5 bg-gradient-to-br from-[#0b1c30] to-[#122b49] text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="font-bold text-slate-300 uppercase tracking-wider">{dict.totalRevenue}</span>
              <span className="material-symbols-outlined text-green-400">trending_up</span>
            </div>
            <div className="text-4xl font-black mb-1">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="text-sm text-green-400 flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-xs">arrow_upward</span>
              +{metrics.revenueGrowth}%
            </div>
          </div>
          <div className="relative z-10 mt-6 h-16 w-full flex items-end gap-1 opacity-60">
            {[1,2,4,3,5,4,6,7,5,8,10].map((h, i) => (
              <div key={i} className="flex-1 bg-[#0051d5] rounded-t-sm" style={{ height: `${h * 10}%` }}></div>
            ))}
          </div>
        </div>
        
        {/* Orders & Customers Column */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-center hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#0051d5]">
                <span className="material-symbols-outlined text-sm">receipt_long</span>
              </div>
              <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">{dict.orders}</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{metrics.totalOrders.toLocaleString()}</div>
            <div className="text-sm text-green-500 font-bold flex items-center gap-1">
              +{metrics.ordersGrowth}%
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-center hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#0051d5]">
                <span className="material-symbols-outlined text-sm">group</span>
              </div>
              <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">{dict.newCustomers}</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{metrics.newCustomers.toLocaleString()}</div>
            <div className="text-sm text-slate-400 font-medium flex items-center gap-1">
              Steady growth
            </div>
          </div>
        </div>
        
        {/* Quick Actions Panel */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">{dict.quickActions}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/products/new" className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#0051d5] hover:bg-blue-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:bg-[#0051d5] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">add_box</span>
              </div>
              <span className="text-xs font-bold text-slate-700 text-center">{dict.addProduct}</span>
            </Link>
            <button className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#0051d5] hover:bg-blue-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:bg-[#0051d5] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">campaign</span>
              </div>
              <span className="text-xs font-bold text-slate-700 text-center">{dict.createPromo}</span>
            </button>
            <button className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#0051d5] hover:bg-blue-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:bg-[#0051d5] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <span className="text-xs font-bold text-slate-700 text-center">{dict.supportInbox}</span>
            </button>
            <button className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#0051d5] hover:bg-blue-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:bg-[#0051d5] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">tune</span>
              </div>
              <span className="text-xs font-bold text-slate-700 text-center">{dict.storeSettings}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Orders Section */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mt-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-900">{dict.recentOrders}</h2>
          <Link className="text-xs font-bold text-[#0051d5] hover:text-[#0041ab] transition-colors flex items-center gap-1 uppercase tracking-wider" href="/admin/orders">
            {dict.viewAll} <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">{dict.orderId}</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">{dict.customer}</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">{dict.date}</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">{dict.status}</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">{dict.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : recentOrders.map((order: Order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-bold text-slate-900">
                    #{order.id.split('-')[0].toUpperCase()}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-700 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0051d5] flex items-center justify-center text-xs font-bold uppercase">
                      {order.shippingAddress?.fullName?.slice(0, 2) || "KH"}
                    </div>
                    {order.shippingAddress?.fullName || "Khách hàng"}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">{formatDate(order.createdAt)}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-4 px-6 text-sm font-black text-slate-900 text-right">
                    {formatCurrency(order.totalAmount)}
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
