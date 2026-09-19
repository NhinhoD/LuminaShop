import { makeGetCurrentUserUseCase, makeGetProfileUseCase } from "@/server/di/container";
import { ROLES } from "@/shared/constants";

/**
 * Validates that the current request is from an authenticated admin.
 * Throws an Error if unauthorized or forbidden, or propagates lookup errors.
 */
export async function assertAdmin(): Promise<{ id: string; email: string; fullName: string; role: string }> {
  const getCurrentUser = await makeGetCurrentUserUseCase();
  const userResult = await getCurrentUser.execute();

  if (!userResult.success) {
    throw userResult.error;
  }

  const user = userResult.data;
  if (!user) {
    throw new Error("Unauthorized: Yêu cầu đăng nhập.");
  }

  const getProfile = await makeGetProfileUseCase();
  const profileResult = await getProfile.execute(user.id);

  if (!profileResult.success) {
    throw profileResult.error;
  }

  const profile = profileResult.data;
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
 * Throws an Error if not authenticated or propagates lookup errors.
 */
export async function assertAuthenticated(): Promise<{ id: string; email: string }> {
  const getCurrentUser = await makeGetCurrentUserUseCase();
  const userResult = await getCurrentUser.execute();

  if (!userResult.success) {
    throw userResult.error;
  }

  const user = userResult.data;
  if (!user) {
    throw new Error("Unauthorized: Yêu cầu đăng nhập.");
  }

  return {
    id: user.id,
    email: user.email || "",
  };
}
