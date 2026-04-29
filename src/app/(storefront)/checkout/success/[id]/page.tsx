import Link from "next/link";
import { getOrderAction } from "@/presentation/actions/order";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderAction(id);

  if (!result.data) {
    notFound();
  }

  const order = result.data;

  return (
    <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
      <div className="w-20 h-20 bg-tertiary-fixed-dim/20 text-tertiary rounded-full flex items-center justify-center mx-auto mb-8">
        <span className="material-symbols-outlined text-4xl">check_circle</span>
      </div>
      
      <h1 className="text-display-sm font-bold mb-2">Đặt hàng thành công!</h1>
      <p className="text-on-surface-variant mb-12">
        Cảm ơn bạn đã mua sắm tại LuminaShop. Mã đơn hàng của bạn là <span className="font-mono font-bold text-on-surface">#{order.id.slice(0, 8).toUpperCase()}</span>.
      </p>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-left mb-12">
        <h2 className="text-h3 mb-6 pb-4 border-b border-outline-variant/30">Chi tiết đơn hàng</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-outline mb-2">Thông tin nhận hàng</p>
            <p className="text-sm">{order.shippingAddress}</p>
            <p className="text-sm mt-1">{order.contactPhone}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-outline mb-2">Phương thức thanh toán</p>
            <p className="text-sm">{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</p>
            <p className="text-sm mt-1 text-on-surface-variant">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.productTitle} x {item.quantity}</span>
              <span className="font-medium">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
            </div>
          ))}
          <div className="pt-4 border-t border-outline-variant flex justify-between font-bold text-lg">
            <span>Tổng số tiền</span>
            <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          href="/profile" 
          className="px-8 py-3 bg-surface-container-high text-on-surface rounded-full font-bold hover:bg-surface-container-highest transition-all"
        >
          Xem đơn hàng của tôi
        </Link>
        <Link 
          href="/" 
          className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-inverse-surface transition-all"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
