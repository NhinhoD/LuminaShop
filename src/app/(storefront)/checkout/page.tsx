"use client";

import { useCart } from "@/presentation/hooks/useCart";
import { createOrderAction } from "@/presentation/actions/order";
import { processPaymentAction } from "@/presentation/actions/payment";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/presentation/components/common/I18nContext";
import { getLocalizedText } from "@/presentation/utils/locale";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  ShoppingCart, 
  ShieldCheck, 
  Info,
  QrCode
} from "lucide-react";
import { toast } from "@/presentation/hooks/useToastStore";

export default function CheckoutPage() {
  const { dict, locale } = useI18n();
  const { items, subtotal, clearCart, isLoading: cartLoading } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactHandle: "",
    notes: "",
    paymentMethod: PaymentMethod.PAYOS
  });
  
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  // Dynamic validation schema using current locale
  const digitalCheckoutSchema = z.object({
    fullName: z.string().min(2, dict?.checkout?.validationNameMin || (locale === "vi" ? "Họ tên phải có ít nhất 2 ký tự" : "Full name must be at least 2 characters")),
    email: z.string().email(dict?.checkout?.validationEmailInvalid || (locale === "vi" ? "Địa chỉ email không hợp lệ để nhận mã nguồn" : "Invalid email address for delivery")),
    contactHandle: z.string().min(3, dict?.checkout?.validationContactMin || (locale === "vi" ? "Vui lòng cung cấp link Facebook hoặc số Zalo để nhận hỗ trợ kỹ thuật" : "Please provide a contact handle for support")),
    notes: z.string().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod)
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (validationErrors[e.target.name as keyof typeof formData]) {
      setValidationErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleNextToStep2 = () => setStep(2);
  
  const handleNextToStep3 = () => {
    const result = digitalCheckoutSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof typeof formData, string>> = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) errors[err.path[0] as keyof typeof formData] = err.message;
      });
      setValidationErrors(errors);
      toast.warning(
        locale === "vi" ? "Thông tin nhận bản quyền chưa đầy đủ" : "Incomplete Delivery Info",
        locale === "vi" ? "Vui lòng kiểm tra và điền đầy đủ các trường bắt buộc." : "Please fill in all required fields."
      );
      return;
    }
    setValidationErrors({});
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    if (loading || createdOrderId) return;

    setLoading(true);
    setError(null);
    toast.info(
      locale === "vi" ? "Đang tiến hành tạo đơn hàng..." : "Initiating order...",
      locale === "vi" ? "Đang kết nối cổng thanh toán an toàn." : "Connecting to secure payment gateway."
    );

    let currentOrderId: string | null = createdOrderId;

    try {
      if (!currentOrderId) {
        // Enforce strict quantity limit of exactly 1 for all items in order
        const mappedItems = items.map(item => ({
          ...item,
          title: getLocalizedText(item.title as unknown as Record<string, string>, locale) || "Product",
          quantity: 1
        }));

        const result = await createOrderAction({
          cartItems: mappedItems,
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.contactHandle,
            street: formData.email,
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
          toast.error(locale === "vi" ? "Đặt hàng thất bại" : "Order failed", result.error);
          return;
        } 

        if (result.data) {
          currentOrderId = result.data.id;
          setCreatedOrderId(currentOrderId);
          clearCart();
          toast.success(
            locale === "vi" ? "Đã tạo đơn hàng thành công!" : "Order created successfully!",
            locale === "vi" ? `Mã đơn: #${currentOrderId.slice(0, 8).toUpperCase()}` : `Order ID: #${currentOrderId.slice(0, 8).toUpperCase()}`
          );
        }
      }

      if (currentOrderId) {
        const paymentResult = await processPaymentAction(currentOrderId, subtotal, formData.paymentMethod);
        
        if (paymentResult.error) {
          toast.error(locale === "vi" ? "Lỗi xử lý thanh toán" : "Payment processing error", paymentResult.error);
          router.push(`/orders/${currentOrderId}/failed`);
        } else if (paymentResult.data?.checkoutUrl) {
          window.location.href = paymentResult.data.checkoutUrl;
        } else {
          router.push(`/orders/${currentOrderId}/success`);
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : (dict?.checkout?.paymentError || (locale === "vi" ? "Không thể thanh toán đơn hàng lúc này" : "Unable to process payment at this time"));
      setError(errMsg);
      toast.error(locale === "vi" ? "Đã có lỗi xảy ra" : "An error occurred", errMsg);
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
          <p className="text-slate-500 font-medium text-sm">
            {dict?.checkout?.loadingCart || (locale === "vi" ? "Đang tải giỏ hàng..." : "Loading cart details...")}
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 font-sans">
        <div className="max-w-md w-full text-center px-6 py-12 backdrop-blur-md bg-white/70 border border-slate-100 rounded-3xl shadow-xl">
          <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 mb-6" />
          <h2 className="text-xl font-bold text-slate-800 mb-2 font-sans">
            {dict?.checkout?.emptyCartTitle || (locale === "vi" ? "Giỏ hàng trống" : "Your cart is empty")}
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            {dict?.checkout?.emptyCartDesc || (locale === "vi" ? "Vui lòng thêm ít nhất một website template vào giỏ hàng trước khi tiến hành thanh toán." : "Please add at least one template to your cart before proceeding to checkout.")}
          </p>
          <button 
            onClick={() => router.push("/")}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md active:scale-98 transition-all cursor-pointer text-sm"
          >
            {dict?.checkout?.backToHome || (locale === "vi" ? "Quay lại trang chủ" : "Return to Homepage")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1100px] mx-auto">
        
        {/* Progress Steps Tracker */}
        <div className="relative mb-14 max-w-xl mx-auto px-4">
          <div className="absolute top-1/2 left-4 right-4 h-[3px] bg-slate-200 -translate-y-1/2 rounded-full -z-10" />
          <motion.div 
            className="absolute top-1/2 left-4 h-[3px] bg-[#0051d5] -translate-y-1/2 rounded-full -z-10" 
            animate={{ width: `${(step - 1) * 46.5}%` }}
            transition={{ type: "spring", stiffness: 150, damping: 22 }}
          />
          
          <div className="relative flex justify-between z-10">
            {[
              { id: 1 as const, label: dict?.checkout?.step1Title || (locale === "vi" ? "Mã nguồn" : "Source Code"), icon: ShoppingCart },
              { id: 2 as const, label: dict?.checkout?.step2Title || (locale === "vi" ? "Thông tin bàn giao số" : "Digital Delivery"), icon: User },
              { id: 3 as const, label: dict?.checkout?.step3Title || (locale === "vi" ? "Xác nhận" : "Confirmation"), icon: ShieldCheck }
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 font-sans">
            {step === 1 && (dict?.checkout?.pageHeading1 || (locale === "vi" ? "Xác nhận mã nguồn" : "Review Selected Codebases"))}
            {step === 2 && (dict?.checkout?.pageHeading2 || (locale === "vi" ? "Thông tin nhận mã nguồn" : "Digital Delivery Details"))}
            {step === 3 && (dict?.checkout?.pageHeading3 || (locale === "vi" ? "Xác nhận đơn hàng" : "Order Confirmation"))}
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            {step === 1 && (dict?.checkout?.pageDesc1 || (locale === "vi" ? "Kiểm tra kỹ lưỡng các gói website template trong giỏ hàng của bạn." : "Carefully inspect the website template packages in your cart before proceeding."))}
            {step === 2 && (dict?.checkout?.pageDesc2 || (locale === "vi" ? "Nhập Email để hệ thống gửi key bản quyền và link tải mã nguồn tự động." : "Enter your email address to automatically receive the license key and download link."))}
            {step === 3 && (dict?.checkout?.pageDesc3 || (locale === "vi" ? "Xem lại toàn bộ thông tin đơn hàng lần cuối trước khi tiến hành thanh toán." : "Review all order details one last time before initiating payment."))}
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
                    {dict?.checkout?.selectedItems || (locale === "vi" ? "Mã nguồn đã chọn" : "Selected Source Code")}
                  </h2>
                  <div className="divide-y divide-slate-100">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-5 py-5 first:pt-0 last:pb-0 group">
                        {item.imageUrl && (
                          <div className="w-20 h-16 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative flex-shrink-0">
                            <Image src={item.imageUrl} alt={getLocalizedText(item.title as unknown as Record<string, string>, locale) || "Product"} fill sizes="80px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-[15px] group-hover:text-[#0051d5] transition-colors">
                              {getLocalizedText(item.title as unknown as Record<string, string>, locale)}
                            </h3>
                            <div className="flex gap-1.5 mt-1.5">
                              <span className="text-[9px] text-[#0051d5] font-bold bg-blue-50 px-2 py-0.5 rounded">
                                {dict?.checkout?.lifetimeLicense || (locale === "vi" ? "Bản quyền trọn đời" : "Lifetime License")}
                              </span>
                              <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                                {dict?.checkout?.fixedQuantity || (locale === "vi" ? "Số lượng: 1 (Cố định)" : "Quantity: 1 (Fixed)")}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-end mt-2">
                            <p className="text-xs text-slate-400 font-semibold">
                              {dict?.checkout?.licenseType || (locale === "vi" ? "Giấy phép:" : "License Tier:")}{" "}
                              <span className="text-slate-800 font-bold">
                                {dict?.checkout?.licenseValue || "Single-Developer Commercial"}
                              </span>
                            </p>
                            <p className="font-black text-slate-950 text-base">{formatCurrency(item.price, locale)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sticky Order Summary Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm sticky top-24">
                    <h2 className="text-base font-bold text-slate-900 mb-6 font-sans">
                      {dict?.checkout?.summaryTitle || (locale === "vi" ? "Tóm tắt thanh toán" : "Payment Summary")}
                    </h2>
                    <div className="space-y-4 border-b border-slate-100 pb-6 mb-6">
                      <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>{dict?.checkout?.originalPrice || (locale === "vi" ? "Giá gốc" : "Subtotal")}</span>
                        <span className="text-slate-800 font-extrabold">{formatCurrency(subtotal, locale)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <span>{dict?.checkout?.digitalFee || (locale === "vi" ? "Phí bàn giao số" : "Digital Fulfillment")}</span>
                        <span className="text-emerald-600 font-extrabold">
                          {dict?.checkout?.freeDigitalFee || (locale === "vi" ? "Miễn phí" : "Free")}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-sm font-bold text-slate-800">
                        {dict?.checkout?.totalPayment || (locale === "vi" ? "Tổng thanh toán" : "Total Payment")}
                      </span>
                      <span className="text-2xl font-black text-[#0051d5] font-sans">{formatCurrency(subtotal, locale)}</span>
                    </div>
                    
                    <button 
                      onClick={handleNextToStep2}
                      className="w-full py-4 bg-[#0051d5] hover:bg-[#0041ac] active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 group transition-all duration-300 shadow-md shadow-blue-900/10 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      <span>{dict?.checkout?.continueToInfo || (locale === "vi" ? "Tiếp tục điền thông tin" : "Continue to Delivery Info")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CUSTOMER DIGITAL INFO */}
            {step === 2 && (
              <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 font-sans">
                    {dict?.checkout?.infoCardTitle || (locale === "vi" ? "Thông tin người nhận bàn giao số" : "Digital Delivery Recipient Information")}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    {dict?.checkout?.infoCardDesc || (locale === "vi" ? "Hệ thống sẽ gửi email chứa link tải mã nguồn và cấp license key đến địa chỉ này." : "Our automated pipeline will deliver the source code download link and activation key to this email.")}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {dict?.checkout?.fullNameLabel || (locale === "vi" ? "Họ và tên của bạn" : "Your Full Name")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder={dict?.checkout?.fullNamePlaceholder || (locale === "vi" ? "Ví dụ: Nguyễn Văn A" : "e.g. Jane Doe")}
                        className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0051d5] transition-all ${
                          validationErrors.fullName ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {validationErrors.fullName && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {dict?.checkout?.emailLabel || (locale === "vi" ? "Địa chỉ Email nhận mã nguồn" : "Email Address for Delivery")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={dict?.checkout?.emailPlaceholder || "jane.doe@example.com"}
                        className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0051d5] transition-all ${
                          validationErrors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.email}</p>
                    )}
                  </div>

                  {/* Contact Handle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {dict?.checkout?.contactHandleLabel || (locale === "vi" ? "Kênh liên hệ hỗ trợ (Zalo / Facebook / Telegram)" : "Support Contact Handle (Zalo / Telegram / Facebook)")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Send className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        name="contactHandle"
                        value={formData.contactHandle}
                        onChange={handleChange}
                        placeholder={dict?.checkout?.contactHandlePlaceholder || (locale === "vi" ? "Số Zalo hoặc link Facebook cá nhân" : "Phone number, Zalo or Telegram handle")}
                        className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0051d5] transition-all ${
                          validationErrors.contactHandle ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {validationErrors.contactHandle && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.contactHandle}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {dict?.checkout?.notesLabel || (locale === "vi" ? "Ghi chú thêm cho đơn hàng (không bắt buộc)" : "Order Notes / Requirements (Optional)")}
                    </label>
                    <textarea 
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder={dict?.checkout?.notesPlaceholder || (locale === "vi" ? "Yêu cầu xuất hóa đơn, hỗ trợ deploy hoặc câu hỏi khác..." : "Invoice requests, deployment questions, or custom notes...")}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0051d5] transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button 
                    onClick={() => setStep(1)}
                    className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{dict?.checkout?.backToCart || (locale === "vi" ? "Quay lại" : "Back")}</span>
                  </button>
                  <button 
                    onClick={handleNextToStep3}
                    className="w-2/3 py-4 bg-[#0051d5] hover:bg-[#0041ac] active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 group transition-all shadow-md shadow-blue-900/10 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    <span>{dict?.checkout?.continueToReview || (locale === "vi" ? "Tiếp tục xác nhận" : "Continue to Review")}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & PAYMENT */}
            {step === 3 && (
              <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-sans">
                    {dict?.checkout?.reviewOrderTitle || (locale === "vi" ? "Kiểm tra lại thông tin đơn hàng" : "Review Order & Complete Payment")}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    {locale === "vi" ? "Vui lòng chọn cổng thanh toán và xác nhận mua bản quyền mã nguồn." : "Please select payment method and confirm source code purchase."}
                  </p>
                </div>

                {/* Recipient Details Review Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {dict?.checkout?.recipientInfo || (locale === "vi" ? "Thông tin bàn giao" : "Delivery Recipient")}
                    </span>
                    <button 
                      onClick={() => setStep(2)}
                      className="text-xs text-[#0051d5] font-bold hover:underline cursor-pointer"
                    >
                      {dict?.common?.edit || (locale === "vi" ? "Sửa" : "Edit")}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">{dict?.checkout?.fullNameLabel || "Name"}:</span>
                      <span className="font-bold text-slate-800">{formData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{dict?.checkout?.emailLabel || "Email"}:</span>
                      <span className="font-bold text-slate-800">{formData.email}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Gateway Options */}
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    {dict?.checkout?.paymentMethodTitle || (locale === "vi" ? "Chọn phương thức thanh toán" : "Choose Payment Method")}
                  </span>
                  
                  {/* PayOS Option */}
                  <label 
                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      formData.paymentMethod === PaymentMethod.PAYOS 
                        ? 'border-[#0051d5] bg-blue-50/20 shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod"
                      value={PaymentMethod.PAYOS}
                      checked={formData.paymentMethod === PaymentMethod.PAYOS}
                      onChange={() => setFormData(prev => ({ ...prev, paymentMethod: PaymentMethod.PAYOS }))}
                      className="mt-1 text-[#0051d5] focus:ring-[#0051d5]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-[#0051d5]" />
                        <span className="font-bold text-sm text-slate-900">VietQR / PayOS (Khuyên dùng)</span>
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                          Tự động 24/7
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {dict?.checkout?.vietQrDesc || (locale === "vi" ? "Tạo mã QR động VietQR thanh toán tự động trong 5 giây qua ứng dụng ngân hàng" : "Dynamic VietQR automated code generation with 5-second bank verification")}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{dict?.checkout?.backToCart || (locale === "vi" ? "Quay lại" : "Back")}</span>
                  </button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-2/3 py-4 bg-[#0051d5] hover:bg-[#0041ac] active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/10 cursor-pointer text-xs uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{dict?.checkout?.processing || (locale === "vi" ? "Đang xử lý..." : "Processing...")}</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>{dict?.checkout?.placeOrderCTA || (locale === "vi" ? "Xác nhận & Thanh toán" : "Confirm & Pay Now")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}

