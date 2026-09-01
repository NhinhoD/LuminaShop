import Link from "next/link";
import { makeGetDashboardMetricsUseCase, makeOrderRepository, makeLanguageRepository } from "@/infrastructure/supabase/container";
import { getDictionary } from "@/i18n/getDictionary";
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
  Megaphone, 
  Headphones, 
  SlidersHorizontal, 
  ChevronRight 
} from "lucide-react";

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
    <div className="max-w-container-max mx-auto space-y-6 font-manrope">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 font-playfair">{dict.overview || "Tổng quan"}</h1>
          <p className="text-sm text-slate-500 mt-1">{dict.subtitle || "Tình hình kinh doanh hôm nay."}</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2.5 bg-[#0051d5] text-white rounded-xl font-bold hover:bg-[#0041ac] transition-all flex items-center gap-2 shadow-md shadow-blue-900/10 text-xs uppercase tracking-wider cursor-pointer active:scale-95">
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>
      
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-12 gap-6">
        {/* Revenue Card */}
        <div className="col-span-12 lg:col-span-5 bg-gradient-to-br from-[#0b1c30] to-[#122b49] text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="font-bold text-slate-300 uppercase tracking-widest text-[11px]">{dict.totalRevenue || "Tổng doanh thu"}</span>
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <div className="text-3xl md:text-4xl font-black mb-1 font-playfair">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="text-xs text-green-400 flex items-center gap-1 font-bold">
              <ArrowUp size={12} />
              +{metrics.revenueGrowth}%
            </div>
          </div>
          <div className="relative z-10 mt-6 h-16 w-full flex items-end gap-1.5 opacity-70">
            {[1,2,4,3,5,4,6,7,5,8,10].map((h, i) => (
              <div key={i} className="flex-1 bg-[#0051d5] rounded-t-sm" style={{ height: `${h * 10}%` }}></div>
            ))}
          </div>
        </div>
        
        {/* Orders & Customers Column */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-center hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#0051d5]">
                <Receipt size={16} />
              </div>
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{dict.orders || "Đơn hàng"}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1 font-playfair">{metrics.totalOrders.toLocaleString()}</div>
            <div className="text-xs text-green-500 font-bold flex items-center gap-1">
              +{metrics.ordersGrowth}%
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-center hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#0051d5]">
                <Users size={16} />
              </div>
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{dict.newCustomers || "Khách hàng mới"}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1 font-playfair">{metrics.newCustomers.toLocaleString()}</div>
            <div className="text-xs text-slate-400 font-bold">
              Steady growth
            </div>
          </div>
        </div>
        
        {/* Quick Actions Panel */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 text-sm font-playfair">{dict.quickActions || "Thao tác nhanh"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/products/new" className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#0051d5] hover:bg-blue-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:bg-[#0051d5] group-hover:text-white transition-colors">
                <PlusSquare size={18} />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center">{dict.addProduct || "Thêm sản phẩm"}</span>
            </Link>
            <button className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#0051d5] hover:bg-blue-50/50 transition-colors group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:bg-[#0051d5] group-hover:text-white transition-colors">
                <Megaphone size={18} />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center">{dict.createPromo || "Tạo khuyến mãi"}</span>
            </button>
            <button className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#0051d5] hover:bg-blue-50/50 transition-colors group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:bg-[#0051d5] group-hover:text-white transition-colors">
                <Headphones size={18} />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center">{dict.supportInbox || "Hộp thư hỗ trợ"}</span>
            </button>
            <button className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#0051d5] hover:bg-blue-50/50 transition-colors group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:bg-[#0051d5] group-hover:text-white transition-colors">
                <SlidersHorizontal size={18} />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center">{dict.storeSettings || "Cài đặt cửa hàng"}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Orders Section */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm mt-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
          <h2 className="font-bold text-slate-900 text-sm font-playfair">{dict.recentOrders || "Đơn hàng gần đây"}</h2>
          <Link className="text-xs font-bold text-[#0051d5] hover:text-[#0041ab] transition-colors flex items-center gap-1 uppercase tracking-wider" href="/admin/orders">
            <span>{dict.viewAll || "Xem tất cả"}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dict.orderId || "MÃ ĐƠN"}</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dict.customer || "KHÁCH HÀNG"}</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dict.date || "NGÀY"}</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dict.status || "TRẠNG THÁI"}</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">{dict.amount || "SỐ TIỀN"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-medium">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : recentOrders.map((order: Order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-xs font-bold text-slate-900 font-mono">
                    #{order.id.split('-')[0].toUpperCase()}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0051d5] flex items-center justify-center text-[10px] font-extrabold uppercase">
                        {order.shippingAddress?.fullName?.slice(0, 2) || "KH"}
                      </div>
                      <span className="font-semibold">{order.shippingAddress?.fullName || "Khách hàng"}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500 font-medium">{formatDate(order.createdAt)}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-4 px-6 text-xs font-black text-slate-900 text-right">
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
