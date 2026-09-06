import Link from "next/link";
import Image from "next/image";
import { Download, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { makeAuthRepository, makeLanguageRepository, makeSupabaseClient } from "@/infrastructure/supabase/container";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";
import { ProfileOrderSearch } from "./ProfileOrderSearch";
import { getLocalizedText } from "@/presentation/utils/locale";
import { getDictionary } from "@/i18n/getDictionary";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kho giao diện đã mua | KhoUI",
  description: "Quản lý và tải xuống các giao diện bạn đã thanh toán",
};

interface OrderHistoryPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

/**
 * Order history and digital template vault page for authenticated users.
 * Lists all purchased/completed UI templates with download links, search, and pagination.
 */
export default async function OrderHistoryPage({ searchParams }: OrderHistoryPageProps) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as 'vi' | 'en') || 'vi';
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const orderDict = (dict?.orders as Record<string, string>) || {};
  const commonDict = (dict?.common as Record<string, string>) || {};

  const authRepo = await makeAuthRepository();
  const user = await authRepo.getCurrentUser();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 max-w-lg mx-auto text-center font-bold text-sm">
          {locale === "vi" ? "Bạn cần đăng nhập để xem kho giao diện." : "You must be signed in to view your templates."}
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const itemsPerPage = 9;
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params.q === 'string' ? params.q : undefined;

  const supabase = await makeSupabaseClient();
  let query = supabase
    .from('order_items')
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
    `, { count: 'exact' })
    .eq('orders.user_id', user.id)
    .neq('orders.status', 'cancelled')
    .or('payment_status.eq.paid,status.eq.completed,status.eq.delivered', { referencedTable: 'orders' });

  if (search) {
    query = query.ilike('products.title', `%${search}%`);
  }

  const { data: orderItemsData, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + itemsPerPage - 1);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-red-100 max-w-2xl mx-auto">
          <Package className="w-16 h-16 text-red-300 mx-auto mb-6" />
          <h2 className="text-2xl font-extrabold text-red-900 mb-3">
            {commonDict.error || (locale === "vi" ? "Lỗi tải dữ liệu" : "Error Loading Data")}
          </h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">
            {locale === "vi" ? "Đã có lỗi xảy ra khi lấy danh sách giao diện đã mua. Vui lòng thử lại sau." : "An error occurred while retrieving your purchased templates. Please try again."}
          </p>
          <Link
            href="/profile/orders"
            className="inline-flex items-center justify-center px-8 py-3 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all shadow-md active:scale-95 uppercase tracking-wider"
          >
            {commonDict.retry || (locale === "vi" ? "Thử lại" : "Retry")}
          </Link>
        </div>
      </div>
    );
  }
  
  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  const items = (orderItemsData || []).map((item: unknown) => {
    const typedItem = item as { 
      id: string; 
      product_id: string; 
      price_at_purchase: number; 
      created_at: string; 
      order_id: string; 
      products: unknown; 
      orders: { created_at?: string } | null 
    };
    return {
      ...typedItem,
      order_created_at: typedItem.orders?.created_at || typedItem.created_at
    };
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl font-sans">
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <span className="text-xs font-semibold tracking-wider text-primary uppercase block mb-2">
          {orderDict.profileOrdersTag || (locale === "vi" ? "TÀI SẢN KỸ THUẬT SỐ" : "DIGITAL ASSETS")}
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          {orderDict.profileOrdersTitle || (locale === "vi" ? "Kho Giao Diện" : "My Templates")}
        </h1>
        <p className="text-slate-500 max-w-lg font-normal text-xs">
          {orderDict.profileOrdersSubtitle || (locale === "vi" ? "Quản lý và tải xuống toàn bộ mã nguồn các mẫu template mà bạn đã sở hữu bản quyền hợp lệ." : "Manage and download full source code packages for all templates you have licensed.")}
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <ProfileOrderSearch currentSearch={search || ""} />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-xs border border-slate-100 max-w-2xl mx-auto">
          <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
            {orderDict.emptyOrdersTitle || (locale === "vi" ? "Không tìm thấy giao diện" : "No Templates Found")}
          </h2>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto text-xs font-normal">
            {search 
              ? (locale === "vi" ? `Không có mẫu template nào khớp với từ khóa "${search}".` : `No templates found matching "${search}".`)
              : (orderDict.emptyOrdersDesc || (locale === "vi" ? "Bạn chưa sở hữu bản quyền template nào. Hãy khám phá thư viện cao cấp của chúng tôi ngay hôm nay." : "You don't own any licensed templates yet. Explore our premium catalog today."))}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary-dark transition-all shadow-xs active:scale-95"
          >
            {orderDict.exploreShop || (locale === "vi" ? "Khám phá cửa hàng" : "Explore Catalog")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => {
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
                      <Package className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 backdrop-blur-md bg-slate-950/80 border border-white/10 px-2.5 py-0.5 rounded-full shadow-xs">
                    <span className="text-xs font-medium text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {orderDict.licenseActive || (locale === "vi" ? "Bản quyền trọn đời" : "Lifetime License")}
                    </span>
                  </div>
                </Link>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <Link href={`/product/${item.product_id}`}>
                      <h3 className="font-semibold text-slate-900 text-sm md:text-base leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2 tracking-tight">
                        {getLocalizedText(product.title as Record<string, string>, locale)}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 font-normal font-mono mb-4">
                      {orderDict.purchasedDate || (locale === "vi" ? "Đã mua:" : "Purchased on:")}{" "}
                      {formatDate(item.order_created_at, locale)}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100 flex gap-2.5">
                    <a
                      href={product.source_code_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-xs font-medium hover:bg-primary-dark transition-all active:scale-95 shadow-xs"
                    >
                      <Download size={14} />
                      <span>{orderDict.downloadSourceCode || (locale === "vi" ? "Tải source code" : "Download Code")}</span>
                    </a>
                    <Link
                      href={`/product/${item.product_id}`}
                      className="flex items-center justify-center w-10 h-10 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 hover:text-slate-950 transition-all border border-slate-200/80 active:scale-95"
                    >
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <PaginationControls currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
