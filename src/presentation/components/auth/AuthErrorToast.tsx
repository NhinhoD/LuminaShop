"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/presentation/hooks/useToastStore";

const ERROR_MESSAGES: Record<string, { vi: { title: string; desc: string }; en: { title: string; desc: string } }> = {
  InvalidCredentials: {
    vi: {
      title: "Đăng nhập không thành công",
      desc: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
    },
    en: {
      title: "Authentication Failed",
      desc: "Invalid email or password. Please verify your credentials.",
    },
  },
  SignUpFailed: {
    vi: {
      title: "Đăng ký không thành công",
      desc: "Email này có thể đã được sử dụng hoặc thông tin không hợp lệ.",
    },
    en: {
      title: "Sign Up Failed",
      desc: "This email might already be registered or the form data is invalid.",
    },
  },
  ServerError: {
    vi: {
      title: "Lỗi kết nối máy chủ",
      desc: "Đã xảy ra sự cố trong quá trình xử lý. Vui lòng thử lại sau.",
    },
    en: {
      title: "Server Error",
      desc: "An unexpected error occurred. Please try again in a few moments.",
    },
  },
};

export function AuthErrorToast({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get("error");

  useEffect(() => {
    if (errorKey && ERROR_MESSAGES[errorKey]) {
      const isVi = locale === "vi";
      const config = isVi ? ERROR_MESSAGES[errorKey].vi : ERROR_MESSAGES[errorKey].en;
      toast.error(config.title, config.desc);
    }
  }, [errorKey, locale]);

  return null;
}
