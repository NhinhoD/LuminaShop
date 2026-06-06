import Link from "next/link";
import { Download, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";
import { ProfileOrderSearch } from "./ProfileOrderSearch";
import { getLocalizedText } from "@/presentation/utils/locale";

export const metadata: Metadata = {
  title: "Kho giao diện đã mua | KhoUI",
  description: "Quản lý và tải xuống các giao diện bạn đã thanh toán",
};

interface OrderHistoryPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function OrderHistoryPage({ searchParams }: OrderHistoryPageProps) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as 'vi' | 'en') || 'vi';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 font-bold">
          Bạn cần đăng nhập để xem kho giao diện.
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const itemsPerPage = 9; // 3x3 grid
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params.q === 'string' ? params.q : undefined;

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
        user_id,
        created_at
      )
    `, { count: 'exact' })
    .eq('orders.user_id', user.id)
    .in('orders.status', ['delivered', 'completed', 'shipped']);

  if (search) {
    query = query.ilike('products.title', `%${search}%`);
  }

  const { data: orderItemsData, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + itemsPerPage - 1);

  if (error) {
    console.error("Lỗi khi lấy danh sách giao diện đã mua:", error);
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
    <div className="container mx-auto px-4 py-16 max-w-7xl font-manrope">
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <span className="text-[10px] font-black tracking-widest text-[#0051d5] uppercase block mb-3">
          TÀI SẢN KỸ THUẬT SỐ
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 font-bricolage tracking-tight mb-4">
          Kho Giao Diện
        </h1>
        <p className="text-slate-500 max-w-lg font-medium">
          Quản lý và tải xuống toàn bộ mã nguồn các mẫu template mà bạn đã sở hữu bản quyền hợp lệ.
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <ProfileOrderSearch currentSearch={search || ""} />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[32px] shadow-sm border border-slate-100 max-w-3xl mx-auto">
          <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h2 className="text-2xl font-extrabold text-slate-900 font-bricolage mb-3">Không tìm thấy giao diện</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto">
            {search ? `Không có mẫu template nào khớp với từ khóa "${search}".` : "Bạn chưa sở hữu bản quyền template nào. Hãy khám phá thư viện cao cấp của chúng tôi ngay hôm nay."}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-xl text-white bg-[#0051d5] hover:bg-[#0041ab] transition-all shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-wider"
          >
            Khám phá cửa hàng
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, idx) => {
            const product = Array.isArray(item.products) ? item.products[0] : item.products;
            if (!product) return null;
            return (
              <div
                key={idx}
                className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                <Link href={`/product/${item.product_id}`} className="relative aspect-[4/3] bg-slate-50 overflow-hidden block">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={product.image_url} 
                      alt={getLocalizedText(product.title as Record<string, string>, locale)} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Bản quyền
                    </span>
                  </div>
                </Link>
                
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <Link href={`/product/${item.product_id}`}>
                      <h3 className="font-extrabold text-slate-900 text-xl font-bricolage leading-snug mb-2 group-hover:text-[#0051d5] transition-colors line-clamp-2">
                        {getLocalizedText(product.title as Record<string, string>, locale)}
                      </h3>
                    </Link>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">
                      Đã mua: {new Date(item.order_created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 flex gap-3">
                    <a
                      href={product.source_code_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2.5 bg-[#0b1c30] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-900 transition-all active:scale-95 shadow-md shadow-slate-900/10"
                    >
                      <Download size={16} />
                      Tải source code
                    </a>
                    <Link
                      href={`/product/${item.product_id}`}
                      className="flex items-center justify-center w-[52px] h-[52px] bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all group-hover:bg-[#0051d5]/5 group-hover:text-[#0051d5]"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            )
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
