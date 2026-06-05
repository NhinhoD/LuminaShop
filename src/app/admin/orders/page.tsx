import { getAllOrdersAction } from "@/presentation/actions/order";
import { OrderList } from "@/presentation/components/admin/orders/OrderList";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";
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

  const response = await getAllOrdersAction(status, itemsPerPage, offset, search);
  
  const orders = response.success ? response.data?.orders || [] : [];
  const total = response.success ? response.data?.total || 0 : 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            Quản lý đơn hàng
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi, xử lý và quản lý tất cả đơn hàng của KhoUI.
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
