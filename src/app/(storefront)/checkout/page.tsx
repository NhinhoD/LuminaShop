"use client";

import { useCart } from "@/presentation/hooks/useCart";
import { createOrderAction } from "@/presentation/actions/order";
import { processPaymentAction } from "@/presentation/actions/payment";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentMethod } from "@/domain/entities/Order";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail,
  Send,
  CreditCard, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShoppingCart, 
  ShieldCheck, 
  Info,
  QrCode
} from "lucide-react";

// Digital-focused validation schema
const digitalCheckoutSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Địa chỉ email không hợp lệ để nhận source code"),
  contactHandle: z.string().min(3, "Vui lòng cung cấp link Facebook hoặc số Zalo để nhận hỗ trợ kỹ thuật"),
  notes: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod)
});

type CheckoutFormData = z.infer<typeof digitalCheckoutSchema>;

const shakeVariants = {
  shake: {
    x: [0, -6, 6, -6, 6, -3, 3, 0],
    transition: { duration: 0.4 }
  },
  default: { x: 0 }
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart, isLoading: cartLoading } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    contactHandle: "",
    notes: "",
    paymentMethod: PaymentMethod.COD
  });
  
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (validationErrors[e.target.name as keyof CheckoutFormData]) {
      setValidationErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleNextToStep2 = () => setStep(2);
  
  const handleNextToStep3 = () => {
    const result = digitalCheckoutSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof CheckoutFormData, string>> = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) errors[err.path[0] as keyof CheckoutFormData] = err.message;
      });
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    if (loading || createdOrderId) return;

    setLoading(true);
    setError(null);
    let currentOrderId: string | null = createdOrderId;

    try {
      if (!currentOrderId) {
        // Enforce strict quantity limit of exactly 1 for all items in order
        const mappedItems = items.map(item => ({
          ...item,
          quantity: 1 // Double-ensure digital quantity limit
        }));

        const result = await createOrderAction({
          cartItems: mappedItems,
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.contactHandle, // Map contact handle
            street: formData.email, // Map email to street
            district: "Digital Deliveries",
            city: "Bản quyền Digital",
            ward: "KhoUI.vn"
          },
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          contactEmail: formData.email,
          contactPhone: formData.contactHandle
        });
        
        if (result.error) {
          setError(result.error);
          return;
        } 

        if (result.data) {
          currentOrderId = result.data.id;
          setCreatedOrderId(currentOrderId);
          
          // Clear cart immediately upon successful order creation
          clearCart();
        }
      }

      if (currentOrderId) {
        // COD payment represents manual bank transfer; payment remains unpaid until approved
        const paymentResult = await processPaymentAction(currentOrderId, subtotal, formData.paymentMethod);
        
        if (paymentResult.error) {
          router.push(`/orders/${currentOrderId}/failed`);
        } else {
          router.push(`/orders/${currentOrderId}/success`);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể thanh toán đơn hàng lúc này");
      if (currentOrderId) {
        router.push(`/orders/${currentOrderId}/failed`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="max-w-md w-full text-center px-6 py-12 backdrop-blur-md bg-white/70 border border-slate-100 rounded-3xl shadow-xl">
          <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 mb-6" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Giỏ hàng trống</h2>
          <p className="text-sm text-slate-400 mb-8">Vui lòng thêm ít nhất một website template vào giỏ hàng trước khi tiến hành thanh toán.</p>
          <button 
            onClick={() => router.push("/")}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md active:scale-98 transition-all cursor-pointer text-sm"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 py-24 px-4 sm:px-6 lg:px-8 font-manrope">
      <div className="max-w-[1100px] mx-auto">
        
        {/* Premium Progress Steps Tracker */}
        <div className="relative mb-14 max-w-xl mx-auto px-4">
          <div className="absolute top-1/2 left-4 right-4 h-[3px] bg-slate-200 -translate-y-1/2 rounded-full -z-10" />
          <motion.div 
            className="absolute top-1/2 left-4 h-[3px] bg-[#0051d5] -translate-y-1/2 rounded-full -z-10" 
            animate={{ width: `${(step - 1) * 46.5}%` }}
            transition={{ type: "spring", stiffness: 150, damping: 22 }}
          />
          
          <div className="relative flex justify-between z-10">
            {[
              { id: 1 as const, label: "Mã nguồn", icon: ShoppingCart },
              { id: 2 as const, label: "Thông tin", icon: User },
              { id: 3 as const, label: "Xác nhận", icon: ShieldCheck }
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step >= s.id;
              const isCurrent = step === s.id;
              
              return (
                <div key={s.id} className="flex flex-col items-center select-none">
                  <button
                    onClick={() => {
                      if (s.id < step) setStep(s.id);
                    }}
                    disabled={s.id >= step}
                    className={`
                      relative flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 shadow-md cursor-pointer disabled:cursor-default overflow-hidden
                      ${isCurrent 
                        ? 'border-[#0051d5] text-white scale-110 ring-4 ring-blue-50' 
                        : isActive 
                          ? 'bg-white border-[#0051d5] text-[#0051d5] hover:bg-slate-50' 
                          : 'bg-white border-slate-200 text-slate-300'
                      }
                    `}
                  >
                    {isCurrent && (
                      <motion.div
                        layoutId="activeStepBg"
                        className="absolute inset-0 bg-[#0051d5] rounded-2xl -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" />
                  </button>
                  <span 
                    className={`
                      mt-3 text-[11px] font-bold tracking-wider uppercase transition-colors duration-300
                      ${isCurrent 
                        ? 'text-slate-900 font-extrabold' 
                        : isActive 
                          ? 'text-slate-800 font-semibold' 
                          : 'text-slate-300'
                      }
                    `}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 font-playfair">
            {step === 1 && "Xác nhận mã nguồn"}
            {step === 2 && "Thông tin bàn giao số"}
            {step === 3 && "Xác nhận đơn hàng"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            {step === 1 && "Kiểm tra kỹ lưỡng các gói website template trong giỏ hàng của bạn."}
            {step === 2 && "Nhập Email để hệ thống gửi key bản quyền và link tải mã nguồn tự động."}
            {step === 3 && "Xem lại toàn bộ thông tin đơn hàng lần cuối trước khi tiến hành thanh toán."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* STEP 1: CART SUMMARY */}
            {step === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Cart Items List Card */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                    <ShoppingCart className="w-5 h-5 text-[#0051d5]" />
                    Mã nguồn đã chọn
                  </h2>
                  <div className="divide-y divide-slate-100">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-5 py-5 first:pt-0 last:pb-0 group">
                        {item.imageUrl && (
                          <div className="w-20 h-16 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative flex-shrink-0">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-[15px] group-hover:text-[#0051d5] transition-colors">{item.title}</h3>
                            <div className="flex gap-1.5 mt-1.5">
                              <span className="text-[9px] text-[#0051d5] font-bold bg-blue-50 px-2 py-0.5 rounded">
                                Bản quyền trọn đời
                              </span>
                              <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                                Số lượng: 1 (Cố định)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-end mt-2">
                            <p className="text-xs text-slate-400 font-semibold">
                              Giấy phép: <span className="text-slate-800 font-bold">Single-Developer</span>
                            </p>
                            <p className="font-black text-slate-950 text-base">{formatCurrency(item.price)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sticky Order Summary Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm sticky top-24">
                    <h2 className="text-base font-bold text-slate-900 mb-6">Tóm tắt thanh toán</h2>
                    <div className="space-y-4 border-b border-slate-100 pb-6 mb-6">
                      <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>Giá gốc</span>
                        <span className="text-slate-800 font-extrabold">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>Phí bàn giao số</span>
                        <span className="text-emerald-600 font-extrabold">Miễn phí</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-sm font-bold text-slate-800">Tổng thanh toán</span>
                      <span className="text-2xl font-black text-[#0051d5] font-playfair">{formatCurrency(subtotal)}</span>
                    </div>
                    
                    <button 
                      onClick={handleNextToStep2}
                      className="w-full py-4 bg-[#0051d5] hover:bg-[#0041ac] active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 group transition-all duration-300 shadow-md shadow-blue-900/10 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      <span>Tiếp tục điền thông tin</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CUSTOMER DIGITAL INFO */}
            {step === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Digital Delivery Address details */}
                <div className="lg:col-span-2 space-y-6 animate-fade-in">
                  
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2.5">
                      <User className="w-5 h-5 text-[#0051d5]" />
                      Thông tin bàn giao & Hỗ trợ kỹ thuật
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <motion.div 
                        animate={validationErrors.fullName ? "shake" : "default"} 
                        variants={shakeVariants} 
                        className="space-y-2"
                      >
                        <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Họ và tên *</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0051d5] transition-colors duration-200">
                            <User className="w-4 h-4" />
                          </span>
                          <input 
                            name="fullName" 
                            value={formData.fullName} 
                            onChange={handleChange} 
                            placeholder="Ví dụ: Nguyễn Văn A"
                            className={`w-full pl-11 pr-4 py-3 bg-white border ${validationErrors.fullName ? 'border-red-400 ring-2 ring-red-400/5' : 'border-slate-200 focus:border-[#0051d5]'} rounded-xl outline-none transition-all duration-300 text-[13px] font-medium text-slate-800 placeholder-slate-400`} 
                          />
                        </div>
                        {validationErrors.fullName && (
                          <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                            <Info className="w-3.5 h-3.5" /> {validationErrors.fullName}
                          </p>
                        )}
                      </motion.div>
                      
                      {/* Email (Critical for delivery) */}
                      <motion.div 
                        animate={validationErrors.email ? "shake" : "default"} 
                        variants={shakeVariants} 
                        className="space-y-2"
                      >
                        <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Email nhận Source Code *</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0051d5] transition-colors duration-200">
                            <Mail className="w-4 h-4" />
                          </span>
                          <input 
                            name="email" 
                            type="email"
                            value={formData.email} 
                            onChange={handleChange} 
                            placeholder="email@example.com"
                            className={`w-full pl-11 pr-4 py-3 bg-white border ${validationErrors.email ? 'border-red-400 ring-2 ring-red-400/5' : 'border-slate-200 focus:border-[#0051d5]'} rounded-xl outline-none transition-all duration-300 text-[13px] font-medium text-slate-800 placeholder-slate-400`} 
                          />
                        </div>
                        {validationErrors.email && (
                          <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                            <Info className="w-3.5 h-3.5" /> {validationErrors.email}
                          </p>
                        )}
                      </motion.div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-5">
                      {/* Contact Social Handle */}
                      <motion.div 
                        animate={validationErrors.contactHandle ? "shake" : "default"} 
                        variants={shakeVariants} 
                        className="space-y-2"
                      >
                        <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Link Facebook hoặc Số điện thoại Zalo liên hệ *</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0051d5] transition-colors duration-200">
                            <Send className="w-4 h-4" />
                          </span>
                          <input 
                            name="contactHandle" 
                            value={formData.contactHandle} 
                            onChange={handleChange} 
                            placeholder="Ví dụ: fb.com/profile hoặc Zalo: 0912..."
                            className={`w-full pl-11 pr-4 py-3 bg-white border ${validationErrors.contactHandle ? 'border-red-400 ring-2 ring-red-400/5' : 'border-slate-200 focus:border-[#0051d5]'} rounded-xl outline-none transition-all duration-300 text-[13px] font-medium text-slate-800 placeholder-slate-400`} 
                          />
                        </div>
                        {validationErrors.contactHandle && (
                          <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                            <Info className="w-3.5 h-3.5" /> {validationErrors.contactHandle}
                          </p>
                        )}
                        <p className="text-slate-400 text-[10px] italic">Thông tin liên hệ này giúp bộ phận kỹ thuật chủ động hỗ trợ cấu hình code, bàn giao tài liệu hoặc fix lỗi nếu có.</p>
                      </motion.div>
                    </div>

                    {/* Order Notes */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Yêu cầu đặc biệt về cấu hình (Tùy chọn)</label>
                      <div className="relative group">
                        <textarea 
                          name="notes" 
                          value={formData.notes} 
                          onChange={handleChange} 
                          placeholder="Ví dụ: Cần tích hợp thêm thư viện Tailwind UI, deploy hộ lên Vercel..."
                          rows={3} 
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#0051d5] rounded-xl outline-none transition-all duration-300 text-[13px] font-medium text-slate-800 placeholder-slate-400 resize-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector Card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                      <CreditCard className="w-5 h-5 text-[#0051d5]" />
                      Phương thức thanh toán
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {/* Bank Transfer Panel */}
                      <label 
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: PaymentMethod.COD }))}
                        className={`
                          relative flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 select-none
                          ${formData.paymentMethod === PaymentMethod.COD 
                            ? 'border-[#0051d5] bg-blue-50/10 shadow-sm' 
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/20'
                          }
                        `}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${formData.paymentMethod === PaymentMethod.COD ? 'border-[#0051d5]' : 'border-slate-300'}`}>
                          {formData.paymentMethod === PaymentMethod.COD && <div className="w-2.5 h-2.5 rounded-full bg-[#0051d5] animate-scale-up" />}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-[13.5px] flex items-center gap-2">
                            Chuyển khoản Ngân hàng Thủ công (VietQR)
                            <span className="text-[8px] bg-blue-50 text-[#0051d5] px-2 py-0.5 rounded font-black tracking-wide">Khuyên dùng</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Hệ thống sẽ hiển thị mã VietQR chuyển khoản ngân hàng ở bước tiếp theo. Bản quyền được kích hoạt ngay sau khi admin duyệt giao dịch.</p>
                        </div>
                        <QrCode className={`w-6 h-6 ml-auto transition-colors duration-300 ${formData.paymentMethod === PaymentMethod.COD ? 'text-[#0051d5]' : 'text-slate-400'}`} />
                      </label>
                      
                      {/* VNPay Panel (Disabled) */}
                      <div className="relative flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 opacity-55 cursor-not-allowed select-none bg-slate-50/10">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center" />
                        <div>
                          <p className="font-bold text-slate-400 text-[13.5px] flex items-center gap-2">
                            Thẻ nội địa & Quốc tế (VNPay)
                            <span className="text-[8px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-black tracking-widest">SOON</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Cổng thanh toán tự động qua VNPay (Hỗ trợ quét ứng dụng ngân hàng, Visa, Mastercard)</p>
                        </div>
                        <CreditCard className="w-6 h-6 ml-auto text-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column Sticky Summary Panel */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm sticky top-24">
                    <h2 className="text-base font-bold text-slate-900 mb-6">Đơn hàng của bạn</h2>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>Số lượng sản phẩm</span>
                        <span className="text-slate-800 font-extrabold">{items.length}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between font-extrabold text-sm">
                        <span className="text-slate-800">Tổng cộng</span>
                        <span className="text-[#0051d5] text-lg font-playfair font-black">{formatCurrency(subtotal)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={handleNextToStep3}
                        className="w-full py-4 bg-[#0051d5] hover:bg-[#0041ac] active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 group transition-all duration-300 shadow-md shadow-blue-900/10 cursor-pointer text-xs uppercase tracking-wider"
                      >
                        <span>Tiếp tục xác nhận</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button 
                        onClick={() => setStep(1)}
                        className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 active:scale-98 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-xs"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại bước trước</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRM */}
            {step === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Confirmation Review panels */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Detailed Confirmation Summary Card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-[#0051d5]" />
                      Xác nhận lại thông tin bàn giao
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-5">
                      
                      {/* Recipient Details summary panel */}
                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Thông tin nhận Source Code
                        </h3>
                        <div>
                          <p className="font-extrabold text-slate-900 text-[14.5px]">{formData.fullName}</p>
                          <p className="text-xs font-bold text-[#0051d5] mt-1">Email: {formData.email}</p>
                          <p className="text-xs text-slate-500 font-semibold mt-1">
                            Kênh hỗ trợ kỹ thuật: {formData.contactHandle}
                          </p>
                        </div>
                      </div>

                      {/* Payment method summary panel */}
                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" /> Phương thức thanh toán
                        </h3>
                        <p className="font-bold text-slate-800 text-[13px]">
                          Chuyển khoản Ngân hàng VietQR (Xác minh thủ công)
                        </p>
                      </div>

                      {/* Items details summary list */}
                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5" /> Bản quyền template ({items.length})
                        </h3>
                        <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto pr-2 space-y-2">
                          {items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-xs py-2 first:pt-0 last:pb-0">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-[13px] max-w-[280px] md:max-w-[400px] truncate">{item.title}</span>
                                <span className="text-[9px] text-[#0051d5] font-black mt-0.5">GIẤY PHÉP TRỌN ĐỜI</span>
                              </div>
                              <span className="font-extrabold text-slate-900 text-[13px]">{formatCurrency(item.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Optional Notes Box */}
                      {formData.notes && (
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" /> Yêu cầu đặc biệt
                          </h3>
                          <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">&ldquo;{formData.notes}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Place Order checkout sidebar */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm sticky top-24">
                    <h2 className="text-base font-bold text-slate-900 mb-6">Chi phí thanh toán</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>Giá gốc</span>
                        <span className="text-slate-800 font-extrabold">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>Phí bàn giao</span>
                        <span className="text-emerald-600 font-extrabold">Miễn phí</span>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between font-extrabold text-sm">
                        <span className="text-slate-850">Tổng thanh toán</span>
                        <span className="text-[#0051d5] text-lg font-playfair font-black">{formatCurrency(subtotal)}</span>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[12px] font-semibold mb-6 flex items-start gap-2.5">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="w-full py-4 bg-[#0051d5] hover:bg-[#0041ac] active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 group transition-all duration-300 shadow-md shadow-blue-900/10 cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Đang kích hoạt mã nguồn...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Xác nhận & Mua Ngay</span>
                          </>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => setStep(2)}
                        disabled={loading}
                        className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 active:scale-98 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-xs disabled:opacity-50"
                      >
                        <span>Chỉnh sửa thông tin</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
