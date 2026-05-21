import { ILocationRepository } from '@/domain/repositories/ILocationRepository';
import { Province, District, Ward } from '@/domain/entities/Location';

interface EsgooResponse {
  error: number;
  error_text: string;
  data: Array<{
    id: string;
    name: string;
    full_name: string;
  }>;
}

export class HttpLocationRepository implements ILocationRepository {
  private readonly baseUrl = 'https://esgoo.net/api-tinhthanh';

  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${this.baseUrl}/1/0.htm`, {
        next: { revalidate: 86400 } // Cache for 24 hours in Next.js
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch provinces: ${response.statusText}`);
      }

      const result = (await response.json()) as EsgooResponse;
      if (result.error !== 0) {
        throw new Error(`API Error fetching provinces: ${result.error_text}`);
      }

      return result.data.map((item) => ({
        id: item.id,
        name: item.name,
        fullName: item.full_name
      }));
    } catch (error) {
      console.error('HttpLocationRepository getProvinces Error:', error);
      throw error;
    }
  }

  async getDistricts(provinceId: string): Promise<District[]> {
    try {
      if (!provinceId) return [];

      const response = await fetch(`${this.baseUrl}/2/${provinceId}.htm`, {
        next: { revalidate: 86400 }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch districts: ${response.statusText}`);
      }

      const result = (await response.json()) as EsgooResponse;
      if (result.error !== 0) {
        throw new Error(`API Error fetching districts: ${result.error_text}`);
      }

      return result.data.map((item) => ({
        id: item.id,
        name: item.name,
        fullName: item.full_name,
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

      const response = await fetch(`${this.baseUrl}/3/${districtId}.htm`, {
        next: { revalidate: 86400 }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch wards: ${response.statusText}`);
      }

      const result = (await response.json()) as EsgooResponse;
      if (result.error !== 0) {
        throw new Error(`API Error fetching wards: ${result.error_text}`);
      }

      return result.data.map((item) => ({
        id: item.id,
        name: item.name,
        fullName: item.full_name,
        districtId
      }));
    } catch (error) {
      console.error(`HttpLocationRepository getWards Error for districtId ${districtId}:`, error);
      throw error;
    }
  }
}
