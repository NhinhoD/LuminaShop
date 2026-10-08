"use server";

import {
  makeGetProvincesUseCase,
  makeGetDistrictsUseCase,
  makeGetWardsUseCase,
} from "@/server/di/container";
import { Province, District, Ward } from "@/server/domain/entities/Location";
import { z } from "zod";


type ActionResult<T> = 
  | { data: T; error?: never }
  | { error: string; data?: never };

const provinceIdSchema = z.string().min(1, "Province ID is required");
const districtIdSchema = z.string().min(1, "District ID is required");

/**
 * Retrieves the full list of provinces/cities via GetProvincesUseCase.
 *
 * @returns {Promise<ActionResult<Province[]>>} Result containing province list or error message.
 */
export async function getProvincesAction(): Promise<ActionResult<Province[]>> {
  try {
    const useCase = makeGetProvincesUseCase();
    const result = await useCase.execute();

    if (!result.success) {
      return { error: result.error.message };
    }

    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Không thể tải danh sách Tỉnh/Thành phố"
    };
  }
}

/**
 * Retrieves the list of districts for a given province ID.
 *
 * @param {string} provinceId - Identifier of the parent province.
 * @returns {Promise<ActionResult<District[]>>} Result containing district list or error message.
 */
export async function getDistrictsAction(provinceId: string): Promise<ActionResult<District[]>> {
  try {
    const validation = provinceIdSchema.safeParse(provinceId);
    if (!validation.success) {
      return { data: [] };
    }

    const useCase = makeGetDistrictsUseCase();
    const result = await useCase.execute(validation.data);

    if (!result.success) {
      return { error: result.error.message };
    }

    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Không thể tải danh sách Quận/Huyện"
    };
  }
}

/**
 * Retrieves the list of wards for a given district ID.
 *
 * @param {string} districtId - Identifier of the parent district.
 * @returns {Promise<ActionResult<Ward[]>>} Result containing ward list or error message.
 */
export async function getWardsAction(districtId: string): Promise<ActionResult<Ward[]>> {
  try {
    const validation = districtIdSchema.safeParse(districtId);
    if (!validation.success) {
      return { data: [] };
    }

    const useCase = makeGetWardsUseCase();
    const result = await useCase.execute(validation.data);

    if (!result.success) {
      return { error: result.error.message };
    }

    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Không thể tải danh sách Phường/Xã"
    };
  }
}


