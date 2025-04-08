import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";
import { Material } from "@/components/dashboard/admin/types";

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

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}
export function formatId(id: string): string {
  return id.substring(0, 8).toUpperCase();
}
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";

  // Converter de centavos para reais
  const valueInReais = value / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInReais);
}

export function getMonthName(month: string): string {
  if (!month) return "";

  // Formato esperado: YYYY-MM ou MM/YYYY
  let year, monthNumber;

  if (month.includes("-")) {
    [year, monthNumber] = month.split("-");
  } else if (month.includes("/")) {
    [monthNumber, year] = month.split("/");
  } else {
    return month; // Retorna o próprio valor se não estiver em um formato reconhecido
  }

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const index = Number.parseInt(monthNumber, 10) - 1;
  if (isNaN(index) || index < 0 || index > 11) return month;

  return `${monthNames[index]}/${year}`;
}

// Convert a data URL to a File object
export const dataURLtoFile = async (
  dataUrl: string,
  filename: string,
): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/png" });
};

// Upload photo to Supabase storage
export const uploadPhotoToStorage = async (
  file: File,
  clinicId: number,
  filename: string,
): Promise<string> => {
  const path = `delivery-photos/clinics/${clinicId}/${filename}`;

  const { error } = await supabase.storage
    .from("confirmations")
    .upload(path, file);

  if (error) throw error;

  return supabase.storage
    .from("confirmations")
    .getPublicUrl(path).data.publicUrl;
};

// Upload signature to Supabase storage
export const uploadSignatureToStorage = async (
  signatureData: string,
  clinicId: number,
  filename: string,
): Promise<string> => {
  const supabase = createClientComponentClient();
  const signatureFile = await dataURLtoFile(signatureData, "signature.png");
  const path = `signatures/clinics/${clinicId}/${filename}`;

  const { error } = await supabase.storage
    .from("confirmations")
    .upload(path, signatureFile);

  if (error) throw error;

  return supabase.storage
    .from("confirmations")
    .getPublicUrl(path).data.publicUrl;
};

// Calculate statistics about missing items
export const calculateMissingItemsStats = (
  materials: Material[],
  missingItems: Set<string>,
) => {
  if (missingItems.size === 0) {
    return { count: 0, quantity: 0, value: 0 };
  }

  const missingQuantity = materials
    .filter((mat) => missingItems.has(mat.id))
    .reduce((sum, mat) => sum + mat.quantidade, 0);

  const missingValue = materials
    .filter((mat) => missingItems.has(mat.id))
    .reduce((sum, mat) => sum + mat.preco * mat.quantidade, 0);

  return {
    count: missingItems.size,
    quantity: missingQuantity,
    value: missingValue,
  };
};
