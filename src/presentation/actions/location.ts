"use server";

import {
  makeGetProvincesUseCase,
  makeGetDistrictsUseCase,
  makeGetWardsUseCase
} from "@/infrastructure/supabase/container";

export async function getProvincesAction() {
  const useCase = makeGetProvincesUseCase();
  const result = await useCase.execute();

  if (!result.success) {
    return { error: result.error.message };
  }

  return { data: result.data };
}

export async function getDistrictsAction(provinceId: string) {
  if (!provinceId) return { data: [] };
  const useCase = makeGetDistrictsUseCase();
  const result = await useCase.execute(provinceId);

  if (!result.success) {
    return { error: result.error.message };
  }

  return { data: result.data };
}

export async function getWardsAction(districtId: string) {
  if (!districtId) return { data: [] };
  const useCase = makeGetWardsUseCase();
  const result = await useCase.execute(districtId);

  if (!result.success) {
    return { error: result.error.message };
  }

  return { data: result.data };
}
