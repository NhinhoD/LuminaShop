"use client";

import { useCart } from "@/presentation/hooks/useCart";
import { createOrderAction } from "@/presentation/actions/order";
import { processPaymentAction } from "@/presentation/actions/payment";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

const shippingSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"),
  street: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  district: z.string().min(2, "Quận/Huyện không được để trống"),
  city: z.string().min(2, "Tỉnh/Thành phố không được để trống"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["cod", "vnpay", "momo"])
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export default function CheckoutPage() {
  const { items, subtotal, clearCart, isLoading: cartLoading } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: "",
    phone: "",
    street: "",
    district: "",
    city: "",
    notes: "",
    paymentMethod: "cod"
  });
  
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error for this field
    if (validationErrors[e.target.name as keyof ShippingFormData]) {
      setValidationErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleNextToStep2 = () => setStep(2);
  
  const handleNextToStep3 = () => {
    const result = shippingSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof ShippingFormData, string>> = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) errors[err.path[0] as keyof ShippingFormData] = err.message;
      });
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    const result = await createOrderAction({
      cartItems: items,
      shippingAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        street: formData.street,
        district: formData.district,
        city: formData.city
      },
      paymentMethod: formData.paymentMethod,
      notes: formData.notes
    });
    
    if (result.error) {
      setLoading(false);
      setError(result.error);
      return;
    } 

    if (result.data) {
      const paymentResult = await processPaymentAction(result.data.id, subtotal, formData.paymentMethod);
      
      setLoading(false);
      clearCart();
      
      if (paymentResult.error) {
        router.push(`/orders/${result.data.id}/failed`);
      } else {
        router.push(`/orders/${result.data.id}/success`);
      }
    }
  };

  if (cartLoading) return <div className="p-20 text-center">Đang tải...</div>;
  if (items.length === 0 && step === 1) return <div className="p-20 text-center text-on-surface-variant">Giỏ hàng của bạn đang trống.</div>;

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-12">
        {[1, 2, 3].map((s, idx) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= s ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
              {s}
            </div>
            {idx < 2 && (
              <div className={`h-1 w-16 mx-2 rounded-full ${step > s ? 'bg-primary' : 'bg-surface-container'}`} />
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center mb-10">
        <h1 className="text-display-sm font-bold">
          {step === 1 && "Giỏ hàng"}
          {step === 2 && "Thông tin giao hàng"}
          {step === 3 && "Xác nhận đơn hàng"}
        </h1>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* STEP 1: CART SUMMARY */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20">
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-4 border-b border-outline-variant/30 last:border-0">
                      <div className="flex items-center gap-4">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                        )}
                        <div>
                          <p className="font-bold">{item.title}</p>
                          <p className="text-sm text-on-surface-variant">Số lượng: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-6 mt-6 border-t border-outline-variant flex justify-between items-center text-xl font-bold">
                  <span>Tổng tạm tính</span>
                  <span className="text-primary">{formatCurrency(subtotal)}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleNextToStep2}
                  className="px-8 py-4 bg-primary text-on-primary rounded-full font-bold hover:bg-inverse-surface transition-all"
                >
                  Tiếp tục thanh toán
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SHIPPING INFO */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20 space-y-6">
                  <h2 className="text-h3 font-bold">Thông tin người nhận</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Họ tên *</label>
                      <input 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 rounded-xl border ${validationErrors.fullName ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`} 
                      />
                      {validationErrors.fullName && <p className="text-error text-xs">{validationErrors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Số điện thoại *</label>
                      <input 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 rounded-xl border ${validationErrors.phone ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`} 
                      />
                      {validationErrors.phone && <p className="text-error text-xs">{validationErrors.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tỉnh/Thành phố *</label>
                      <input 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 rounded-xl border ${validationErrors.city ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`} 
                      />
                      {validationErrors.city && <p className="text-error text-xs">{validationErrors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quận/Huyện *</label>
                      <input 
                        name="district" 
                        value={formData.district} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 rounded-xl border ${validationErrors.district ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`} 
                      />
                      {validationErrors.district && <p className="text-error text-xs">{validationErrors.district}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Địa chỉ cụ thể (Số nhà, đường) *</label>
                    <input 
                      name="street" 
                      value={formData.street} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-3 rounded-xl border ${validationErrors.street ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`} 
                    />
                    {validationErrors.street && <p className="text-error text-xs">{validationErrors.street}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ghi chú đơn hàng</label>
                    <textarea 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleChange} 
                      rows={3} 
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20 space-y-6">
                  <h2 className="text-h3 font-bold">Phương thức thanh toán</h2>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-container'}`}>
                      <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-bold">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-sm text-on-surface-variant">Trả tiền mặt khi giao hàng</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant cursor-not-allowed opacity-50 transition-all">
                      <input disabled type="radio" name="paymentMethod" value="vnpay" className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-bold">VNPay (Sắp ra mắt)</p>
                        <p className="text-sm text-on-surface-variant">Thanh toán qua ví VNPay hoặc thẻ ngân hàng</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant cursor-not-allowed opacity-50 transition-all">
                      <input disabled type="radio" name="paymentMethod" value="momo" className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-bold">MoMo (Sắp ra mắt)</p>
                        <p className="text-sm text-on-surface-variant">Thanh toán qua ví điện tử MoMo</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-surface-container-low p-6 rounded-2xl shadow-sm border border-outline-variant/20 sticky top-24">
                  <h2 className="text-h3 font-bold mb-6">Đơn hàng</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Tổng sản phẩm</span>
                      <span>{items.length}</span>
                    </div>
                    <div className="pt-4 border-t border-outline-variant flex justify-between font-bold text-lg">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleNextToStep3}
                      className="w-full py-4 bg-primary text-on-primary rounded-full font-bold hover:bg-inverse-surface transition-all"
                    >
                      Tiếp tục
                    </button>
                    <button 
                      onClick={() => setStep(1)}
                      className="w-full py-4 bg-surface-container text-on-surface rounded-full font-bold hover:bg-outline-variant/20 transition-all"
                    >
                      Quay lại giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/20 space-y-6">
                  <h2 className="text-h3 font-bold">Xác nhận thông tin</h2>
                  
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <h3 className="font-bold mb-2">Thông tin người nhận</h3>
                    <p className="text-sm">{formData.fullName} - {formData.phone}</p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {formData.street}, {formData.district}, {formData.city}
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <h3 className="font-bold mb-2">Phương thức thanh toán</h3>
                    <p className="text-sm uppercase">{formData.paymentMethod}</p>
                  </div>

                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <h3 className="font-bold mb-4">Sản phẩm ({items.length})</h3>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-on-surface-variant">{item.title} x {item.quantity}</span>
                          <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-surface-container-low p-6 rounded-2xl shadow-sm border border-outline-variant/20 sticky top-24">
                  <h2 className="text-h3 font-bold mb-6">Thanh toán</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Tạm tính</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Phí vận chuyển</span>
                      <span>Miễn phí</span>
                    </div>
                    <div className="pt-4 border-t border-outline-variant flex justify-between font-bold text-xl">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-error/10 text-error rounded-xl text-sm mb-6">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="w-full py-4 bg-primary text-on-primary rounded-full font-bold hover:bg-inverse-surface transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                          <span>Đang xử lý...</span>
                        </>
                      ) : "Xác nhận Đặt hàng"}
                    </button>
                    <button 
                      onClick={() => setStep(2)}
                      disabled={loading}
                      className="w-full py-4 bg-surface-container text-on-surface rounded-full font-bold hover:bg-outline-variant/20 transition-all disabled:opacity-50"
                    >
                      Sửa thông tin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
