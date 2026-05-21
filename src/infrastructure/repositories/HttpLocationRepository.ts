import { ILocationRepository } from '@/domain/repositories/ILocationRepository';
import { Province, District, Ward } from '@/domain/entities/Location';

interface OpenApiProvinceResponse {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
}

interface OpenApiProvinceWithDistrictsResponse {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  districts: Array<{
    name: string;
    code: number;
    division_type: string;
    codename: string;
    province_code: number;
  }>;
}

interface OpenApiDistrictWithWardsResponse {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
  wards: Array<{
    name: string;
    code: number;
    division_type: string;
    codename: string;
    province_code: number;
  }>;
}

export class HttpLocationRepository implements ILocationRepository {
  private readonly baseUrl = 'https://provinces.open-api.vn/api';

  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${this.baseUrl}/p/`, {
        next: { revalidate: 86400 } // Cache for 24 hours in Next.js
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch provinces: ${response.statusText}`);
      }

      const result = (await response.json()) as OpenApiProvinceResponse[];
      
      return result.map((item) => ({
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

      const response = await fetch(`${this.baseUrl}/p/${provinceId}?depth=2`, {
        next: { revalidate: 86400 }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch districts: ${response.statusText}`);
      }

      const result = (await response.json()) as OpenApiProvinceWithDistrictsResponse;
      if (!result.districts) return [];

      return result.districts.map((item) => ({
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

      const response = await fetch(`${this.baseUrl}/d/${districtId}?depth=2`, {
        next: { revalidate: 86400 }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch wards: ${response.statusText}`);
      }

      const result = (await response.json()) as OpenApiDistrictWithWardsResponse;
      if (!result.wards) return [];

      return result.wards.map((item) => ({
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

