import { 
  IDashboardRepository, 
  CustomerWithStats, 
  CustomerFilters, 
  PaginatedCustomersResult 
} from '@/server/domain/repositories/IDashboardRepository';
import { Result, ok, fail } from '@/server/domain/shared/Result';

export class GetAdminCustomersUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(search?: string): Promise<Result<CustomerWithStats[]>> {
    try {
      const customers = await this.dashboardRepository.getCustomers(search);
      return ok(customers);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to retrieve customers'));
    }
  }

  async executePaginated(filters?: CustomerFilters): Promise<Result<PaginatedCustomersResult>> {
    try {
      const result = await this.dashboardRepository.getPaginatedCustomers(filters);
      return ok(result);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to retrieve paginated customers'));
    }
  }
}
