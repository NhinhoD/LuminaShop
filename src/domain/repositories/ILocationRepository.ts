import { Province, District, Ward } from '../entities/Location';

export interface ILocationRepository {
  getProvinces(): Promise<Province[]>;
  getDistricts(provinceId: string): Promise<District[]>;
  getWards(districtId: string): Promise<Ward[]>;
}
