import { makeAuthRepository } from "@/di/container";
import { ROLES } from "@/presentation/constants";

/**
 * Validates that the current request is from an authenticated admin.
 * Throws an Error if unauthorized.
 */
export async function assertAdmin(): Promise<{ id: string; email: string; fullName: string; role: string }> {
  const authRepo = await makeAuthRepository();
  const user = await authRepo.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: Yêu cầu đăng nhập.");
  }

  const profile = await authRepo.getProfile(user.id);
  if (!profile || profile.role !== ROLES.ADMIN) {
    throw new Error("Forbidden: Bạn không có quyền thực hiện thao tác này.");
  }

  return {
    id: user.id,
    email: user.email || "",
    fullName: profile.fullName || user.fullName || "Admin",
    role: profile.role,
  };
}

/**
 * Validates that the current request is from an authenticated user.
 * Throws an Error if not authenticated.
 */
export async function assertAuthenticated(): Promise<{ id: string; email: string }> {
  const authRepo = await makeAuthRepository();
  const user = await authRepo.getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: Yêu cầu đăng nhập.");
  }

  return {
    id: user.id,
    email: user.email || "",
  };
}
