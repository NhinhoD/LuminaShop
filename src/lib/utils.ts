import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale: string = "vi") {
  if (locale === "en") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDate(date: Date | string, locale: string = "vi") {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateSKU(productName: string, variantName?: string): string {
  const pPart = productName.toUpperCase().trim().replace(/[\s_-]+/g, '-');
  if (!variantName) return pPart;
  const vPart = variantName.toUpperCase().trim().replace(/[\s_-]+/g, '-');
  return `${pPart}-${vPart}`;
}
