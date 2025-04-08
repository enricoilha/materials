import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { MaterialItem } from "./materialItem";
import { Material } from "./types";

interface MaterialGroupProps {
  type: string;
  materials: Material[];
  isExpanded: boolean;
  missingItems: Set<string>;
  onToggleExpand: (type: string) => void;
  onToggleMissing: (materialId: string) => void;
}

export const MaterialGroup: React.FC<MaterialGroupProps> = ({
  type,
  materials,
  isExpanded,
  missingItems,
  onToggleExpand,
  onToggleMissing,
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center px-4 py-3 h-auto"
        onClick={() => onToggleExpand(type)}
      >
        <div className="flex items-center">
          <Package className="h-5 w-5 mr-2 text-muted-foreground" />
          <span className="font-medium">{type}</span>
          <Badge variant="outline" className="ml-2">
            {materials.length}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </Button>

      {isExpanded && (
        <div className="px-4 py-2 space-y-3">
          {materials.map((material) => (
            <MaterialItem
              key={material.id}
              material={material}
              isMissing={missingItems.has(material.id)}
              onToggleMissing={onToggleMissing}
            />
          ))}
        </div>
      )}
    </div>
  );
};
