import { IDashboardRepository, DashboardMetrics } from "@/domain/repositories/IDashboardRepository";

export class GetDashboardMetricsUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<{ success: boolean; data?: DashboardMetrics; error?: string }> {
    try {
      const metrics = await this.dashboardRepository.getMetrics();
      return { success: true, data: metrics };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch dashboard metrics";
      console.error("GetDashboardMetricsUseCase Error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}
