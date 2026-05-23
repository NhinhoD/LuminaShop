import { ILocationRepository } from '@/domain/repositories/ILocationRepository';
import { Province, District, Ward } from '@/domain/entities/Location';
import { DEFAULT_DISTRICT } from '@/domain/constants/Location';

interface OpenApiV2Ward {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
}

interface OpenApiV2Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  wards?: OpenApiV2Ward[];
}

export class HttpLocationRepository implements ILocationRepository {
  private readonly baseUrl = 'https://provinces.open-api.vn/api/v2';

  async getProvinces(): Promise<Province[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(`${this.baseUrl}/p/`, {
        next: { revalidate: 86400 }, // Cache for 24 hours in Next.js
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch provinces: ${response.statusText}`);
      }

      const result = (await response.json()) as OpenApiV2Province[];
      if (!result) return [];

      return result.map((item) => ({
        id: String(item.code),
        name: item.name,
        fullName: item.name
      }));
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Yêu cầu lấy danh sách Tỉnh/Thành phố quá thời gian chờ (timeout)');
      }
      throw error;
    }
  }

  async getDistricts(provinceId: string): Promise<District[]> {
    try {
      if (!provinceId) return [];

      // Open-api v2 uses a 2-tier system (province -> wards), so we return a placeholder district
      return [
        {
          id: provinceId,
          name: DEFAULT_DISTRICT,
          fullName: DEFAULT_DISTRICT,
          provinceId
        }
      ];
    } catch (error) {
      throw error;
    }
  }

  async getWards(districtId: string): Promise<Ward[]> {
    if (!districtId) return [];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      // districtId is equal to the provinceId, which we query for its wards
      const response = await fetch(`${this.baseUrl}/p/${districtId}?depth=2`, {
        next: { revalidate: 86400 },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch wards: ${response.statusText}`);
      }

      const result = (await response.json()) as OpenApiV2Province;
      if (!result || !result.wards) return [];

      return result.wards.map((item) => ({
        id: String(item.code),
        name: item.name,
        fullName: item.name,
        districtId
      }));
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Yêu cầu lấy danh sách Phường/Xã quá thời gian chờ (timeout)');
      }
      throw error;
    }
  }
}

