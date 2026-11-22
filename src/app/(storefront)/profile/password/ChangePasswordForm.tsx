"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { changePasswordAction } from "@/server/presentation/actions/auth";
import { toast } from "@/client/hooks/useToastStore";
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
            <label className="mono-meta block text-[8.5px] text-dark/55">
              {locale === "vi" ? "Mật khẩu hiện tại" : "Current Password"}{" "}
              <span className="text-primary">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[10.5px] text-primary transition-colors hover:text-dark"
            >
              {locale === "vi" ? "Quên mật khẩu?" : "Forgot password?"}
            </Link>
          </div>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-10 w-full border border-border bg-background pl-9 pr-10 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-dark/35 transition-colors hover:text-dark"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="mono-meta block text-[8.5px] text-dark/55 mb-1.5">
            {locale === "vi" ? "Mật khẩu mới (tối thiểu 6 ký tự)" : "New Password (min 6 chars)"}{" "}
            <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="h-10 w-full border border-border bg-background pl-9 pr-10 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-dark/35 transition-colors hover:text-dark"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="mono-meta block text-[8.5px] text-dark/55 mb-1.5">
            {locale === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password"}{" "}
            <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="h-10 w-full border border-border bg-background pl-9 pr-10 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-dark/35 transition-colors hover:text-dark"
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
          className="inline-flex items-center gap-2 bg-dark px-5 py-3 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
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
