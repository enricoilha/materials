import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { capitalizeWords, formatToReais } from "@/lib/utils";
import { Material } from "./types";

interface MaterialItemProps {
  material: Material;
  isMissing: boolean;
  onToggleMissing: (materialId: string) => void;
}

export const MaterialItem: React.FC<MaterialItemProps> = ({
  material,
  isMissing,
  onToggleMissing,
}) => {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-md ${
        isMissing ? "bg-destructive/10" : "hover:bg-accent"
      }`}
    >
      <div className="flex items-center">
        <Checkbox
          id={`missing-${material.id}`}
          checked={isMissing}
          onCheckedChange={() => onToggleMissing(material.id)}
        />
        <div className="ml-3">
          <div className="font-medium">
            {capitalizeWords(material.material_name)}
          </div>
          <div className="text-xs text-muted-foreground">
            Para: {material.professional_name}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm">{material.quantidade}x</div>
        <div className="text-xs text-muted-foreground">
          R$ {formatToReais(material.preco * material.quantidade)}
        </div>
      </div>
    </div>
  );
};
