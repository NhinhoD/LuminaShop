import { notFound, redirect } from "next/navigation";
import { makeGetCurrentUserUseCase, makeGetProfileUseCase, getAppDictionary } from "@/di/container";
import { getLocale } from "@/i18n/getDictionary";
import { ROLES, ROUTES } from "@/presentation/constants";
import { AdminShell } from "@/presentation/components/admin/layout/AdminShell";

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
  const user = await getCurrentUser.execute();

  // If not logged in, redirect to login instead of 404 to improve UX
  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  // Check role from profiles use case
  const getProfile = await makeGetProfileUseCase();
  const profile = await getProfile.execute(user.id);

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
