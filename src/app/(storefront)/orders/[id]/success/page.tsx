import { getOrderAction } from "@/presentation/actions/order";
import { OrderItem } from "@/domain/entities/Order";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getLocale } from "@/i18n/getDictionary";
import { getLocalizedText } from "@/presentation/utils/locale";

export default async function OrderSuccessPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const result = await getOrderAction(params.id);
  const order = result.data;
  const locale = await getLocale();

  if (!order) {
    redirect("/");
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle2 className="w-24 h-24 text-primary" />
      </div>
      
      <h1 className="text-display-sm font-bold mb-4">Đặt hàng thành công!</h1>
      <p className="text-on-surface-variant text-lg mb-8">
        Cảm ơn bạn đã mua sắm tại KhoUI. Mã đơn hàng của bạn là <strong>#{order.id.split("-")[0].toUpperCase()}</strong>
      </p>

      <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-left mb-10 shadow-sm max-w-[500px] mx-auto">
        <h2 className="font-bold text-h4 mb-6 pb-4 border-b border-outline-variant">Tóm tắt đơn hàng</h2>
        
        <div className="space-y-4 mb-6">
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex-1">
                <p className="font-bold">{getLocalizedText(item.productSnapshot?.title as unknown as Record<string, string>, locale) || getLocalizedText(item.productTitle as unknown as Record<string, string>, locale) || 'Sản phẩm'}</p>
                <p className="text-on-surface-variant">Số lượng: {item.quantity}</p>
              </div>
              <span className="font-medium">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-outline-variant space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Phương thức thanh toán:</span>
            <span className="font-bold uppercase">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Tình trạng kích hoạt:</span>
            <span className="font-medium text-right text-success">Tự động sau khi thanh toán</span>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-outline-variant flex justify-between font-bold text-xl">
          <span>Tổng cộng</span>
          <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          href="/profile" 
          className="px-8 py-4 bg-surface-container text-on-surface rounded-full font-bold hover:bg-outline-variant/20 transition-all"
        >
          Xem đơn hàng
        </Link>
        <Link 
          href="/" 
          className="px-8 py-4 bg-primary text-on-primary rounded-full font-bold hover:bg-inverse-surface transition-all"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
