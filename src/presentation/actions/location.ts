"use server";

import {
  makeGetProvincesUseCase,
  makeGetDistrictsUseCase,
  makeGetWardsUseCase
} from "@/infrastructure/supabase/container";
import { Province, District, Ward } from "@/domain/entities/Location";
import { z } from "zod";

type ActionResult<T> = 
  | { data: T; error?: never }
  | { error: string; data?: never };

const provinceIdSchema = z.string().min(1, "Province ID is required");
const districtIdSchema = z.string().min(1, "District ID is required");

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

