import { redirect } from "next/navigation";
import { getAllOrdersAction } from "@/presentation/actions/order";
import { OrderList } from "@/presentation/components/admin/orders/OrderList";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";
import { getAppDictionary } from "@/di/container";
import { getLocale } from "@/i18n/getDictionary";
import { Package } from "lucide-react";
import { Metadata } from "next";
import { OrderStatus } from "@/domain/entities/Order";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng | KhoUI Admin",
};

interface AdminOrdersPageProps {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}

/**
 * Admin orders management page.
 * Displays filterable/searchable order list with status tabs and pagination.
 */
export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const rawPage = typeof params?.page === "string" ? parseInt(params.page, 10) : 1;
  const currentPage = Number.isSafeInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params?.q === 'string' ? params.q.trim() : undefined;
  const status = typeof params?.status === 'string' && params.status !== 'all' ? params.status as OrderStatus : undefined;

  const dict = await getAppDictionary();
  const adminDict = (dict.admin as Record<string, string>) || {};
  const locale = await getLocale();

  const response = await getAllOrdersAction(status, itemsPerPage, offset, search);
  
  const orders = response.success ? response.data?.orders || [] : [];
  const total = response.success ? response.data?.total || 0 : 0;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  if (total > 0 && currentPage > totalPages) {
    const redirectParams = new URLSearchParams();
    if (search) redirectParams.set("q", search);
    if (params?.status && params.status !== "all") redirectParams.set("status", params.status);
    redirectParams.set("page", totalPages.toString());
    redirect(`/admin/orders?${redirectParams.toString()}`);
  }

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
      
      <PaginationControls 
        currentPage={currentPage} 
        totalPages={totalPages} 
        totalItems={total}
        itemsPerPage={itemsPerPage}
        itemName={{ vi: "đơn hàng", en: "orders" }}
        layoutId="admin-orders-pagination"
        className="mt-8"
      />
    </div>
  );
}
