import { getAllOrdersAction } from "@/presentation/actions/order";
import { OrderList } from "@/presentation/components/admin/orders/OrderList";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { Package } from "lucide-react";
import { Metadata } from "next";
import { OrderStatus } from "@/domain/entities/Order";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng | KhoUI Admin",
};

interface AdminOrdersPageProps {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params.q === 'string' ? params.q : undefined;
  const status = typeof params.status === 'string' && params.status !== 'all' ? params.status as OrderStatus : undefined;

  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const adminDict = (dict.admin as Record<string, string>) || {};
  const locale = await getLocale();

  const response = await getAllOrdersAction(status, itemsPerPage, offset, search);
  
  const orders = response.success ? response.data?.orders || [] : [];
  const total = response.success ? response.data?.total || 0 : 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-primary" />
            <span>{adminDict.ordersTitle || (locale === "vi" ? "Quản lý đơn hàng" : "Order Management")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-1">
            {adminDict.ordersSubtitle || (locale === "vi" ? "Theo dõi, xử lý và quản lý tất cả đơn hàng kỹ thuật số của KhoUI." : "Track, process and manage all KhoUI digital orders.")}
          </p>
        </div>
      </div>

      {!response.success && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm">
          {response.error}
        </div>
      )}

      <OrderList initialOrders={orders} currentStatus={params.status || 'all'} currentSearch={search || ''} total={total} />
      
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <PaginationControls currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
