import { notFound, redirect } from "next/navigation";
// Justification: Next.js App Router Server Components require direct cookie access for session validation.
// We alias createClient to createServerSupabaseClient to make the infrastructure coupling explicit.
import { createClient as createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { ROLES, ROUTES } from "@/presentation/constants";
import { AdminShell } from "@/presentation/components/admin/layout/AdminShell";

export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactNode> {
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const adminDict = (dict.admin as Record<string, string>) || {};
  const currentLocale = await getLocale();

  // Layer 2: Server-side admin guard (defense-in-depth)
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // If not logged in, redirect to login instead of 404 to improve UX
  if (userError || !user) {
    redirect(ROUTES.LOGIN);
  }

  // Check role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  // If not an admin, show 404 to hide admin existence (security by obscurity)
  if (profileError || !profile || profile.role !== ROLES.ADMIN) {
    notFound();
  }

  const userName = profile.full_name || user.user_metadata?.full_name || "Admin";
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

