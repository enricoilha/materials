import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeWords(str?: string) {
  if (!str) return "";

  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const formatToReais = (value: number): string => {
  return (value / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseFromReais = (formatted: string): number => {
  const cleaned = formatted.replace(/[^\d,.]/g, "");

  const normalized = cleaned.replace(/\./g, "").replace(",", ".");

  return Math.round(parseFloat(normalized || "0") * 100);
};
