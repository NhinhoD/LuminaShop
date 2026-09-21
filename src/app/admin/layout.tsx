import { notFound, redirect } from "next/navigation";
import { makeGetCurrentUserUseCase, makeGetProfileUseCase, getAppDictionary } from "@/server/di/container";
import { getLocale } from "@/i18n/getDictionary";
import { ROLES, ROUTES } from "@/shared/constants";
import { AdminShell } from "@/client/components/admin/layout/AdminShell";

export const dynamic = "force-dynamic";

/**
 * Admin layout component that enforces role-based access control.
 * Validates user authentication and admin role, then renders the AdminShell wrapper with localized UI.
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactNode> {
  const dict = await getAppDictionary();
  const adminDict = (dict.admin as Record<string, string>) || {};
  const currentLocale = await getLocale();

  // Layer 2: Server-side admin guard (defense-in-depth via auth use cases)
  const getCurrentUser = await makeGetCurrentUserUseCase();
  const userResult = await getCurrentUser.execute();

  if (!userResult.success) {
    console.error("AdminLayout user authentication error:", userResult.error);
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto">
          <p className="font-semibold text-sm">
            {currentLocale === "vi"
              ? "Không thể xác thực thông tin người dùng từ máy chủ"
              : "Failed to authenticate user from server"}
          </p>
          <p className="text-xs text-red-500 mt-1">
            {currentLocale === "vi"
              ? "Vui lòng thử lại sau hoặc đăng nhập lại."
              : "Please try again later or sign in again."}
          </p>
        </div>
      </div>
    );
  }

  const user = userResult.data;
  // If not logged in, redirect to login instead of 404 to improve UX
  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  // Check role from profiles use case
  const getProfile = await makeGetProfileUseCase();
  const profileResult = await getProfile.execute(user.id);

  if (!profileResult.success) {
    console.error("AdminLayout profile lookup error:", profileResult.error);
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto">
          <p className="font-semibold text-sm">
            {currentLocale === "vi"
              ? "Không thể tải thông tin quyền quản trị từ máy chủ"
              : "Failed to verify admin privileges from database"}
          </p>
          <p className="text-xs text-red-500 mt-1">
            {currentLocale === "vi"
              ? "Vui lòng thử lại sau."
              : "Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  const profile = profileResult.data;
  // If not an admin, show 404 to hide admin existence (security by obscurity)
  if (!profile || profile.role !== ROLES.ADMIN) {
    notFound();
  }

  const userName = profile.fullName || user.fullName || "Admin";
  const userEmail = user.email || "admin@khoui.vn";

  return (
    <AdminShell
      currentLocale={currentLocale}
      adminDict={adminDict}
      userName={userName}
      userEmail={userEmail}
    >
      {children}
    </AdminShell>
  );
}
