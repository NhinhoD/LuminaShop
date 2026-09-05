"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { changePasswordAction } from "@/presentation/actions/auth";
import { toast } from "@/presentation/hooks/useToastStore";
import { Lock, KeyRound, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  locale: string;
}

export function ChangePasswordForm({ locale }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.warning(
        locale === "vi" ? "Thiếu thông tin" : "Missing information",
        locale === "vi" ? "Vui lòng nhập mật khẩu hiện tại." : "Please enter your current password."
      );
      return;
    }

    if (newPassword.length < 6) {
      toast.warning(
        locale === "vi" ? "Mật khẩu quá ngắn" : "Password too short",
        locale === "vi" ? "Mật khẩu mới phải có tối thiểu 6 ký tự." : "New password must be at least 6 characters."
      );
      return;
    }

    if (currentPassword === newPassword) {
      toast.warning(
        locale === "vi" ? "Mật khẩu không hợp lệ" : "Invalid password",
        locale === "vi" ? "Mật khẩu mới không được trùng với mật khẩu hiện tại." : "New password cannot be the same as current password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning(
        locale === "vi" ? "Mật khẩu không khớp" : "Passwords do not match",
        locale === "vi" ? "Vui lòng kiểm tra lại mật khẩu xác nhận." : "Please re-check your confirm password."
      );
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await changePasswordAction(formData);

      if (res.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success(
          locale === "vi" ? "Đổi mật khẩu thành công!" : "Password updated!",
          locale === "vi"
            ? "Mật khẩu tài khoản của bạn đã được cập nhật an toàn."
            : "Your account password has been updated securely."
        );
      } else {
        toast.error(
          locale === "vi" ? "Đổi mật khẩu thất bại" : "Update failed",
          res.error || (locale === "vi" ? "Vui lòng kiểm tra lại thông tin và thử lại." : "Please try again.")
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="max-w-xl space-y-5">
        {/* Current Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-700">
              {locale === "vi" ? "Mật khẩu hiện tại" : "Current Password"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:text-primary-dark hover:underline transition-colors font-medium"
            >
              {locale === "vi" ? "Quên mật khẩu?" : "Forgot password?"}
            </Link>
          </div>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full h-11 pl-10 pr-11 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            {locale === "vi" ? "Mật khẩu mới (tối thiểu 6 ký tự)" : "New Password (min 6 chars)"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full h-11 pl-10 pr-11 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            {locale === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full h-11 pl-10 pr-11 bg-white border border-slate-200/80 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-start">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark active:scale-98 transition-all text-sm cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{locale === "vi" ? "Đang xử lý..." : "Processing..."}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{locale === "vi" ? "Cập nhật mật khẩu" : "Update Password"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
