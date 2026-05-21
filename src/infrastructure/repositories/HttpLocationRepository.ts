import { ILocationRepository } from '@/domain/repositories/ILocationRepository';
import { Province, District, Ward } from '@/domain/entities/Location';

interface TracuudiachiProvince {
  id: number;
  name: string;
  code: number;
  level: string;
  code_name: string;
  created_at: string;
  updated_at: string;
}

interface TracuudiachiDistrict {
  id: number;
  name: string;
  code: number;
  level: string;
  code_name: string;
  province_code: number;
  created_at: string;
  updated_at: string;
}

interface TracuudiachiWard {
  id: number;
  name: string;
  code: number;
  level: string;
  code_name: string;
  province_code: number;
  district_code: number;
  created_at: string;
  updated_at: string;
}

interface TracuudiachiProvincesResponse {
  data: TracuudiachiProvince[];
  meta: {
    total: number;
    page: number;
    icpp: number;
    totalPages: number;
  };
}

interface TracuudiachiDistrictsResponse {
  data: TracuudiachiDistrict[];
}

interface TracuudiachiDistrictWithWardsResponse {
  data: TracuudiachiDistrict & {
    wards: TracuudiachiWard[];
  };
}

export class HttpLocationRepository implements ILocationRepository {
  private readonly baseUrl = 'https://api.tracuudiachi.io.vn/api/v1';

  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provinces?icpp=100`, {
        next: { revalidate: 86400 } // Cache for 24 hours in Next.js
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch provinces: ${response.statusText}`);
      }

      const result = (await response.json()) as TracuudiachiProvincesResponse;
      if (!result.data) return [];

      return result.data.map((item) => ({
        id: String(item.code),
        name: item.name,
        fullName: item.name
      }));
    } catch (error) {
      console.error('HttpLocationRepository getProvinces Error:', error);
      throw error;
    }
  }

  async getDistricts(provinceId: string): Promise<District[]> {
    try {
      if (!provinceId) return [];

      const response = await fetch(`${this.baseUrl}/provinces/${provinceId}/districts?icpp=100`, {
        next: { revalidate: 86400 }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch districts: ${response.statusText}`);
      }

      const result = (await response.json()) as TracuudiachiDistrictsResponse;
      if (!result.data) return [];

      return result.data.map((item) => ({
        id: String(item.code),
        name: item.name,
        fullName: item.name,
        provinceId
      }));
    } catch (error) {
      console.error(`HttpLocationRepository getDistricts Error for provinceId ${provinceId}:`, error);
      throw error;
    }
  }

  async getWards(districtId: string): Promise<Ward[]> {
    try {
      if (!districtId) return [];

      const response = await fetch(`${this.baseUrl}/districts/${districtId}?expand=wards`, {
        next: { revalidate: 86400 }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch wards: ${response.statusText}`);
      }

      const result = (await response.json()) as TracuudiachiDistrictWithWardsResponse;
      if (!result.data || !result.data.wards) return [];

      return result.data.wards.map((item) => ({
        id: String(item.code),
        name: item.name,
        fullName: item.name,
        districtId
      }));
    } catch (error) {
      console.error(`HttpLocationRepository getWards Error for districtId ${districtId}:`, error);
      throw error;
    }
  }
}
