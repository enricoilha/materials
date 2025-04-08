import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { formatToReais } from "@/lib/utils";
import { MaterialGroup } from "./materialGroup";
import { MissingItemsSummary } from "./missingItemsSummary";
import { Material, GroupedMaterials } from "./types";

interface MaterialsListProps {
  materials: Material[];
  isLoading: boolean;
  missingItems: Set<string>;
  onToggleMissing: (materialId: string) => void;
}

export const MaterialsList: React.FC<MaterialsListProps> = ({
  materials,
  isLoading,
  missingItems,
  onToggleMissing,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMaterials, setFilteredMaterials] =
    useState<Material[]>(materials);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Update filtered materials when search term or materials change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMaterials(materials);
      return;
    }

    const normalizedSearch = searchTerm.toLowerCase();
    const filtered = materials.filter(
      (material) =>
        material.material_name.toLowerCase().includes(normalizedSearch) ||
        (material.material_type &&
          material.material_type.toLowerCase().includes(normalizedSearch)) ||
        material.professional_name.toLowerCase().includes(normalizedSearch)
    );

    setFilteredMaterials(filtered);
  }, [searchTerm, materials]);

  // Group materials by type
  const groupedMaterials: GroupedMaterials = filteredMaterials.reduce(
    (groups, material) => {
      const type = material.material_type || "Sem categoria";
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(material);
      return groups;
    },
    {} as GroupedMaterials
  );

  // Calculate total quantities and values
  const totalQuantity = filteredMaterials.reduce(
    (sum, material) => sum + material.quantidade,
    0
  );
  const totalValue = filteredMaterials.reduce(
    (sum, material) => sum + material.preco * material.quantidade,
    0
  );

  // Toggle material expansion
  const toggleGroupExpand = (type: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Lista de Materiais</CardTitle>
        <CardDescription>
          Confirme todos os materiais que foram entregues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Buscar material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between p-2 bg-muted rounded-md text-sm">
              <div>
                <span className="font-medium">Total de Itens:</span>{" "}
                {filteredMaterials.length}
              </div>
              <div>
                <span className="font-medium">Quantidade:</span> {totalQuantity}
              </div>
              <div>
                <span className="font-medium">Valor:</span> R${" "}
                {formatToReais(totalValue)}
              </div>
            </div>

            {Object.entries(groupedMaterials).map(
              ([type, materialsInGroup]) => (
                <MaterialGroup
                  key={type}
                  type={type}
                  materials={materialsInGroup}
                  isExpanded={expandedGroups.has(type)}
                  missingItems={missingItems}
                  onToggleExpand={toggleGroupExpand}
                  onToggleMissing={onToggleMissing}
                />
              )
            )}

            <MissingItemsSummary
              missingItems={missingItems}
              materials={filteredMaterials}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm
              ? "Nenhum material encontrado"
              : "Não há listas para esta clínica"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
