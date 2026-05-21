"use client";

import { useCart } from "@/presentation/hooks/useCart";
import { createOrderAction } from "@/presentation/actions/order";
import { processPaymentAction } from "@/presentation/actions/payment";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { getProvincesAction, getDistrictsAction, getWardsAction } from "@/presentation/actions/location";
import { Province, District, Ward } from "@/domain/entities/Location";
import { 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  FileText, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  ShoppingCart, 
  ShieldCheck, 
  Info,
  ChevronRight
} from "lucide-react";

// Simplified Schema: visually removed 'district' from the user validation
const shippingSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"),
  street: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  city: z.string().min(2, "Tỉnh/Thành phố không được để trống"),
  ward: z.string().min(2, "Phường/Xã không được để trống"),
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
    city: "",
    ward: "",
    notes: "",
    paymentMethod: "cod"
  });
  
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({});

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedWardId, setSelectedWardId] = useState("");

  useEffect(() => {
    const fetchProvinces = async () => {
      const res = await getProvincesAction();
      if (res.data) {
        setProvinces(res.data);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    const selectedProv = provinces.find(p => p.id === provinceId);
    
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId("");
    setSelectedWardId("");
    setWards([]);
    
    setFormData(prev => ({
      ...prev,
      city: selectedProv ? selectedProv.name : "",
      ward: ""
    }));

    setValidationErrors(prev => ({
      ...prev,
      city: undefined,
      ward: undefined
    }));

    if (provinceId) {
      const res = await getDistrictsAction(provinceId);
      if (res.data) {
        // Auto-select the placeholder district and retrieve wards immediately behind the scenes
        if (res.data.length === 1) {
          const singleDistrict = res.data[0];
          setSelectedDistrictId(singleDistrict.id);
          
          const wardsRes = await getWardsAction(singleDistrict.id);
          if (wardsRes.data) {
            setWards(wardsRes.data);
          }
        }
      }
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardId = e.target.value;
    const selectedW = wards.find(w => w.id === wardId);
    
    setSelectedWardId(wardId);
    setFormData(prev => ({
      ...prev,
      ward: selectedW ? selectedW.name : ""
    }));
    
    setValidationErrors(prev => ({
      ...prev,
      ward: undefined
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

    // Hardcode "Khu vực trực thuộc" as the district value to maintain system integration requirements
    const result = await createOrderAction({
      cartItems: items,
      shippingAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        street: formData.street,
        district: "Khu vực trực thuộc",
        city: formData.city,
        ward: formData.ward
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
        <div className="max-w-md w-full text-center px-6 py-12 backdrop-blur-md bg-white/70 border border-outline-variant/30 rounded-3xl shadow-xl">
          <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 mb-6" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Giỏ hàng trống</h2>
          <p className="text-sm text-on-surface-variant mb-8">Vui lòng thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.</p>
          <button 
            onClick={() => router.push("/")}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold shadow-md active:scale-98 transition-all cursor-pointer"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-4 sm:px-6 lg:px-8 font-manrope">
      <div className="max-w-[1100px] mx-auto">
        
        {/* Premium Progress Steps Tracker */}
        <div className="relative mb-14 max-w-xl mx-auto px-4">
          <div className="absolute top-1/2 left-4 right-4 h-[3px] bg-slate-200 -translate-y-1/2 rounded-full -z-10" />
          <div 
            className="absolute top-1/2 left-4 h-[3px] bg-slate-900 -translate-y-1/2 rounded-full -z-10 transition-all duration-500 ease-in-out" 
            style={{ width: `${(step - 1) * 46.5}%` }}
          />
          
          <div className="relative flex justify-between z-10">
            {[
              { id: 1 as const, label: "Giỏ hàng", icon: ShoppingCart },
              { id: 2 as const, label: "Giao hàng", icon: Truck },
              { id: 3 as const, label: "Xác nhận", icon: ShieldCheck }
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step >= s.id;
              const isCurrent = step === s.id;
              
              return (
                <div key={s.id} className="flex flex-col items-center select-none">
                  <button
                    onClick={() => {
                      // Allow navigating back to completed steps
                      if (s.id < step) setStep(s.id);
                    }}
                    disabled={s.id >= step}
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 shadow-md cursor-pointer disabled:cursor-default
                      ${isCurrent 
                        ? 'bg-slate-900 border-slate-900 text-white scale-110 ring-4 ring-slate-900/10' 
                        : isActive 
                          ? 'bg-white border-slate-900 text-slate-900 hover:bg-slate-50' 
                          : 'bg-white border-slate-200 text-slate-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                  <span 
                    className={`
                      mt-3 text-[11px] font-bold tracking-wider uppercase transition-colors duration-300
                      ${isCurrent 
                        ? 'text-slate-900' 
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            {step === 1 && "Kiểm tra giỏ hàng"}
            {step === 2 && "Thông tin giao hàng"}
            {step === 3 && "Xác nhận đơn hàng"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {step === 1 && "Xác nhận số lượng và sản phẩm trước khi thanh toán"}
            {step === 2 && "Nhập địa chỉ giao hàng và phương thức thanh toán của bạn"}
            {step === 3 && "Xem lại toàn bộ thông tin đơn hàng lần cuối trước khi thanh toán"}
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
                <div className="lg:col-span-2 backdrop-blur-md bg-white/70 border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2.5">
                    <ShoppingCart className="w-5 h-5 text-slate-700" />
                    Sản phẩm trong giỏ hàng
                  </h2>
                  <div className="divide-y divide-slate-100">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-5 py-5 first:pt-0 last:pb-0 group">
                        {item.imageUrl && (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 bg-white relative flex-shrink-0">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-800 text-[15px] group-hover:text-slate-900 transition-colors">{item.title}</h3>
                            {item.variantName && (
                              <p className="text-[11px] text-slate-500 mt-1 font-semibold bg-slate-100 px-2 py-0.5 rounded-full w-max">
                                Phân loại: {item.variantName}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-between items-end mt-2">
                            <p className="text-xs text-slate-500 font-semibold">
                              Số lượng: <span className="text-slate-800 text-sm font-bold">{item.quantity}</span>
                            </p>
                            <p className="font-bold text-slate-900 text-base">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sticky Order Summary Card */}
                <div className="lg:col-span-1">
                  <div className="backdrop-blur-md bg-white/80 border border-outline-variant/30 rounded-3xl p-6 shadow-2xl shadow-slate-100/50 sticky top-24">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Tóm tắt thanh toán</h2>
                    <div className="space-y-4 border-b border-slate-100 pb-6 mb-6">
                      <div className="flex justify-between text-sm text-slate-500 font-semibold">
                        <span>Tạm tính</span>
                        <span className="text-slate-800 font-bold">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-500 font-semibold">
                        <span>Phí vận chuyển</span>
                        <span className="text-emerald-600 font-bold">Miễn phí</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-base font-bold text-slate-800">Tổng thanh toán</span>
                      <span className="text-2xl font-black text-slate-900">{formatCurrency(subtotal)}</span>
                    </div>
                    
                    <button 
                      onClick={handleNextToStep2}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-850 active:scale-98 text-white rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-slate-900/10 cursor-pointer text-sm"
                    >
                      <span>Tiếp tục thanh toán</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SHIPPING INFO */}
            {step === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Shipping Details & Address Card */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Recipient Card */}
                  <div className="backdrop-blur-md bg-white/70 border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2.5">
                      <User className="w-5 h-5 text-slate-700" />
                      Thông tin giao nhận
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Họ và tên *</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-800 transition-colors duration-200">
                            <User className="w-4.5 h-4.5" />
                          </span>
                          <input 
                            name="fullName" 
                            value={formData.fullName} 
                            onChange={handleChange} 
                            placeholder="Nhập đầy đủ họ và tên"
                            className={`w-full pl-11 pr-4 py-3 bg-white border ${validationErrors.fullName ? 'border-red-400 ring-2 ring-red-400/5' : 'border-slate-200 focus:border-slate-800'} rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-[14px] font-medium text-slate-800 placeholder-slate-400`} 
                          />
                        </div>
                        {validationErrors.fullName && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                            <Info className="w-3.5 h-3.5" /> {validationErrors.fullName}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Số điện thoại *</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-800 transition-colors duration-200">
                            <Phone className="w-4.5 h-4.5" />
                          </span>
                          <input 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            placeholder="Ví dụ: 0912345678"
                            className={`w-full pl-11 pr-4 py-3 bg-white border ${validationErrors.phone ? 'border-red-400 ring-2 ring-red-400/5' : 'border-slate-200 focus:border-slate-800'} rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-[14px] font-medium text-slate-800 placeholder-slate-400`} 
                          />
                        </div>
                        {validationErrors.phone && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                            <Info className="w-3.5 h-3.5" /> {validationErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Simplified 2-tier Dropdowns (Province and Ward) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Province Dropdown */}
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Tỉnh/Thành phố *</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-800 transition-colors duration-200">
                            <MapPin className="w-4.5 h-4.5" />
                          </span>
                          <select 
                            name="city" 
                            value={selectedProvinceId} 
                            onChange={handleProvinceChange} 
                            className={`w-full pl-11 pr-10 py-3 bg-white border ${validationErrors.city ? 'border-red-400 ring-2 ring-red-400/5' : 'border-slate-200 focus:border-slate-800'} rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-[14px] font-medium text-slate-800 placeholder-slate-400 appearance-none`}
                          >
                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                            {provinces.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          </span>
                        </div>
                        {validationErrors.city && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                            <Info className="w-3.5 h-3.5" /> {validationErrors.city}
                          </p>
                        )}
                      </div>
                      
                      {/* Ward Dropdown */}
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Phường/Xã *</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-800 transition-colors duration-200">
                            <MapPin className="w-4.5 h-4.5" />
                          </span>
                          <select 
                            name="ward" 
                            value={selectedWardId} 
                            disabled={!selectedDistrictId}
                            onChange={handleWardChange} 
                            className={`w-full pl-11 pr-10 py-3 bg-white border ${validationErrors.ward ? 'border-red-400 ring-2 ring-red-400/5' : 'border-slate-200 focus:border-slate-800'} rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-[14px] font-medium text-slate-800 placeholder-slate-400 appearance-none disabled:opacity-50 disabled:bg-slate-50`} 
                          >
                            <option value="">-- Chọn Phường/Xã --</option>
                            {wards.map(w => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                          <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          </span>
                        </div>
                        {validationErrors.ward && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                            <Info className="w-3.5 h-3.5" /> {validationErrors.ward}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Detailed Street Input */}
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">Địa chỉ cụ thể (Số nhà, tên đường) *</label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-800 transition-colors duration-200">
                          <MapPin className="w-4.5 h-4.5" />
                        </span>
                        <input 
                          name="street" 
                          value={formData.street} 
                          onChange={handleChange} 
                          placeholder="Ví dụ: 123 Đường Nguyễn Trãi"
                          className={`w-full pl-11 pr-4 py-3 bg-white border ${validationErrors.street ? 'border-red-400 ring-2 ring-red-400/5' : 'border-slate-200 focus:border-slate-800'} rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-[14px] font-medium text-slate-800 placeholder-slate-400`} 
                        />
                      </div>
                      {validationErrors.street && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                          <Info className="w-3.5 h-3.5" /> {validationErrors.street}
                        </p>
                      )}
                    </div>

                    {/* Order Notes */}
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">Ghi chú đơn hàng (Tùy chọn)</label>
                      <div className="relative group">
                        <span className="absolute top-3.5 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-800 transition-colors duration-200">
                          <FileText className="w-4.5 h-4.5" />
                        </span>
                        <textarea 
                          name="notes" 
                          value={formData.notes} 
                          onChange={handleChange} 
                          placeholder="Ghi chú thời gian giao hàng, hướng dẫn tìm nhà..."
                          rows={3} 
                          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-[14px] font-medium text-slate-800 placeholder-slate-400 resize-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector Card */}
                  <div className="backdrop-blur-md bg-white/70 border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
                      <CreditCard className="w-5 h-5 text-slate-700" />
                      Phương thức thanh toán
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4">
                      
                      {/* COD Panel */}
                      <label 
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                        className={`
                          relative flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 select-none
                          ${formData.paymentMethod === 'cod' 
                            ? 'border-slate-900 bg-slate-50/50 shadow-sm' 
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/30'
                          }
                        `}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === 'cod' ? 'border-slate-900' : 'border-slate-300'}`}>
                          {formData.paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-scale-up" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[14px]">Thanh toán khi nhận hàng (COD)</p>
                          <p className="text-xs text-slate-500 mt-1">Trả tiền mặt hoặc quét mã chuyển khoản trực tiếp cho shipper khi nhận hàng</p>
                        </div>
                        <Truck className={`w-6 h-6 ml-auto transition-colors duration-300 ${formData.paymentMethod === 'cod' ? 'text-slate-900' : 'text-slate-400'}`} />
                      </label>
                      
                      {/* VNPay Panel (Disabled) */}
                      <div className="relative flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 opacity-55 cursor-not-allowed select-none bg-slate-50/20">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center" />
                        <div>
                          <p className="font-bold text-slate-400 text-[14px] flex items-center gap-2">
                            VNPay
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Sắp ra mắt</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Thanh toán bảo mật qua cổng VNPay (hỗ trợ ATM nội địa, QR Code và thẻ tín dụng)</p>
                        </div>
                        <CreditCard className="w-6 h-6 ml-auto text-slate-300" />
                      </div>

                      {/* MoMo Panel (Disabled) */}
                      <div className="relative flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 opacity-55 cursor-not-allowed select-none bg-slate-50/20">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center" />
                        <div>
                          <p className="font-bold text-slate-400 text-[14px] flex items-center gap-2">
                            Ví điện tử MoMo
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Sắp ra mắt</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Thanh toán bảo mật và nhanh chóng qua ứng dụng Ví điện tử MoMo</p>
                        </div>
                        <CheckCircle2 className="w-6 h-6 ml-auto text-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column Sticky Summary Panel */}
                <div className="space-y-6">
                  <div className="backdrop-blur-md bg-white/80 border border-outline-variant/30 rounded-3xl p-6 shadow-2xl shadow-slate-100/50 sticky top-24">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Đơn hàng của bạn</h2>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm text-slate-500 font-semibold">
                        <span>Số lượng sản phẩm</span>
                        <span className="text-slate-800 font-bold">{items.length}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between font-bold text-base">
                        <span className="text-slate-800">Tổng cộng</span>
                        <span className="text-slate-900 text-lg">{formatCurrency(subtotal)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={handleNextToStep3}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-850 active:scale-98 text-white rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-slate-900/10 cursor-pointer text-sm"
                      >
                        <span>Tiếp tục xác nhận</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button 
                        onClick={() => setStep(1)}
                        className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-sm"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại giỏ hàng</span>
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
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Detailed Confirmation Summary Card */}
                  <div className="backdrop-blur-md bg-white/70 border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-slate-700" />
                      Xác nhận lại thông tin
                    </h2>
                    
                    {/* Information summary boxes */}
                    <div className="grid grid-cols-1 gap-5">
                      
                      {/* Recipient Details summary panel */}
                      <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-3">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Thông tin giao hàng
                        </h3>
                        <div>
                          <p className="font-bold text-slate-800 text-[15px]">{formData.fullName}</p>
                          <p className="text-sm font-semibold text-slate-600 mt-1">{formData.phone}</p>
                          <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                            {formData.street}, {formData.ward}, {formData.city}
                          </p>
                        </div>
                      </div>

                      {/* Payment method summary panel */}
                      <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" /> Phương thức thanh toán
                        </h3>
                        <p className="font-bold text-slate-800 text-[14px]">
                          {formData.paymentMethod === 'cod' && "Thanh toán khi nhận hàng (COD)"}
                          {formData.paymentMethod === 'vnpay' && "Cổng thanh toán VNPay"}
                          {formData.paymentMethod === 'momo' && "Ví điện tử MoMo"}
                        </p>
                      </div>

                      {/* Items details summary list */}
                      <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5" /> Danh sách sản phẩm ({items.length})
                        </h3>
                        <div className="divide-y divide-slate-100/60 max-h-[250px] overflow-y-auto pr-2 space-y-2">
                          {items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm py-2 first:pt-0 last:pb-0">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-700 text-[13.5px] max-w-[280px] md:max-w-[400px] truncate">{item.title}</span>
                                <span className="text-[11px] text-slate-400 font-bold mt-0.5">Số lượng: {item.quantity}</span>
                              </div>
                              <span className="font-bold text-slate-800 text-[14px]">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Optional Notes Box */}
                      {formData.notes && (
                        <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-2">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Ghi chú đơn hàng
                          </h3>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed italic">&ldquo;{formData.notes}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Place Order checkout sidebar */}
                <div className="space-y-6">
                  <div className="backdrop-blur-md bg-white/80 border border-outline-variant/30 rounded-3xl p-6 shadow-2xl shadow-slate-100/50 sticky top-24">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Chi phí thanh toán</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm text-slate-500 font-semibold">
                        <span>Tạm tính</span>
                        <span className="text-slate-800 font-bold">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-500 font-semibold">
                        <span>Phí giao hàng</span>
                        <span className="text-emerald-600 font-bold">Miễn phí</span>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between font-black text-base">
                        <span className="text-slate-850">Tổng tiền</span>
                        <span className="text-slate-950 text-xl font-extrabold">{formatCurrency(subtotal)}</span>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[13px] font-semibold mb-6 flex items-start gap-2.5">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-850 active:scale-98 text-white rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-slate-900/10 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Đang xử lý đặt hàng...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Xác nhận Đặt hàng</span>
                          </>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => setStep(2)}
                        disabled={loading}
                        className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-850 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-sm disabled:opacity-50"
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
