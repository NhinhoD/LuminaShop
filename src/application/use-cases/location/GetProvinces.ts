import { ILocationRepository } from '@/domain/repositories/ILocationRepository';
import { Province } from '@/domain/entities/Location';
import { Result, ok, fail } from '@/domain/shared/Result';

export class GetProvincesUseCase {
  constructor(private locationRepo: ILocationRepository) {}

  async execute(): Promise<Result<Province[]>> {
    try {
      const provinces = await this.locationRepo.getProvinces();
      return ok(provinces);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Không thể lấy danh sách Tỉnh/Thành phố');
      return fail(err);
    }
  }
}
