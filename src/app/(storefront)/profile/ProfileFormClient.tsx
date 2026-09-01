"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/presentation/actions/auth";
import { toast } from "@/presentation/hooks/useToastStore";
import { CheckCircle2, Loader2 } from "lucide-react";

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
  const [phone, setPhone] = useState(initialPhone);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      toast.warning(
        locale === "vi" ? "Vui lòng nhập họ và tên" : "Please enter your full name"
      );
      return;
    }

    startTransition(async () => {
      const res = await updateProfileAction(fullName, phone);
      if (res.success) {
        toast.success(
          locale === "vi" ? "Cập nhật thành công!" : "Profile updated!",
          locale === "vi" ? "Thông tin tài khoản của bạn đã được lưu." : "Your profile changes have been saved."
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {profileDict.firstNameLabel || (locale === "vi" ? "Họ & Tên lót" : "First Name")}
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#0051d5] outline-none transition-all"
            placeholder={locale === "vi" ? "Nguyễn Văn" : "Jane"}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {profileDict.lastNameLabel || (locale === "vi" ? "Tên" : "Last Name")}
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#0051d5] outline-none transition-all"
            placeholder={locale === "vi" ? "A" : "Doe"}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {profileDict.emailLabel || (locale === "vi" ? "Địa chỉ Email" : "Email Address")}
          </label>
          <input
            type="email"
            readOnly
            defaultValue={email}
            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-400 outline-none cursor-not-allowed"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {profileDict.phoneLabel || (locale === "vi" ? "Số điện thoại liên hệ" : "Contact Phone Number")}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0912345678"
            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#0051d5] outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end mt-10">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#0051d5] hover:bg-[#0041ac] text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-900/10 text-xs active:scale-95 uppercase tracking-wider cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <CheckCircle2 size={14} />
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
