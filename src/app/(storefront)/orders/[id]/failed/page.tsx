import { getOrderAction } from "@/presentation/actions/order";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { XCircle } from "lucide-react";

export default async function OrderFailedPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const result = await getOrderAction(params.id);
  const order = result.data;

  if (!order) {
    redirect("/");
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
      <div className="flex justify-center mb-6">
        <XCircle className="w-24 h-24 text-error" />
      </div>
      
      <h1 className="text-display-sm font-bold mb-4">Thanh toán thất bại!</h1>
      <p className="text-on-surface-variant text-lg mb-8">
        Đã có lỗi xảy ra trong quá trình thanh toán đơn hàng <strong>#{order.id.split("-")[0].toUpperCase()}</strong>.
        Vui lòng thử lại.
      </p>

      <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-left mb-10 shadow-sm max-w-[500px] mx-auto">
        <h2 className="font-bold text-h4 mb-6 pb-4 border-b border-outline-variant">Tóm tắt đơn hàng</h2>
        
        <div className="space-y-4 mb-6">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex-1">
                <p className="font-bold">{item.productSnapshot?.title || item.productTitle || 'Sản phẩm'}</p>
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
            <span className="text-on-surface-variant">Tổng cộng:</span>
            <span className="font-bold text-primary text-xl">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          href={`/profile`} 
          className="px-8 py-4 bg-primary text-on-primary rounded-full font-bold hover:bg-inverse-surface transition-all"
        >
          Xem đơn hàng của bạn
        </Link>
        <Link 
          href="/" 
          className="px-8 py-4 bg-surface-container text-on-surface rounded-full font-bold hover:bg-outline-variant/20 transition-all"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
