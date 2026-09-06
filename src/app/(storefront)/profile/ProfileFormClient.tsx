"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/presentation/actions/auth";
import { toast } from "@/presentation/hooks/useToastStore";
import { CheckCircle2, Loader2, Phone, Mail, User } from "lucide-react";

interface ProfileFormClientProps {
  initialFullName: string;
  initialPhone: string;
  email: string;
  locale: string;
  profileDict: Record<string, string>;
}

export function ProfileFormClient({
  initialFullName,
  initialPhone,
  email,
  locale,
  profileDict,
}: ProfileFormClientProps) {
  const parts = initialFullName.split(" ");
  const [firstName, setFirstName] = useState(parts.slice(0, -1).join(" "));
  const [lastName, setLastName] = useState(parts.slice(-1).join("") || initialFullName);
  const [phone, setPhone] = useState(initialPhone || "");
  const [isPending, startTransition] = useTransition();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Strictly allow only '+' at start and digits 0-9 thereafter
    let sanitized = "";
    for (let i = 0; i < raw.length; i++) {
      const char = raw[i];
      if (i === 0 && char === "+") {
        sanitized += char;
      } else if (/[0-9]/.test(char)) {
        sanitized += char;
      }
    }
    // Limit to max 12 characters (+84xxxxxxxxx or 09xxxxxxxx)
    if (sanitized.length <= 12) {
      setPhone(sanitized);
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow functional navigation and editing keys
    if (
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "Home", "End"].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Allow '+' only at the first position and if not already present
    if (e.key === "+" && e.currentTarget.selectionStart === 0 && !phone.includes("+")) {
      return;
    }

    // Block any non-numeric character
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    let sanitized = "";
    for (let i = 0; i < pasted.length; i++) {
      const char = pasted[i];
      if (i === 0 && char === "+") {
        sanitized += char;
      } else if (/[0-9]/.test(char)) {
        sanitized += char;
      }
    }
    if (sanitized.length <= 12) {
      setPhone(sanitized);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      toast.warning(
        locale === "vi" ? "Thiếu thông tin" : "Missing information",
        locale === "vi" ? "Vui lòng nhập họ và tên của bạn." : "Please enter your full name."
      );
      return;
    }

    if (fullName.length < 2) {
      toast.warning(
        locale === "vi" ? "Họ và tên quá ngắn" : "Name too short",
        locale === "vi" ? "Họ và tên phải có tối thiểu 2 ký tự." : "Full name must be at least 2 characters."
      );
      return;
    }

    const trimmedPhone = phone.trim();

    if (trimmedPhone.length > 0) {
      const phoneRegex = /^(0|\+84)[35789][0-9]{8}$/;
      if (!phoneRegex.test(trimmedPhone)) {
        toast.warning(
          locale === "vi" ? "Số điện thoại không hợp lệ" : "Invalid phone number",
          locale === "vi"
            ? "Vui lòng nhập đúng 10 số di động (bắt đầu bằng 03, 05, 07, 08, 09) hoặc định dạng +84."
            : "Please enter a valid 10-digit mobile phone number (starting with 03, 05, 07, 08, 09) or +84."
        );
        return;
      }
    }

    startTransition(async () => {
      const res = await updateProfileAction(fullName, trimmedPhone);
      if (res.success) {
        setPhone(trimmedPhone);
        toast.success(
          locale === "vi" ? "Cập nhật thành công!" : "Profile updated!",
          locale === "vi" ? "Thông tin tài khoản của bạn đã được lưu an toàn." : "Your profile changes have been saved."
        );
      } else {
        toast.error(
          locale === "vi" ? "Cập nhật thất bại" : "Update failed",
          res.error || (locale === "vi" ? "Vui lòng thử lại sau." : "Please try again.")
        );
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {/* First Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            {profileDict.firstNameLabel || (locale === "vi" ? "Họ & Tên lót" : "First Name")}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-10 pl-10 pr-3.5 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
              placeholder={locale === "vi" ? "Nguyễn Văn" : "Jane"}
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            {profileDict.lastNameLabel || (locale === "vi" ? "Tên" : "Last Name")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-10 pl-10 pr-3.5 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
              placeholder={locale === "vi" ? "A" : "Doe"}
              required
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            {profileDict.emailLabel || (locale === "vi" ? "Địa chỉ Email" : "Email Address")}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              readOnly
              defaultValue={email}
              className="w-full h-10 pl-10 pr-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-normal text-slate-400 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {/* Contact Phone */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            {profileDict.phoneLabel || (locale === "vi" ? "Số điện thoại liên hệ" : "Contact Phone Number")}
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={handlePhoneChange}
              onKeyDown={handlePhoneKeyDown}
              onPaste={handlePhonePaste}
              maxLength={12}
              placeholder="0912345678"
              className="w-full h-10 pl-10 pr-3.5 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-xs text-sm active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <CheckCircle2 size={15} />
          )}
          <span>
            {isPending
              ? (locale === "vi" ? "Đang lưu..." : "Saving...")
              : (profileDict.saveChanges || (locale === "vi" ? "Lưu thay đổi" : "Save Changes"))}
          </span>
        </button>
      </div>
    </form>
  );
}
