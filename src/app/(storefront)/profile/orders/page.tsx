import Link from "next/link";
import Image from "next/image";
import { Download, Package, ShoppingBag, ArrowRight, FileText, Receipt } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { makeGetCurrentUserUseCase, makeGetProfileUseCase, getAppDictionary } from "@/server/di/container";
import { PaginationControls } from "@/client/components/common/PaginationControls";
import { ProfileOrderSearch } from "./ProfileOrderSearch";
import { getLocalizedText } from "@/shared/utils/locale";
import { getLocale } from "@/i18n/getDictionary";
import { formatDate, formatCurrency } from "@/shared/utils";
import { getUserOrdersAction, getUserPurchasedTemplatesAction } from "@/server/presentation/actions/order";
import { OrderStatus } from "@/shared/types/order";
import { StatusBadge } from "@/client/components/orders/StatusBadge";
import { ProfileSidebar } from "../ProfileSidebar";
import { UserOrdersRealtimeTracker } from "@/client/components/orders/UserOrdersRealtimeTracker";
import { ImageWithFallback } from "@/client/components/common/ImageWithFallback";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/utils";

export const metadata: Metadata = {
  title: { absolute: "Đơn hàng & Mã nguồn | KhoUI" },
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
  // Parallelize initial independent tasks: locale, dictionary, and DI factory creation
  const [locale, dict, getCurrentUserUseCase, getProfileUseCase] = await Promise.all([
    getLocale(),
    getAppDictionary(),
    makeGetCurrentUserUseCase(),
    makeGetProfileUseCase(),
  ]);
  const orderDict = (dict?.orders as Record<string, string>) || {};
  const profileDict = (dict?.profile as Record<string, string>) || {};

  const userResult = await getCurrentUserUseCase.execute();

  if (!userResult.success) {
    console.error("OrderHistoryPage: failed to authenticate user:", userResult.error);
    return (
      <main className="flex-grow bg-background py-16 font-sans">
        <div className="mx-auto max-w-xl px-5">
          <div className="border border-error/40 bg-surface p-8">
            <span className="mono-meta text-error">
              {locale === "vi" ? "Không thể xác thực thông tin người dùng" : "Failed to authenticate user"}
            </span>
            <p className="mt-3 text-[12.5px] leading-relaxed text-dark/55">
              {locale === "vi" ? "Vui lòng thử lại sau hoặc đăng nhập lại." : "Please try again later or sign in again."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const user = userResult.data;
  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  const profileResult = await getProfileUseCase.execute(user.id);

  if (!profileResult.success) {
    console.error("OrderHistoryPage: failed to load user profile:", profileResult.error);
    return (
      <main className="flex-grow bg-background py-16 font-sans">
        <div className="mx-auto max-w-xl px-5">
          <div className="border border-error/40 bg-surface p-8">
            <span className="mono-meta text-error">
              {locale === "vi" ? "Không thể tải thông tin hồ sơ" : "Failed to load profile details"}
            </span>
            <p className="mt-3 text-[12.5px] leading-relaxed text-dark/55">
              {locale === "vi" ? "Vui lòng thử lại sau." : "Please try again later."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const profile = profileResult.data;

  const params = await searchParams;
  const currentTab = params?.tab === "templates" ? "templates" : "orders";
  const rawPage = typeof params?.page === "string" ? parseInt(params.page, 10) : 1;
  const safePage = Number.isSafeInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const search = typeof params?.q === "string" ? params.q.trim() : undefined;

  // Parallelize orders and purchased templates queries concurrently
  const ordersPerPage = 6;
  const ordersOffset = (safePage - 1) * ordersPerPage;
  const templatesPerPage = 6;
  const templatesOffset = (safePage - 1) * templatesPerPage;

  const [ordersResult, templatesResult] = await Promise.all([
    getUserOrdersAction(
      ordersPerPage, 
      ordersOffset, 
      currentTab === "orders" ? search : undefined
    ),
    getUserPurchasedTemplatesAction(
      templatesPerPage,
      templatesOffset,
      currentTab === "templates" ? search : undefined
    ),
  ]);

  const ordersError = ordersResult.success ? null : ordersResult.error;
  const orders = ordersResult.data?.orders || [];
  const totalOrders = ordersResult.data?.total || 0;
  const totalOrdersPages = Math.max(1, Math.ceil(totalOrders / ordersPerPage));

  const templatesError = templatesResult.success ? null : templatesResult.error;
  const totalTemplates = templatesResult.data?.total || 0;
  const totalTemplatesPages = Math.max(1, Math.ceil(totalTemplates / templatesPerPage));

  const activeTotal = currentTab === "orders" ? totalOrders : totalTemplates;
  const activeTotalPages = currentTab === "orders" ? totalOrdersPages : totalTemplatesPages;

  if (activeTotal > 0 && safePage > activeTotalPages) {
    const redirectParams = new URLSearchParams();
    if (params?.tab) redirectParams.set("tab", params.tab);
    if (search) redirectParams.set("q", search);
    redirectParams.set("page", activeTotalPages.toString());
    redirect(`/profile/orders?${redirectParams.toString()}`);
  }

  const templateItems = (templatesResult.data?.items || []).map((item) => ({
    id: item.id,
    product_id: item.productId,
    price_at_purchase: item.priceAtPurchase,
    created_at: item.createdAt.toISOString(),
    order_id: item.orderId,
    order_created_at: item.orderCreatedAt ? item.orderCreatedAt.toISOString() : item.createdAt.toISOString(),
    products: item.product,
  }));

  return (
    <main className="flex-grow bg-background font-sans">
      <UserOrdersRealtimeTracker userId={user.id} />
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Navigation Sidebar */}
          <ProfileSidebar
            activeTab="orders"
            user={user}
            profile={profile}
            locale={locale}
            profileDict={profileDict}
          />

          {/* Main Content Area */}
          <div className="space-y-6 lg:col-span-9">
            <section className="border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="mono-meta text-[8.5px] text-dark/45">
                  03 / {profileDict.ordersCode || (locale === "vi" ? "Giao dịch" : "Orders")}
                </span>
                <span className="mono-meta text-[8px] text-dark/25">HTML5 · CSS3 · ZIP</span>
              </div>

              <div className="p-5 sm:p-8">
              {/* Header */}
              <div className="mb-6 border-b border-border pb-5">
                <span className="mono-meta flex items-center gap-2 text-primary">
                  <span className="h-1.5 w-1.5 bg-primary" />
                  {orderDict.profileOrdersTag || (locale === "vi" ? "QUẢN LÝ TÀI SẢN & GIAO DỊCH" : "ASSET & ORDER MANAGEMENT")}
                </span>
                <h1 className="mt-2.5 display text-[clamp(1.5rem,2.6vw,2rem)] text-dark">
                  {orderDict.profileOrdersTitle || (locale === "vi" ? "Đơn Hàng & Mã Nguồn" : "Orders & Templates")}
                </h1>
                <p className="mt-3 text-[12.5px] leading-relaxed text-dark/55">
                  {orderDict.profileOrdersSubtitle || (locale === "vi" ? "Xem lịch sử thanh toán, theo dõi trạng thái đơn hàng và tải xuống các gói mã nguồn bản quyền." : "View your payment history, track order statuses, and download your licensed source code packages.")}
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="mb-6 flex flex-wrap items-center gap-1.5 border-b border-border pb-4">
                <Link
                  href="/profile/orders?tab=orders"
                  className={cn(
                    "flex cursor-pointer items-center gap-2 border px-3 py-2 text-[11px] font-semibold transition-colors",
                    currentTab === "orders"
                      ? "border-dark bg-dark text-background"
                      : "border-border bg-surface text-dark/60 hover:border-dark hover:text-dark"
                  )}
                >
                  <Receipt size={13} />
                  <span>{orderDict.tabOrderHistory || (locale === "vi" ? "Lịch sử đơn hàng & thanh toán" : "Order & Payment History")}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 font-mono text-[9px]",
                    currentTab === "orders" ? "bg-background/20 text-background font-bold" : "bg-background-subtle text-dark/60"
                  )}>
                    {totalOrders}
                  </span>
                </Link>

                <Link
                  href="/profile/orders?tab=templates"
                  className={cn(
                    "flex cursor-pointer items-center gap-2 border px-3 py-2 text-[11px] font-semibold transition-colors",
                    currentTab === "templates"
                      ? "border-dark bg-dark text-background"
                      : "border-border bg-surface text-dark/60 hover:border-dark hover:text-dark"
                  )}
                >
                  <Download size={13} />
                  <span>{orderDict.tabMyTemplates || (locale === "vi" ? "Kho mã nguồn đã sở hữu" : "Purchased Templates")}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 font-mono text-[9px]",
                    currentTab === "templates" ? "bg-background/20 text-background font-bold" : "bg-background-subtle text-dark/60"
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
                    <div className="text-center py-16 bg-error/5  border border-error/30 max-w-xl mx-auto">
                      <Package className="w-12 h-12 text-error/50 mx-auto mb-4" />
                      <h2 className="text-lg font-bold text-error mb-2 tracking-tight">
                        {locale === "vi" ? "Lỗi tải lịch sử đơn hàng" : "Error Loading Order History"}
                      </h2>
                      <p className="text-dark/55 mb-6 max-w-sm mx-auto text-xs font-normal">
                        {ordersError}
                      </p>
                      <Link
                        href="/profile/orders?tab=orders"
                        className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold  text-background bg-error hover:bg-error/90 transition-all  active:scale-95"
                      >
                        {locale === "vi" ? "Thử lại" : "Retry"}
                      </Link>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 bg-background-subtle/40  border border-border max-w-xl mx-auto">
                      <ShoppingBag className="w-12 h-12 text-dark/25 mx-auto mb-4" />
                      <h2 className="text-lg font-bold text-dark mb-2 tracking-tight">
                        {orderDict.emptyOrdersListTitle || (locale === "vi" ? "Bạn chưa có đơn hàng nào" : "No Orders Placed Yet")}
                      </h2>
                      <p className="text-dark/55 mb-6 max-w-sm mx-auto text-xs font-normal">
                        {search
                          ? (locale === "vi" ? `Không tìm thấy đơn hàng nào khớp với từ khóa "${search}".` : `No orders found matching "${search}".`)
                          : (orderDict.emptyOrdersListDesc || (locale === "vi" ? "Khi bạn đặt mua các mẫu template, toàn bộ lịch sử thanh toán và chi tiết đơn hàng sẽ xuất hiện tại đây." : "When you place an order, your complete payment history and order details will appear here."))}
                      </p>
                      <Link
                        href={ROUTES.SHOP}
                        className="inline-flex items-center justify-center bg-dark px-5 py-2.5 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary"
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
                            className="bg-surface  border border-border p-5 sm:p-6  hover:border-border transition-all space-y-4"
                          >
                            {/* Card Top: Order Code, Date, Status */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-border">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="font-mono text-xs font-bold text-dark bg-background-subtle px-2.5 py-1  border border-border">
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </span>
                                <StatusBadge status={order.status} className="text-xs px-2.5 py-0.5" />
                                <span className="text-xs text-dark/40 font-normal">
                                  • {formatDate(order.createdAt, locale)}
                                </span>
                              </div>

                              {/* Payment summary badge */}
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-dark/40 font-mono uppercase">
                                  {order.paymentMethod === "cod" ? "Manual VietQR" : order.paymentMethod.toUpperCase()}
                                </span>
                                <span
                                  className={cn(
                                    "px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] border",
                                    order.status === OrderStatus.CANCELLED || order.paymentStatus === "failed"
                                      ? "bg-error/5 text-error border-error/40"
                                      : isPaid
                                      ? "bg-success/5 text-success border-success/30"
                                      : "bg-primary/5 text-primary border-primary/30"
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
                            <div className="divide-y divide-border">
                              {order.items.map((item) => {
                                const title = typeof item.productTitle === "object"
                                  ? getLocalizedText(item.productTitle as Record<string, string>, locale)
                                  : (item.productTitle || item.productSnapshot?.title || "Template Package");
                                const imageSrc = item.productSnapshot?.image_url || item.productSnapshot?.image || "";

                                return (
                                  <div key={item.id} className="flex items-center gap-3.5 py-2.5">
                                    <div className="relative w-12 h-9 bg-background-subtle  overflow-hidden border border-border flex-shrink-0">
                                      {imageSrc ? (
                                        <ImageWithFallback
                                          src={imageSrc}
                                          alt={title}
                                          fill
                                          className="object-cover"
                                          fallbackElement={<Package className="w-4 h-4 text-dark/25 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                        />
                                      ) : (
                                        <Package className="w-4 h-4 text-dark/25 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-xs font-semibold text-dark truncate">
                                        {title}
                                      </h3>
                                      <p className="text-[11px] text-dark/40 font-mono mt-0.5">
                                        {item.quantity} x {formatCurrency(item.priceAtPurchase, locale)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Card Bottom: Total & Primary CTA Link to Order Details */}
                            <div className="pt-3.5 border-t border-border flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs text-dark/40 font-normal">
                                  {orderDict.total || (locale === "vi" ? "Tổng cộng:" : "Total:")}
                                </span>
                                <span className="text-sm sm:text-base font-bold text-dark font-mono">
                                  {formatCurrency(order.totalAmount, locale)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/profile/orders/${order.id}`}
                                  className="px-4 py-2 bg-dark text-background  text-xs font-semibold hover:bg-primary transition-all flex items-center gap-1.5  active:scale-95 cursor-pointer"
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

                  <PaginationControls 
                    currentPage={safePage} 
                    totalPages={totalOrdersPages} 
                    totalItems={totalOrders}
                    itemsPerPage={ordersPerPage}
                    itemName={{ vi: "đơn hàng", en: "orders" }}
                    layoutId="profile-orders-pagination"
                    className="mt-8"
                  />
                </div>
              )}

              {/* TAB 2: DOWNLOADABLE PURCHASED TEMPLATES */}
              {currentTab === "templates" && (
                <div>
                  {templatesError ? (
                    <div className="text-center py-16 bg-error/5  border border-error/30 max-w-xl mx-auto">
                      <Package className="w-12 h-12 text-error/50 mx-auto mb-4" />
                      <h2 className="text-lg font-bold text-error mb-2 tracking-tight">
                        {locale === "vi" ? "Lỗi tải danh sách mã nguồn" : "Error Loading Templates"}
                      </h2>
                      <p className="text-dark/55 mb-6 max-w-sm mx-auto text-xs font-normal">
                        {templatesError || (locale === "vi" ? "Không thể lấy dữ liệu mã nguồn đã mua." : "Could not retrieve purchased templates.")}
                      </p>
                      <Link
                        href="/profile/orders?tab=templates"
                        className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold  text-background bg-error hover:bg-error/90 transition-all  active:scale-95"
                      >
                        {locale === "vi" ? "Thử lại" : "Retry"}
                      </Link>
                    </div>
                  ) : templateItems.length === 0 ? (
                    <div className="text-center py-16 bg-background-subtle/40  border border-border max-w-xl mx-auto">
                      <ShoppingBag className="w-12 h-12 text-dark/25 mx-auto mb-4" />
                      <h2 className="text-lg font-bold text-dark mb-2 tracking-tight">
                        {orderDict.emptyOrdersTitle || (locale === "vi" ? "Không tìm thấy giao diện" : "No Templates Found")}
                      </h2>
                      <p className="text-dark/55 mb-6 max-w-sm mx-auto text-xs font-normal">
                        {search
                          ? (locale === "vi" ? `Không có mẫu template nào khớp với từ khóa "${search}".` : `No templates found matching "${search}".`)
                          : (orderDict.emptyOrdersDesc || (locale === "vi" ? "Bạn chưa sở hữu bản quyền template nào. Hãy khám phá thư viện cao cấp của chúng tôi ngay hôm nay." : "You don't own any licensed templates yet. Explore our premium catalog today."))}
                      </p>
                      <Link
                        href={ROUTES.SHOP}
                        className="inline-flex items-center justify-center bg-dark px-5 py-2.5 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary"
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
                            className="bg-surface border border-border hover:border-dark/40 transition-colors duration-200 flex flex-col overflow-hidden group"
                          >
                            <Link href={`/product/${item.product_id}`} className="relative aspect-[16/10] bg-background-subtle overflow-hidden block">
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
                                  <Package className="w-8 h-8 text-dark/25" />
                                </div>
                              )}
                              <div className="absolute right-2 top-2 border border-white/10 bg-dark/85 px-1.5 py-1 backdrop-blur-md">
                                <span className="mono-meta flex items-center gap-1.5 text-[7px] text-background">
                                  <span className="h-1 w-1 animate-pulse bg-success motion-reduce:animate-none" />
                                  {orderDict.licenseActive || (locale === "vi" ? "Bản quyền trọn đời" : "Lifetime License")}
                                </span>
                              </div>
                            </Link>

                            <div className="p-4 flex flex-col flex-grow">
                              <div className="flex-grow">
                                <Link href={`/product/${item.product_id}`}>
                                  <h3 className="font-semibold text-dark text-sm leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2 tracking-tight">
                                    {getLocalizedText(product.title as Record<string, string>, locale)}
                                  </h3>
                                </Link>
                                <p className="text-[11px] text-dark/40 font-normal font-mono mb-3">
                                  {orderDict.purchasedDate || (locale === "vi" ? "Đã mua:" : "Purchased on:")}{" "}
                                  {formatDate(item.order_created_at, locale)}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-border flex items-center gap-2">
                                {product.source_code_url ? (
                                  <a
                                    href={product.source_code_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-dark text-background py-2  text-xs font-semibold hover:bg-primary transition-all active:scale-95  cursor-pointer"
                                  >
                                    <Download size={13} />
                                    <span>{orderDict.downloadSourceCode || (locale === "vi" ? "Tải code" : "Download")}</span>
                                  </a>
                                ) : (
                                  <span
                                    aria-disabled="true"
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-background-subtle text-dark/40 py-2  text-xs font-semibold cursor-not-allowed"
                                  >
                                    <Download size={13} />
                                    <span>{orderDict.downloadUnavailable || (locale === "vi" ? "Chưa có file" : "Unavailable")}</span>
                                  </span>
                                )}

                                {item.order_id && (
                                  <Link
                                    href={`/profile/orders/${item.order_id}`}
                                    title={orderDict.viewOrderDetail || (locale === "vi" ? "Xem chi tiết đơn hàng" : "View Order Details")}
                                    className="flex items-center justify-center px-2.5 h-8.5 bg-background-subtle text-dark/70  hover:bg-background-subtle hover:text-dark transition-all border border-border active:scale-95 text-xs font-medium gap-1 cursor-pointer"
                                  >
                                    <FileText size={13} />
                                    <span className="hidden sm:inline">{locale === "vi" ? "Đơn hàng" : "Order"}</span>
                                  </Link>
                                )}

                                <Link
                                  href={`/product/${item.product_id}`}
                                  className="flex items-center justify-center w-8.5 h-8.5 bg-background-subtle text-dark/60  hover:bg-background-subtle hover:text-dark transition-all border border-border active:scale-95 cursor-pointer"
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

                  <PaginationControls 
                    currentPage={safePage} 
                    totalPages={totalTemplatesPages} 
                    totalItems={totalTemplates}
                    itemsPerPage={templatesPerPage}
                    itemName={{ vi: "mã nguồn", en: "templates" }}
                    layoutId="profile-templates-pagination"
                    className="mt-8"
                  />
                </div>
              )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

