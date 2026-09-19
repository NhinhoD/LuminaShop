"use server";

import { makeGetAdminCustomersUseCase } from "@/server/di/container";
import { 
  CustomerWithStats, 
  CustomerFilters, 
  PaginatedCustomersResult 
} from "@/server/domain/repositories/IDashboardRepository";
import { assertAdmin } from "./authGuards";

export interface AdminActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server action to retrieve all customers with order and spend statistics for the admin portal.
 */
export async function getAdminCustomersAction(search?: string): Promise<AdminActionResponse<CustomerWithStats[]>> {
  try {
    await assertAdmin();
    const useCase = await makeGetAdminCustomersUseCase();
    const result = await useCase.execute(search);

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể tải danh sách khách hàng."
    };
  }
}

/**
 * Server action to retrieve paginated customers with server-side filters and global stats.
 */
export async function getPaginatedAdminCustomersAction(
  filters?: CustomerFilters
): Promise<AdminActionResponse<PaginatedCustomersResult>> {
  try {
    await assertAdmin();
    const useCase = await makeGetAdminCustomersUseCase();
    const result = await useCase.executePaginated(filters);

    if (!result.success) {
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể tải danh sách khách hàng."
    };
  }
}
