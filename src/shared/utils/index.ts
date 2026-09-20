import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./utils";
export * from "./locale";
export * from "./url";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}
