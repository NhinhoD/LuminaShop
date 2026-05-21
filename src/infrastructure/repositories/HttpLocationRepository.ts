import { ILocationRepository } from '@/domain/repositories/ILocationRepository';
import { Province, District, Ward } from '@/domain/entities/Location';

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
    try {
      const response = await fetch(`${this.baseUrl}/p/`, {
        next: { revalidate: 86400 } // Cache for 24 hours in Next.js
      });

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
    } catch (error) {
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
          name: 'Khu vực trực thuộc',
          fullName: 'Khu vực trực thuộc',
          provinceId
        }
      ];
    } catch (error) {
      throw error;
    }
  }

  async getWards(districtId: string): Promise<Ward[]> {
    try {
      if (!districtId) return [];

      // districtId is equal to the provinceId, which we query for its wards
      const response = await fetch(`${this.baseUrl}/p/${districtId}?depth=2`, {
        next: { revalidate: 86400 }
      });

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
    } catch (error) {
      throw error;
    }
  }
}
