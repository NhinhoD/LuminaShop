import { makeSupabaseClient } from "@/infrastructure/supabase/container";
import { ROLES } from "@/presentation/constants";

/**
 * Validates that the current request is from an authenticated admin.
 * Throws an Error if unauthorized.
 */
export async function assertAdmin(): Promise<{ id: string; email: string }> {
  const supabase = await makeSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: Yêu cầu đăng nhập.");
  }

  // Check role in profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== ROLES.ADMIN) {
    throw new Error("Forbidden: Bạn không có quyền thực hiện thao tác này.");
  }

  return {
    id: user.id,
    email: user.email || "",
  };
}

/**
 * Validates that the current request is from an authenticated user.
 * Throws an Error if not authenticated.
 */
export async function assertAuthenticated(): Promise<{ id: string; email: string }> {
  const supabase = await makeSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: Yêu cầu đăng nhập.");
  }

  return {
    id: user.id,
    email: user.email || "",
  };
}
