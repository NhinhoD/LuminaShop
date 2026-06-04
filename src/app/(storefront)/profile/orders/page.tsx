import Link from "next/link";
import { Download, Package, ShoppingBag } from "lucide-react";
import { Metadata } from "next";
import { createClient } from "@/infrastructure/supabase/server";

export const metadata: Metadata = {
  title: "Kho giao diện đã mua | LuminaShop",
  description: "Quản lý và tải xuống các giao diện bạn đã thanh toán",
};

export default async function OrderHistoryPage() {
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

  const { data: purchasedOrders, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      created_at,
      order_items (
        id,
        product_id,
        price_at_purchase,
        products (*)
      )
    `)
    .eq('user_id', user.id)
    .in('status', ['delivered', 'completed', 'shipped'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Lỗi khi lấy danh sách giao diện đã mua:", error);
  }

  const items = (purchasedOrders || []).flatMap(order => 
    (order.order_items || []).map((item: unknown) => {
      const typedItem = item as { id: string; product_id: string; price_at_purchase: number; products: unknown };
      return {
        ...typedItem,
        order_id: order.id,
        order_created_at: order.created_at
      };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl font-manrope">
      <div className="flex items-center gap-2 mb-8">
        <Package className="w-6 h-6 text-[#0051d5]" />
        <h1 className="text-2xl font-bold font-playfair">Kho Giao Diện Của Tôi</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
          <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-slate-900 mb-2">Bạn chưa mua giao diện nào</h2>
          <p className="text-slate-500 mb-8">Hãy khám phá các mẫu template cao cấp của chúng tôi!</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-[#0051d5] hover:bg-[#0041ab] transition-colors shadow-lg shadow-blue-900/20"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, idx) => {
            const product = Array.isArray(item.products) ? item.products[0] : item.products;
            if (!product) return null;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300 m-auto mt-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{product.title}</h3>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      Giá mua: {item.price_at_purchase === 0 ? "MIỄN PHÍ" : `${item.price_at_purchase.toLocaleString('vi-VN')} ₫`}
                    </p>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-50 flex gap-3">
                  <a
                    href={product.source_code_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0051d5] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#0041ab] transition-colors shadow-md shadow-blue-900/20"
                  >
                    <Download size={16} />
                    Tải mã nguồn
                  </a>
                  <Link
                    href={`/product/${item.product_id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
