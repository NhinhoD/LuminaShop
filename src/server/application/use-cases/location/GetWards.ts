import { ILocationRepository } from '@/server/domain/repositories/ILocationRepository';
import { Ward } from '@/server/domain/entities/Location';
import { Result, ok, fail } from '@/server/domain/shared/Result';

export class GetWardsUseCase {
  constructor(private locationRepo: ILocationRepository) {}

  async execute(districtId: string): Promise<Result<Ward[]>> {
    try {
      if (!districtId) {
        return ok([]);
      }
      const wards = await this.locationRepo.getWards(districtId);
      return ok(wards);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Không thể lấy danh sách Phường/Xã');
      return fail(err);
    }
  }
}
