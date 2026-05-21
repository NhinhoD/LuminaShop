/* eslint-disable @typescript-eslint/no-require-imports */
import { GetProvincesUseCase } from "@/application/use-cases/location/GetProvinces";
import { GetDistrictsUseCase } from "@/application/use-cases/location/GetDistricts";
import { GetWardsUseCase } from "@/application/use-cases/location/GetWards";

type Factory<T> = () => T;

export class LocationProvider {
  private static getProvincesFactory?: Factory<GetProvincesUseCase>;
  private static getDistrictsFactory?: Factory<GetDistrictsUseCase>;
  private static getWardsFactory?: Factory<GetWardsUseCase>;

  public static register(
    getProvinces: Factory<GetProvincesUseCase>,
    getDistricts: Factory<GetDistrictsUseCase>,
    getWards: Factory<GetWardsUseCase>
  ): void {
    this.getProvincesFactory = getProvinces;
    this.getDistrictsFactory = getDistricts;
    this.getWardsFactory = getWards;
  }

  public static getGetProvincesUseCase(): GetProvincesUseCase {
    if (!this.getProvincesFactory) {
      // Dynamically load the container to trigger auto-registration
      // This decouples the presentation layer compile-time import from infrastructure
      try {
        require("@/infrastructure/supabase/container");
      } catch (err) {
        throw new Error(
          `Failed to load composition root for LocationProvider: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }

    if (!this.getProvincesFactory) {
      throw new Error("LocationProvider.getProvincesFactory has not been registered.");
    }
    return this.getProvincesFactory();
  }

  public static getGetDistrictsUseCase(): GetDistrictsUseCase {
    if (!this.getDistrictsFactory) {
      try {
        require("@/infrastructure/supabase/container");
      } catch (err) {
        throw new Error(
          `Failed to load composition root for LocationProvider: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }

    if (!this.getDistrictsFactory) {
      throw new Error("LocationProvider.getDistrictsFactory has not been registered.");
    }
    return this.getDistrictsFactory();
  }

  public static getGetWardsUseCase(): GetWardsUseCase {
    if (!this.getWardsFactory) {
      try {
        require("@/infrastructure/supabase/container");
      } catch (err) {
        throw new Error(
          `Failed to load composition root for LocationProvider: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }

    if (!this.getWardsFactory) {
      throw new Error("LocationProvider.getWardsFactory has not been registered.");
    }
    return this.getWardsFactory();
  }
}
