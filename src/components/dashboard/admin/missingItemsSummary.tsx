import React from "react";
import { AlertCircle } from "lucide-react";
import { formatToReais } from "@/lib/utils";
import { Material } from "./types";

interface MissingItemsSummaryProps {
  missingItems: Set<string>;
  materials: Material[];
}

export const MissingItemsSummary: React.FC<MissingItemsSummaryProps> = ({
  missingItems,
  materials,
}) => {
  if (missingItems.size === 0) {
    return null;
  }

  // Calculate missing quantities and values
  const missingQuantity = materials
    .filter((mat) => missingItems.has(mat.id))
    .reduce((sum, mat) => sum + mat.quantidade, 0);

  const missingValue = materials
    .filter((mat) => missingItems.has(mat.id))
    .reduce((sum, mat) => sum + mat.preco * mat.quantidade, 0);

  return (
    <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
      <div className="flex items-center gap-2 text-destructive mb-2">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">Itens em Falta</span>
      </div>
      <div className="text-sm mb-2">
        <span>
          {missingItems.size} itens marcados como faltantes (total de{" "}
          {missingQuantity} unidades)
        </span>
      </div>
      <div className="text-sm">
        <span className="font-medium">Valor total faltante: </span>
        <span>R$ {formatToReais(missingValue)}</span>
      </div>
    </div>
  );
};
