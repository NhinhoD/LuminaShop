"use client";

import { useCart } from "@/presentation/components/common/CartContext";
import { placeOrderAction } from "@/presentation/actions/order";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, subtotal, clearCart, loading: cartLoading } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    shippingAddress: "",
    contactPhone: "",
    paymentMethod: "COD"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await placeOrderAction(formData);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      clearCart();
      router.push(`/checkout/success/${result.data.id}`);
    }
  };

  if (cartLoading) return <div className="p-20 text-center">Đang tải...</div>;
  if (items.length === 0) return <div className="p-20 text-center">Giỏ hàng của bạn đang trống.</div>;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <h1 className="text-display-sm font-bold mb-8">Thanh toán</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
            <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30">
              <h2 className="text-h3 mb-4">Thông tin giao hàng</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <input
                    required
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg"
                    placeholder="09xx xxx xxx"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Địa chỉ giao hàng</label>
                  <textarea
                    required
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg"
                    rows={3}
                    placeholder="Số nhà, tên đường, phường/xã..."
                  />
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30">
              <h2 className="text-h3 mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary"
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-outline-variant rounded-lg opacity-50 cursor-not-allowed">
                  <input disabled type="radio" name="paymentMethod" value="VNPAY" className="w-4 h-4" />
                  <span>VNPay (Sắp ra mắt)</span>
                </label>
              </div>
            </section>
          </form>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 sticky top-24">
            <h2 className="text-h3 mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">{item.title} x {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-outline-variant flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            {error && <p className="text-error text-sm mb-4">{error}</p>}

            <button
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-on-primary rounded-full font-bold hover:bg-inverse-surface transition-all disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
            </button>
            <p className="text-[10px] text-center text-on-surface-variant mt-4">
              Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
