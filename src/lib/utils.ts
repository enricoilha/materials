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