"use client";

import { useCart } from "@/client/hooks/useCart";
import { createOrderAction, getCustomerCheckoutInfoAction } from "@/server/presentation/actions/order";
import { processPaymentAction } from "@/server/presentation/actions/payment";
import { formatCurrency } from "@/shared/utils";
import { useI18n } from "@/client/components/common/I18nContext";
import { getLocalizedText } from "@/shared/utils/locale";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PaymentMethod } from "@/shared/types/order";
import { createDigitalCheckoutSchema } from "@/shared/validations/checkout";
import gsap from "gsap";
import {
  User,
  Mail,
  Send,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Info,
  QrCode,
  Sparkles,
} from "lucide-react";
import { toast } from "@/client/hooks/useToastStore";

export interface CustomerCheckoutInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface CheckoutClientProps {
  initialCustomerInfo?: CustomerCheckoutInfo | null;
}

/**
 * Interactive Client Component for the 3-step checkout experience.
 * Manages customer form inputs, step transitions, order submission,
 * and integration with PayOS / COD payment methods following safe checkout transaction rules.
 *
 * Presented as a Spec Sheet flow: a numbered process rail, hairline panels and
 * mono metadata. All order/payment logic is unchanged.
 *
 * @param props - Component props containing initial customer info from server pre-fill.
 * @returns JSX Element for the checkout flow.
 */
export default function CheckoutClient({ initialCustomerInfo }: CheckoutClientProps): React.JSX.Element {
  const { dict, locale } = useI18n();
  const { items, subtotal, clearCart, isLoading: cartLoading } = useCart();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: initialCustomerInfo?.fullName || "",
    email: initialCustomerInfo?.email || "",
    contactHandle: initialCustomerInfo?.phone || "",
    notes: "",
    paymentMethod: PaymentMethod.PAYOS
  });

  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  // Synchronize or fallback-fetch customer info if client mounted without server prefill
  useEffect(() => {
    if (!initialCustomerInfo) {
      getCustomerCheckoutInfoAction()
        .then((res) => {
          if (res.success && res.data) {
            const data = res.data;
            setFormData((prev) => ({
              ...prev,
              fullName: prev.fullName || data.fullName || "",
              email: prev.email || data.email || "",
              contactHandle: prev.contactHandle || data.phone || ""
            }));
          }
        })
        .catch(() => {});
    }
  }, [initialCustomerInfo]);

  // Step enter motion — transform/opacity only, skipped for reduced motion.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panel,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", overwrite: "auto" }
      );
    }, panel);

    return () => ctx.revert();
  }, [step]);

  // Dynamic validation schema using current locale
  const digitalCheckoutSchema = createDigitalCheckoutSchema({
    nameMin: dict?.checkout?.validationNameMin || (locale === "vi" ? "Họ tên phải có ít nhất 2 ký tự" : "Full name must be at least 2 characters"),
    emailInvalid: dict?.checkout?.validationEmailInvalid || (locale === "vi" ? "Địa chỉ email không hợp lệ để nhận mã nguồn" : "Invalid email address for delivery"),
    contactMin: dict?.checkout?.validationContactMin || (locale === "vi" ? "Vui lòng cung cấp link Facebook hoặc số Zalo để nhận hỗ trợ kỹ thuật" : "Please provide a contact handle for support"),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (validationErrors[e.target.name as keyof typeof formData]) {
      setValidationErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleNextToStep2 = (): void => setStep(2);

  const handleNextToStep3 = (): void => {
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

  const handlePlaceOrder = async (): Promise<void> => {
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
      <main className="flex min-h-[60vh] flex-grow items-center justify-center bg-background px-5 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin border-2 border-border border-t-dark" />
          <p className="mono-meta text-[8.5px] text-dark/45">
            {dict?.checkout?.loadingCart || (locale === "vi" ? "Đang tải giỏ hàng..." : "Loading cart details...")}
          </p>
        </div>
      </main>
    );
  }

  if (items.length === 0 && step === 1) {
    return (
      <main className="mx-auto flex w-full max-w-[1440px] flex-grow flex-col items-start justify-center px-5 py-20 font-sans sm:px-8">
        <span className="mono-meta text-primary">00 / {dict?.checkout?.checkoutLabel || (locale === "vi" ? "Thanh toán" : "Checkout")}</span>
        <span className="mt-6 flex h-16 w-16 items-center justify-center border border-border text-dark/25">
          <ShoppingCart size={28} />
        </span>
        <h1 className="mt-6 display text-[clamp(2rem,4vw,3.4rem)] text-dark">
          {dict?.checkout?.emptyCartTitle || (locale === "vi" ? "Giỏ hàng trống" : "Your cart is empty")}
        </h1>
        <p className="mt-4 max-w-md text-[13px] leading-relaxed text-dark/55">
          {dict?.checkout?.emptyCartDesc || (locale === "vi" ? "Vui lòng thêm ít nhất một website template vào giỏ hàng trước khi tiến hành thanh toán." : "Please add at least one template to your cart before proceeding to checkout.")}
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-8 inline-flex items-center gap-2 bg-dark px-6 py-3.5 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary"
          type="button"
        >
          <span>{dict?.checkout?.backToHome || (locale === "vi" ? "Quay lại trang chủ" : "Return to Homepage")}</span>
          <ArrowRight size={14} />
        </button>
      </main>
    );
  }

  const stepLabels: Record<1 | 2 | 3, string> = {
    1: dict?.checkout?.step1Title || (locale === "vi" ? "Mã nguồn" : "Source Code"),
    2: dict?.checkout?.step2Title || (locale === "vi" ? "Thông tin bàn giao số" : "Digital Delivery"),
    3: dict?.checkout?.step3Title || (locale === "vi" ? "Xác nhận" : "Confirmation"),
  };
  const stepIcons = { 1: ShoppingCart, 2: User, 3: ShieldCheck } as const;

  const heading =
    step === 1
      ? dict?.checkout?.pageHeading1 || (locale === "vi" ? "Xác nhận mã nguồn" : "Review Selected Codebases")
      : step === 2
        ? dict?.checkout?.pageHeading2 || (locale === "vi" ? "Thông tin nhận mã nguồn" : "Digital Delivery Details")
        : dict?.checkout?.pageHeading3 || (locale === "vi" ? "Xác nhận đơn hàng" : "Order Confirmation");

  const description =
    step === 1
      ? dict?.checkout?.pageDesc1 || (locale === "vi" ? "Kiểm tra kỹ lưỡng các gói website template trong giỏ hàng của bạn." : "Carefully inspect the website template packages in your cart before proceeding.")
      : step === 2
        ? dict?.checkout?.pageDesc2 || (locale === "vi" ? "Hệ thống sẽ tự động sử dụng thông tin tài khoản của bạn để gửi key bản quyền và link tải mã nguồn." : "Our system will use your account details to dispatch the license key and download link.")
        : dict?.checkout?.pageDesc3 || (locale === "vi" ? "Xem lại toàn bộ thông tin đơn hàng lần cuối trước khi tiến hành thanh toán." : "Review all order details one last time before initiating payment.");

  return (
    <main className="flex-grow bg-background font-sans">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14">
        {/* Header */}
        <header className="grid grid-cols-1 gap-6 border-b border-border pb-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <span className="mono-meta flex flex-wrap items-center gap-2 text-primary">
              <span className="h-1.5 w-1.5 bg-primary" />
              05 / {dict?.checkout?.checkoutLabel || (locale === "vi" ? "Thanh toán" : "Checkout")}
              <span className="text-dark/25">/</span>
              <span className="text-dark/40">{dict?.checkout?.flowLabel || (locale === "vi" ? "Quy trình" : "Flow")}</span>
            </span>

            <h1 className="mt-4 display text-[clamp(1.8rem,3.6vw,3rem)] text-dark">{heading}</h1>

            <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-dark/55 sm:text-sm">{description}</p>
          </div>

          <div className="border border-border bg-surface p-4 lg:col-span-4">
            <span className="mono-meta text-[8.5px] text-dark/40">
              {dict?.checkout?.flowLabel || (locale === "vi" ? "Quy trình" : "Flow")}
            </span>
            <div className="mt-2 flex items-start gap-2 text-[11.5px] leading-relaxed text-dark/60">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-success" />
              <span>{dict?.checkout?.secureNote || (locale === "vi" ? "Giao dịch được xác thực tự động qua VietQR / PayOS." : "Payment verified automatically via VietQR / PayOS.")}</span>
            </div>
            {createdOrderId && (
              <div className="mono-meta mt-3 border-t border-border pt-3 text-[8px] text-dark/45">
                {dict?.checkout?.orderRefLabel || (locale === "vi" ? "Mã đơn" : "Order ID")} #{createdOrderId.slice(0, 8).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Step rail */}
        <ol className="mt-6 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
          {([1, 2, 3] as const).map((id) => {
            const Icon = stepIcons[id];
            const isCurrent = step === id;
            const isDone = step > id;
            const stateLabel = isCurrent
              ? dict?.checkout?.stepCurrent || (locale === "vi" ? "Đang thực hiện" : "In progress")
              : isDone
                ? dict?.checkout?.stepDone || (locale === "vi" ? "Hoàn tất" : "Done")
                : dict?.checkout?.stepPending || (locale === "vi" ? "Chờ" : "Pending");

            return (
              <li key={id}>
                <button
                  onClick={() => {
                    if (id < step) setStep(id);
                  }}
                  disabled={id >= step}
                  type="button"
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex h-full w-full items-start gap-3 p-4 text-left transition-colors ${
                    isCurrent
                      ? "bg-dark text-background"
                      : isDone
                        ? "cursor-pointer bg-surface text-dark hover:bg-background"
                        : "cursor-default bg-surface text-dark/45"
                  }`}
                >
                  <span
                    className={`mono-meta pt-0.5 text-[9px] ${
                      isCurrent ? "text-primary" : isDone ? "text-primary" : "text-dark/30"
                    }`}
                  >
                    {String(id).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold leading-tight">
                      <Icon size={13} className={isCurrent ? "text-background/70" : isDone ? "text-primary" : "text-dark/30"} />
                      <span className="truncate">{stepLabels[id]}</span>
                    </span>
                    <span
                      className={`mono-meta mt-1.5 block text-[7.5px] ${
                        isCurrent ? "text-background/50" : isDone ? "text-success" : "text-dark/30"
                      }`}
                    >
                      {stateLabel}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Step panels */}
        <div ref={panelRef} className="mt-8">
          {/* STEP 1: CART SUMMARY */}
          {step === 1 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
              {/* Cart items */}
              <section className="border border-border bg-surface lg:col-span-8">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <h2 className="mono-meta flex items-center gap-2 text-[8.5px] text-dark/55">
                    <ShoppingCart size={11} className="text-primary" />
                    {dict?.checkout?.selectedItems || (locale === "vi" ? "Mã nguồn đã chọn" : "Selected Source Code")}
                  </h2>
                  <span className="mono-meta text-[8px] text-dark/30">
                    {String(items.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="divide-y divide-border">
                  {items.map((item, index) => {
                    const itemTitle = getLocalizedText(item.title as unknown as Record<string, string>, locale) || "Product";
                    return (
                      <div key={item.id} className="group flex gap-4 p-4 transition-colors hover:bg-background">
                        {item.imageUrl && (
                          <div className="relative h-20 w-24 shrink-0 overflow-hidden border border-border bg-background-subtle">
                            <Image
                              src={item.imageUrl}
                              alt={itemTitle}
                              fill
                              sizes="96px"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          </div>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <span className="mono-meta text-[8px] text-dark/30">
                              {dict.homeUi.labelSpec} {String(index + 1).padStart(3, "0")}
                            </span>
                            <h3 className="mt-1.5 truncate font-display text-[1rem] font-semibold tracking-[-0.03em] text-dark transition-colors group-hover:text-primary">
                              {itemTitle}
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-1">
                              <span className="border border-border bg-background px-1.5 py-1 text-[9.5px] leading-none text-dark/60">
                                {dict?.checkout?.lifetimeLicense || (locale === "vi" ? "Bản quyền trọn đời" : "Lifetime License")}
                              </span>
                              <span className="border border-border bg-background px-1.5 py-1 font-mono text-[9.5px] leading-none text-dark/45">
                                {dict?.checkout?.fixedQuantity || (locale === "vi" ? "Số lượng: 1 (Cố định)" : "Quantity: 1 (Fixed)")}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-t border-border pt-3">
                            <p className="text-[11px] text-dark/40">
                              {dict?.checkout?.licenseType || (locale === "vi" ? "Giấy phép:" : "License Tier:")}{" "}
                              <span className="text-dark/70">
                                {dict?.checkout?.licenseValue || "Single-Developer Commercial"}
                              </span>
                            </p>
                            <p className="font-mono text-[13px] font-semibold text-primary">
                              {formatCurrency(item.price, locale)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Summary */}
              <aside className="lg:col-span-4">
                <div className="sticky top-24 border border-border bg-surface">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                    <h2 className="mono-meta text-[8.5px] text-dark/55">
                      {dict?.checkout?.summaryTitle || (locale === "vi" ? "Tóm tắt thanh toán" : "Payment Summary")}
                    </h2>
                    <span className="mono-meta text-[8px] text-dark/25">
                      {dict.homeUi.labelVerified}
                    </span>
                  </div>

                  <div className="space-y-2.5 p-4 text-[11.5px]">
                    <div className="flex justify-between gap-2">
                      <span className="text-dark/50">{dict?.checkout?.originalPrice || (locale === "vi" ? "Giá gốc" : "Subtotal")}</span>
                      <span className="font-mono font-semibold text-dark">{formatCurrency(subtotal, locale)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-dark/50">{dict?.checkout?.digitalFee || (locale === "vi" ? "Phí bàn giao số" : "Digital Fulfillment")}</span>
                      <span className="flex items-center gap-1 text-success">
                        <Sparkles size={10} />
                        {dict?.checkout?.freeDigitalFee || (locale === "vi" ? "Miễn phí" : "Free")}
                      </span>
                    </div>
                  </div>

                  <div className="mx-4 flex items-center justify-between border-y border-border py-3.5">
                    <span className="text-[12px] font-semibold text-dark">
                      {dict?.checkout?.totalPayment || (locale === "vi" ? "Tổng thanh toán" : "Total Payment")}
                    </span>
                    <span className="font-mono text-[1.05rem] font-semibold text-primary">
                      {formatCurrency(subtotal, locale)}
                    </span>
                  </div>

                  <div className="p-4 pt-4">
                    <button
                      onClick={handleNextToStep2}
                      className="flex w-full items-center justify-center gap-2 bg-primary py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary-dark"
                      type="button"
                    >
                      <span>{dict?.checkout?.continueToInfo || (locale === "vi" ? "Tiếp tục điền thông tin" : "Continue to Delivery Info")}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* STEP 2: CUSTOMER DIGITAL INFO */}
          {step === 2 && (
            <div className="mx-auto max-w-3xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="mono-meta text-[8.5px] text-dark/55">02 / {stepLabels[2]}</span>
                <span className="mono-meta text-[8px] text-dark/25">{dict.homeUi.labelSpec}</span>
              </div>

              <div className="p-5 sm:p-8">
                <div className="border-b border-border pb-5">
                  <h2 className="font-display text-lg font-semibold tracking-[-0.03em] text-dark">
                    {dict?.checkout?.infoCardTitle || (locale === "vi" ? "Thông tin người nhận bàn giao số" : "Digital Delivery Recipient Information")}
                  </h2>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-dark/50">
                    {dict?.checkout?.infoCardDesc || (locale === "vi" ? "Hệ thống sẽ gửi email chứa link tải mã nguồn và cấp license key đến địa chỉ này." : "Our automated pipeline will deliver the source code download link and activation key to this email.")}
                  </p>
                </div>

                {(formData.fullName || formData.email || formData.contactHandle) && (
                  <div className="mt-5 flex items-start gap-2.5 border border-success/25 border-l-2 border-l-success bg-success/5 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-dark/70">
                    <Sparkles size={14} className="mt-0.5 shrink-0 text-success" />
                    <span>
                      {dict?.checkout?.autoFilled || (locale === "vi"
                        ? "Hệ thống đã tự động điền thông tin từ tài khoản của bạn. Bạn vẫn có thể chỉnh sửa nếu cần."
                        : "Information has been automatically filled from your profile. You can still modify it if needed.")}
                    </span>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="sm:col-span-1">
                    <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="checkout-fullName">
                      {dict?.checkout?.fullNameLabel || (locale === "vi" ? "Họ và tên của bạn" : "Your Full Name")}{" "}
                      <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
                      <input
                        id="checkout-fullName"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder={dict?.checkout?.fullNamePlaceholder || (locale === "vi" ? "Ví dụ: Nguyễn Văn A" : "e.g. Jane Doe")}
                        className={`h-10 w-full border bg-background pl-9 pr-3 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark ${
                          validationErrors.fullName ? "border-error/60" : "border-border"
                        }`}
                      />
                    </div>
                    {validationErrors.fullName && (
                      <p className="mt-1.5 text-[11px] text-error">{validationErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-1">
                    <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="checkout-email">
                      {dict?.checkout?.emailLabel || (locale === "vi" ? "Địa chỉ Email nhận mã nguồn" : "Email Address for Delivery")}{" "}
                      <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
                      <input
                        id="checkout-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={dict?.checkout?.emailPlaceholder || "jane.doe@example.com"}
                        className={`h-10 w-full border bg-background pl-9 pr-3 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark ${
                          validationErrors.email ? "border-error/60" : "border-border"
                        }`}
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="mt-1.5 text-[11px] text-error">{validationErrors.email}</p>
                    )}
                  </div>

                  {/* Contact Handle */}
                  <div className="sm:col-span-2">
                    <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="checkout-contactHandle">
                      {dict?.checkout?.contactHandleLabel || (locale === "vi" ? "Kênh liên hệ hỗ trợ (Số điện thoại / Zalo / Facebook)" : "Support Contact Handle (Phone / Zalo / Facebook)")}{" "}
                      <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <Send className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
                      <input
                        id="checkout-contactHandle"
                        type="text"
                        name="contactHandle"
                        value={formData.contactHandle}
                        onChange={handleChange}
                        placeholder={dict?.checkout?.contactHandlePlaceholder || (locale === "vi" ? "Số điện thoại, Zalo hoặc link Facebook cá nhân" : "Phone number, Zalo or Telegram handle")}
                        className={`h-10 w-full border bg-background pl-9 pr-3 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark ${
                          validationErrors.contactHandle ? "border-error/60" : "border-border"
                        }`}
                      />
                    </div>
                    {validationErrors.contactHandle && (
                      <p className="mt-1.5 text-[11px] text-error">{validationErrors.contactHandle}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="mono-meta mb-1.5 block text-[8.5px] text-dark/55" htmlFor="checkout-notes">
                      {dict?.checkout?.notesLabel || (locale === "vi" ? "Ghi chú thêm cho đơn hàng (không bắt buộc)" : "Order Notes / Requirements (Optional)")}
                    </label>
                    <textarea
                      id="checkout-notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder={dict?.checkout?.notesPlaceholder || (locale === "vi" ? "Yêu cầu xuất hóa đơn, hỗ trợ deploy hoặc câu hỏi khác..." : "Invoice requests, deployment questions, or custom notes...")}
                      className="w-full resize-none border border-border bg-background p-3 text-[12px] leading-relaxed text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row">
                  <button
                    onClick={() => setStep(1)}
                    className="flex w-full items-center justify-center gap-2 border border-border bg-surface py-3 text-[11.5px] font-medium text-dark/70 transition-colors hover:border-dark hover:text-dark sm:w-1/3"
                    type="button"
                  >
                    <ArrowLeft size={14} />
                    <span>{dict?.checkout?.backToCart || (locale === "vi" ? "Quay lại" : "Back")}</span>
                  </button>
                  <button
                    onClick={handleNextToStep3}
                    className="flex w-full items-center justify-center gap-2 bg-primary py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary-dark sm:w-2/3"
                    type="button"
                  >
                    <span>{dict?.checkout?.continueToReview || (locale === "vi" ? "Tiếp tục xác nhận" : "Continue to Review")}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & PAYMENT */}
          {step === 3 && (
            <div className="mx-auto max-w-3xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="mono-meta text-[8.5px] text-dark/55">03 / {stepLabels[3]}</span>
                <span className="mono-meta text-[8px] text-dark/25">{dict.homeUi.labelSpec}</span>
              </div>

              <div className="space-y-5 p-5 sm:p-8">
                <div className="border-b border-border pb-5">
                  <h2 className="font-display text-lg font-semibold tracking-[-0.03em] text-dark">
                    {dict?.checkout?.reviewOrderTitle || (locale === "vi" ? "Kiểm tra lại thông tin đơn hàng" : "Review Order & Complete Payment")}
                  </h2>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-dark/50">
                    {dict?.checkout?.reviewIntro || (locale === "vi"
                      ? "Vui lòng chọn phương thức thanh toán và xác nhận mở khóa template."
                      : "Please select payment method and confirm unlocking your template.")}
                  </p>
                </div>

                {/* Recipient details */}
                <div className="border border-border bg-background">
                  <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
                    <span className="mono-meta text-[8.5px] text-dark/50">
                      {dict?.checkout?.recipientInfo || (locale === "vi" ? "Thông tin bàn giao" : "Delivery Recipient")}
                    </span>
                    <button
                      onClick={() => setStep(2)}
                      className="mono-meta text-[8px] text-primary transition-colors hover:text-dark"
                      type="button"
                    >
                      {dict?.common?.edit || (locale === "vi" ? "Sửa" : "Edit")}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
                    <div className="bg-background p-3.5">
                      <span className="mono-meta block text-[8px] text-dark/35">
                        {dict?.checkout?.fullNameLabel || "Name"}
                      </span>
                      <span className="mt-1 block truncate text-[12px] font-medium text-dark">{formData.fullName}</span>
                    </div>
                    <div className="bg-background p-3.5">
                      <span className="mono-meta block text-[8px] text-dark/35">
                        {dict?.checkout?.emailLabel || "Email"}
                      </span>
                      <span className="mt-1 block truncate font-mono text-[11.5px] text-dark">{formData.email}</span>
                    </div>
                    <div className="bg-background p-3.5">
                      <span className="mono-meta block text-[8px] text-dark/35">
                        {dict?.checkout?.contactHandleLabel || "Contact"}
                      </span>
                      <span className="mt-1 block truncate font-mono text-[11.5px] text-dark">{formData.contactHandle}</span>
                    </div>
                    {formData.notes && (
                      <div className="bg-background p-3.5">
                        <span className="mono-meta block text-[8px] text-dark/35">
                          {dict?.checkout?.notesLabel || "Notes"}
                        </span>
                        <span className="mt-1 block line-clamp-1 text-[11.5px] italic text-dark/60">{formData.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment method or free order */}
                {subtotal === 0 ? (
                  <div className="flex items-start gap-3 border border-success/30 bg-success/5 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-success/30 text-success">
                      <ShieldCheck size={16} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-display text-[13px] font-semibold tracking-[-0.02em] text-dark">
                          {dict?.checkout?.freeOrderTitle || (locale === "vi" ? "Đơn hàng miễn phí (0đ)" : "Free Digital Order (0đ)")}
                        </span>
                        <span className="mono-meta border border-success/30 px-1.5 py-1 text-[7.5px] text-success">
                          {dict?.checkout?.freeOrderBadge || (locale === "vi" ? "Không cần thanh toán" : "No Payment Required")}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-dark/50">
                        {dict?.checkout?.freeOrderDesc || (locale === "vi"
                          ? "Mã bản quyền (License Key) và link tải mã nguồn sẽ được hệ thống tự động kích hoạt và gửi đến email của bạn ngay lập tức."
                          : "Your lifetime license key and source code download link will be automatically issued and dispatched to your email immediately.")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="mono-meta block text-[8.5px] text-dark/50">
                      {dict?.checkout?.paymentMethodTitle || (locale === "vi" ? "Chọn phương thức thanh toán" : "Choose Payment Method")}
                    </span>

                    <label
                      className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                        formData.paymentMethod === PaymentMethod.PAYOS
                          ? "border-dark bg-background"
                          : "border-border bg-surface hover:border-dark/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={PaymentMethod.PAYOS}
                        checked={formData.paymentMethod === PaymentMethod.PAYOS}
                        onChange={() => setFormData(prev => ({ ...prev, paymentMethod: PaymentMethod.PAYOS }))}
                        className="mt-0.5 h-3.5 w-3.5 accent-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <QrCode size={13} className="text-primary" />
                          <span className="text-[12.5px] font-semibold text-dark">
                            {dict?.checkout?.payosLabel || (locale === "vi" ? "VietQR / PayOS (Khuyên dùng)" : "VietQR / PayOS (Recommended)")}
                          </span>
                          <span className="mono-meta border border-success/30 px-1.5 py-1 text-[7.5px] text-success">
                            {dict?.checkout?.payosBadge || (locale === "vi" ? "Tự động 24/7" : "Automated 24/7")}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-dark/50">
                          {dict?.checkout?.vietQrDesc || (locale === "vi" ? "Tạo mã QR động VietQR thanh toán tự động trong 5 giây qua ứng dụng ngân hàng" : "Dynamic VietQR automated code generation with 5-second bank verification")}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Error banner */}
                {error && (
                  <div className="flex items-start gap-2 border border-error/30 bg-error/5 p-3 text-[11.5px] text-error">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row">
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 border border-border bg-surface py-3 text-[11.5px] font-medium text-dark/70 transition-colors hover:border-dark hover:text-dark disabled:opacity-50 sm:w-1/3"
                    type="button"
                  >
                    <ArrowLeft size={14} />
                    <span>{dict?.checkout?.backToCart || (locale === "vi" ? "Quay lại" : "Back")}</span>
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 bg-primary py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-2/3"
                    type="button"
                  >
                    {loading ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin border-2 border-background/30 border-t-background" />
                        <span>{dict?.checkout?.processing || (locale === "vi" ? "Đang xử lý..." : "Processing...")}</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {subtotal === 0
                            ? (dict?.checkout?.claimFreeCta || (locale === "vi" ? "Nhận template miễn phí ngay (0đ)" : "Claim Free Template (0đ)"))
                            : `${dict?.checkout?.payCta || (locale === "vi" ? "Thanh toán" : "Pay")} ${formatCurrency(subtotal, locale)}`}
                        </span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
