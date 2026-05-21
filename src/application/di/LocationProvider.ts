import { GetProvincesUseCase } from "@/application/use-cases/location/GetProvinces";
import { GetDistrictsUseCase } from "@/application/use-cases/location/GetDistricts";
import { GetWardsUseCase } from "@/application/use-cases/location/GetWards";

type Factory<T> = () => T;

export class LocationProvider {
  private static getProvincesFactory?: Factory<GetProvincesUseCase>;
  private static getDistrictsFactory?: Factory<GetDistrictsUseCase>;
  private static getWardsFactory?: Factory<GetWardsUseCase>;

  public static registerProvincesFactory(factory: Factory<GetProvincesUseCase>): void {
    this.getProvincesFactory = factory;
  }

  public static registerDistrictsFactory(factory: Factory<GetDistrictsUseCase>): void {
    this.getDistrictsFactory = factory;
  }

  public static registerWardsFactory(factory: Factory<GetWardsUseCase>): void {
    this.getWardsFactory = factory;
  }

  public static getGetProvincesUseCase(): GetProvincesUseCase {
    if (!this.getProvincesFactory) {
      throw new Error("LocationProvider.getProvincesFactory has not been registered.");
    }
    return this.getProvincesFactory();
  }

  public static getGetDistrictsUseCase(): GetDistrictsUseCase {
    if (!this.getDistrictsFactory) {
      throw new Error("LocationProvider.getDistrictsFactory has not been registered.");
    }
    return this.getDistrictsFactory();
  }

  public static getGetWardsUseCase(): GetWardsUseCase {
    if (!this.getWardsFactory) {
      throw new Error("LocationProvider.getWardsFactory has not been registered.");
    }
    return this.getWardsFactory();
  }
}

