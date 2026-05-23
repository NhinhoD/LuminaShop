import { ILocationRepository } from '@/domain/repositories/ILocationRepository';
import { District } from '@/domain/entities/Location';
import { Result, ok, fail } from '@/domain/shared/Result';

export class GetDistrictsUseCase {
  constructor(private locationRepo: ILocationRepository) {}

  async execute(provinceId: string): Promise<Result<District[]>> {
    try {
      if (!provinceId) {
        return ok([]);
      }
      const districts = await this.locationRepo.getDistricts(provinceId);
      return ok(districts);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Không thể lấy danh sách Quận/Huyện');
      return fail(err);
    }
  }
}
