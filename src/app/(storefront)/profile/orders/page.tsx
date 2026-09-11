import Link from "next/link";
import Image from "next/image";
import { Download, Package, ShoppingBag, ArrowRight, FileText, Receipt } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { makeAuthRepository, makeLanguageRepository, makeSupabaseClient } from "@/infrastructure/supabase/container";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";
import { ProfileOrderSearch } from "./ProfileOrderSearch";
import { getLocalizedText } from "@/presentation/utils/locale";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { formatDate, formatCurrency } from "@/lib/utils";
import { getUserOrdersAction } from "@/presentation/actions/order";
import { OrderStatus } from "@/domain/entities/Order";
import { StatusBadge } from "@/presentation/components/orders/StatusBadge";
import { ProfileSidebar } from "../ProfileSidebar";
import { UserOrdersRealtimeTracker } from "@/presentation/components/orders/UserOrdersRealtimeTracker";
import { ImageWithFallback } from "@/presentation/components/common/ImageWithFallback";
import { ROUTES } from "@/presentation/constants";
import { cn } from "@/presentation/utils";

export const metadata: Metadata = {
  title: "Đơn hàng & Mã nguồn | KhoUI",
  description: "Quản lý đơn hàng, lịch sử thanh toán và tải xuống các gói mã nguồn đã sở hữu",
};

interface OrderHistoryPageProps {
  searchParams: Promise<{ page?: string; q?: string; tab?: string }>;
}

/**
 * Customer order history and digital templates vault page.
 * Provides two-tab navigation between overall order history and purchased source code templates,
 * with search, pagination, and real-time order updates.
 *
 * @param props - Component props containing searchParams promise.
 * @returns JSX Element for the profile orders dashboard.
 */
export default async function OrderHistoryPage({ searchParams }: OrderHistoryPageProps) {
  const authRepo = await makeAuthRepository();
  const user = await authRepo.getCurrentUser();

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  const profile = await authRepo.getProfile(user.id);
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const orderDict = (dict?.orders as Record<string, string>) || {};
  const profileDict = (dict?.profile as Record<string, string>) || {};

  const params = await searchParams;
  const currentTab = params.tab === "templates" ? "templates" : "orders";
  const parsedPage = parseInt(params.page || "1", 10);
  const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const search = typeof params.q === "string" ? params.q.trim() : undefined;

  const supabase = await makeSupabaseClient();

  // 1. Query user orders for "Lịch sử đơn hàng & thanh toán"
  const ordersPerPage = 10;
  const ordersOffset = (safePage - 1) * ordersPerPage;
  const ordersResult = await getUserOrdersAction(
    ordersPerPage, 
    ordersOffset, 
    currentTab === "orders" ? search : undefined
  );
  const ordersError = ordersResult.success ? null : ordersResult.error;
  const orders = ordersResult.data?.orders || [];
  const totalOrders = ordersResult.data?.total || 0;
  const totalOrdersPages = Math.ceil(totalOrders / ordersPerPage);

  // 2. Query user purchased templates for "Kho mã nguồn đã sở hữu"
  const templatesPerPage = 9;
  const templatesOffset = (safePage - 1) * templatesPerPage;

  let templatesQuery = supabase
    .from("order_items")
    .select(`
      id,
      product_id,
      price_at_purchase,
      created_at,
      order_id,
      products!inner (*),
      orders!inner (
        status,
        payment_status,
        user_id,
        created_at
      )
    `, { count: "exact" })
    .eq("orders.user_id", user.id)
    .neq("orders.status", "cancelled")
    .or("payment_status.eq.paid,status.eq.completed,status.eq.delivered", { referencedTable: "orders" });

  if (search && currentTab === "templates") {
    templatesQuery = templatesQuery.or(`title->>vi.ilike.%${search}%,title->>en.ilike.%${search}%`, { referencedTable: "products" });
  }

  const { data: orderItemsData, count: totalTemplatesCount, error: templatesError } = await templatesQuery
    .order("created_at", { ascending: false })
    .range(templatesOffset, templatesOffset + templatesPerPage - 1);

  const totalTemplates = totalTemplatesCount || 0;
  const totalTemplatesPages = Math.ceil(totalTemplates / templatesPerPage);

  const templateItems = (orderItemsData || []).map((item: unknown) => {
    const typedItem = item as {
      id: string;
      product_id: string;
      price_at_purchase: number;
      created_at: string;
      order_id: string;
      products: unknown;
      orders: { created_at?: string } | null;
    };
    return {
      ...typedItem,
      order_created_at: typedItem.orders?.created_at || typedItem.created_at,
    };
  });

  return (
    <main className="flex-grow pt-16 pb-24 bg-background-subtle font-sans">
      <UserOrdersRealtimeTracker userId={user.id} />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <ProfileSidebar
            activeTab="orders"
            user={user}
            profile={profile}
            locale={locale}
            profileDict={profileDict}
          />

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            <section className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10 shadow-xs">
              {/* Header */}
              <div className="mb-6">
                <span className="text-xs font-semibold tracking-wider text-primary uppercase block mb-1">
                  {orderDict.profileOrdersTag || (locale === "vi" ? "QUẢN LÝ TÀI SẢN & GIAO DỊCH" : "ASSET & ORDER MANAGEMENT")}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {orderDict.profileOrdersTitle || (locale === "vi" ? "Đơn Hàng & Mã Nguồn" : "Orders & Templates")}
                </h1>
                <p className="text-slate-500 text-xs mt-1.5 font-normal">
                  {orderDict.profileOrdersSubtitle || (locale === "vi" ? "Xem lịch sử thanh toán, theo dõi trạng thái đơn hàng và tải xuống các gói mã nguồn bản quyền." : "View your payment history, track order statuses, and download your licensed source code packages.")}
                </p>
                <div className="h-0.5 w-12 bg-primary rounded-full mt-3" />
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <Link
                  href="/profile/orders?tab=orders"
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer",
                    currentTab === "orders"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Receipt size={15} />
                  <span>{orderDict.tabOrderHistory || (locale === "vi" ? "Lịch sử đơn hàng & thanh toán" : "Order & Payment History")}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-mono",
                    currentTab === "orders" ? "bg-white/20 text-white font-bold" : "bg-slate-100 text-slate-600"
                  )}>
                    {totalOrders}
                  </span>
                </Link>

                <Link
                  href="/profile/orders?tab=templates"
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer",
                    currentTab === "templates"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Download size={15} />
                  <span>{orderDict.tabMyTemplates || (locale === "vi" ? "Kho mã nguồn đã sở hữu" : "Purchased Templates")}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-mono",
                    currentTab === "templates" ? "bg-white/20 text-white font-bold" : "bg-slate-100 text-slate-600"
                  )}>
                    {totalTemplates}
                  </span>
                </Link>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <ProfileOrderSearch currentSearch={search || ""} />
              </div>

              {/* TAB 1: ORDER HISTORY & PAYMENTS */}
              {currentTab === "orders" && (
                <div>
                  {ordersError ? (
                    <div className="text-center py-16 bg-red-50/50 rounded-3xl border border-red-100 max-w-xl mx-auto">
                      <Package className="w-12 h-12 text-red-300 mx-auto mb-4" />
                      <h2 className="text-lg font-bold text-red-900 mb-2 tracking-tight">
                        {locale === "vi" ? "Lỗi tải lịch sử đơn hàng" : "Error Loading Order History"}
                      </h2>
                      <p className="text-slate-500 mb-6 max-w-sm mx-auto text-xs font-normal">
                        {ordersError}
                      </p>
                      <Link
                        href="/profile/orders?tab=orders"
                        className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all shadow-xs active:scale-95"
                      >
                        {locale === "vi" ? "Thử lại" : "Retry"}
                      </Link>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50/50 rounded-3xl border border-slate-100 max-w-xl mx-auto">
                      <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h2 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                        {orderDict.emptyOrdersListTitle || (locale === "vi" ? "Bạn chưa có đơn hàng nào" : "No Orders Placed Yet")}
                      </h2>
                      <p className="text-slate-500 mb-6 max-w-sm mx-auto text-xs font-normal">
                        {search
                          ? (locale === "vi" ? `Không tìm thấy đơn hàng nào khớp với từ khóa "${search}".` : `No orders found matching "${search}".`)
                          : (orderDict.emptyOrdersListDesc || (locale === "vi" ? "Khi bạn đặt mua các mẫu template, toàn bộ lịch sử thanh toán và chi tiết đơn hàng sẽ xuất hiện tại đây." : "When you place an order, your complete payment history and order details will appear here."))}
                      </p>
                      <Link
                        href={ROUTES.SHOP}
                        className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold rounded-xl text-white bg-primary hover:bg-primary-dark transition-all shadow-xs active:scale-95"
                      >
                        {orderDict.exploreShop || (locale === "vi" ? "Khám phá cửa hàng" : "Explore Catalog")}
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const isPaid = order.paymentStatus === "paid" || order.status === OrderStatus.COMPLETED;
                        return (
                          <div
                            key={order.id}
                            className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-xs hover:border-slate-200 transition-all space-y-4"
                          >
                            {/* Card Top: Order Code, Date, Status */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </span>
                                <StatusBadge status={order.status} className="text-xs px-2.5 py-0.5" />
                                <span className="text-xs text-slate-400 font-normal">
                                  • {formatDate(order.createdAt, locale)}
                                </span>
                              </div>

                              {/* Payment summary badge */}
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-mono uppercase">
                                  {order.paymentMethod === "cod" ? "Manual VietQR" : order.paymentMethod.toUpperCase()}
                                </span>
                                <span
                                  className={cn(
                                    "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                                    order.status === OrderStatus.CANCELLED || order.paymentStatus === "failed"
                                      ? "bg-red-50 text-red-600 border-red-200"
                                      : isPaid
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                      : "bg-amber-50 text-amber-600 border-amber-200"
                                  )}
                                >
                                  {order.status === OrderStatus.CANCELLED
                                    ? (orderDict.paymentCancelled || (locale === "vi" ? "Đã hủy" : "Cancelled"))
                                    : isPaid
                                    ? (orderDict.paymentPaid || (locale === "vi" ? "Đã xác nhận" : "Paid"))
                                    : (orderDict.paymentPending || (locale === "vi" ? "Chờ thanh toán" : "Pending"))}
                                </span>
                              </div>
                            </div>

                            {/* Card Middle: Items list */}
                            <div className="divide-y divide-slate-50">
                              {order.items.map((item) => {
                                const title = typeof item.productTitle === "object"
                                  ? getLocalizedText(item.productTitle as Record<string, string>, locale)
                                  : (item.productTitle || item.productSnapshot?.title || "Template Package");
                                const imageSrc = item.productSnapshot?.image_url || item.productSnapshot?.image || "";

                                return (
                                  <div key={item.id} className="flex items-center gap-3.5 py-2.5">
                                    <div className="relative w-12 h-9 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                                      {imageSrc ? (
                                        <ImageWithFallback
                                          src={imageSrc}
                                          alt={title}
                                          fill
                                          className="object-cover"
                                          fallbackElement={<Package className="w-4 h-4 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                        />
                                      ) : (
                                        <Package className="w-4 h-4 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-xs font-semibold text-slate-900 truncate">
                                        {title}
                                      </h3>
                                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                        {item.quantity} x {formatCurrency(item.priceAtPurchase, locale)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Card Bottom: Total & Primary CTA Link to Order Details */}
                            <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs text-slate-400 font-normal">
                                  {orderDict.total || (locale === "vi" ? "Tổng cộng:" : "Total:")}
                                </span>
                                <span className="text-sm sm:text-base font-bold text-slate-950 font-mono">
                                  {formatCurrency(order.totalAmount, locale)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/profile/orders/${order.id}`}
                                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                                >
                                  <FileText size={14} />
                                  <span>{orderDict.viewOrderDetail || (locale === "vi" ? "Chi tiết đơn hàng" : "View Order Details")}</span>
                                  <ArrowRight size={13} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {totalOrdersPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <PaginationControls currentPage={safePage} totalPages={totalOrdersPages} />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DOWNLOADABLE PURCHASED TEMPLATES */}
              {currentTab === "templates" && (
                <div>
                  {templatesError ? (
                    <div className="text-center py-16 bg-red-50/50 rounded-3xl border border-red-100 max-w-xl mx-auto">
                      <Package className="w-12 h-12 text-red-300 mx-auto mb-4" />
                      <h2 className="text-lg font-bold text-red-900 mb-2 tracking-tight">
                        {locale === "vi" ? "Lỗi tải danh sách mã nguồn" : "Error Loading Templates"}
                      </h2>
                      <p className="text-slate-500 mb-6 max-w-sm mx-auto text-xs font-normal">
                        {templatesError.message || (locale === "vi" ? "Không thể lấy dữ liệu mã nguồn đã mua." : "Could not retrieve purchased templates.")}
                      </p>
                      <Link
                        href="/profile/orders?tab=templates"
                        className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all shadow-xs active:scale-95"
                      >
                        {locale === "vi" ? "Thử lại" : "Retry"}
                      </Link>
                    </div>
                  ) : templateItems.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50/50 rounded-3xl border border-slate-100 max-w-xl mx-auto">
                      <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h2 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                        {orderDict.emptyOrdersTitle || (locale === "vi" ? "Không tìm thấy giao diện" : "No Templates Found")}
                      </h2>
                      <p className="text-slate-500 mb-6 max-w-sm mx-auto text-xs font-normal">
                        {search
                          ? (locale === "vi" ? `Không có mẫu template nào khớp với từ khóa "${search}".` : `No templates found matching "${search}".`)
                          : (orderDict.emptyOrdersDesc || (locale === "vi" ? "Bạn chưa sở hữu bản quyền template nào. Hãy khám phá thư viện cao cấp của chúng tôi ngay hôm nay." : "You don't own any licensed templates yet. Explore our premium catalog today."))}
                      </p>
                      <Link
                        href={ROUTES.SHOP}
                        className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold rounded-xl text-white bg-primary hover:bg-primary-dark transition-all shadow-xs active:scale-95"
                      >
                        {orderDict.exploreShop || (locale === "vi" ? "Khám phá cửa hàng" : "Explore Catalog")}
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {templateItems.map((item, idx) => {
                        const product = Array.isArray(item.products) ? item.products[0] : item.products;
                        if (!product) return null;
                        return (
                          <div
                            key={idx}
                            className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col overflow-hidden group"
                          >
                            <Link href={`/product/${item.product_id}`} className="relative aspect-[16/10] bg-slate-50 overflow-hidden block">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={getLocalizedText(product.title as Record<string, string>, locale)}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-slate-300" />
                                </div>
                              )}
                              <div className="absolute top-2.5 right-2.5 backdrop-blur-md bg-slate-950/80 border border-white/10 px-2.5 py-0.5 rounded-full shadow-xs">
                                <span className="text-[11px] font-medium text-white flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  {orderDict.licenseActive || (locale === "vi" ? "Bản quyền trọn đời" : "Lifetime License")}
                                </span>
                              </div>
                            </Link>

                            <div className="p-4 flex flex-col flex-grow">
                              <div className="flex-grow">
                                <Link href={`/product/${item.product_id}`}>
                                  <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2 tracking-tight">
                                    {getLocalizedText(product.title as Record<string, string>, locale)}
                                  </h3>
                                </Link>
                                <p className="text-[11px] text-slate-400 font-normal font-mono mb-3">
                                  {orderDict.purchasedDate || (locale === "vi" ? "Đã mua:" : "Purchased on:")}{" "}
                                  {formatDate(item.order_created_at, locale)}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                                {product.source_code_url ? (
                                  <a
                                    href={product.source_code_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white py-2 rounded-xl text-xs font-semibold hover:bg-primary-dark transition-all active:scale-95 shadow-xs cursor-pointer"
                                  >
                                    <Download size={13} />
                                    <span>{orderDict.downloadSourceCode || (locale === "vi" ? "Tải code" : "Download")}</span>
                                  </a>
                                ) : (
                                  <span
                                    aria-disabled="true"
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 py-2 rounded-xl text-xs font-semibold cursor-not-allowed"
                                  >
                                    <Download size={13} />
                                    <span>{orderDict.downloadUnavailable || (locale === "vi" ? "Chưa có file" : "Unavailable")}</span>
                                  </span>
                                )}

                                {item.order_id && (
                                  <Link
                                    href={`/profile/orders/${item.order_id}`}
                                    title={orderDict.viewOrderDetail || (locale === "vi" ? "Xem chi tiết đơn hàng" : "View Order Details")}
                                    className="flex items-center justify-center px-2.5 h-8.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 hover:text-slate-950 transition-all border border-slate-200/80 active:scale-95 text-xs font-medium gap-1 cursor-pointer"
                                  >
                                    <FileText size={13} />
                                    <span className="hidden sm:inline">{locale === "vi" ? "Đơn hàng" : "Order"}</span>
                                  </Link>
                                )}

                                <Link
                                  href={`/product/${item.product_id}`}
                                  className="flex items-center justify-center w-8.5 h-8.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 hover:text-slate-950 transition-all border border-slate-200/80 active:scale-95 cursor-pointer"
                                >
                                  <ArrowRight size={14} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {totalTemplatesPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <PaginationControls currentPage={safePage} totalPages={totalTemplatesPages} />
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

