"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export type Material = {
  id: string;
  materiais: string;
  tipo: string;
  preco: number | null;
};

export const columns: ColumnDef<Material>[] = [
  {
    accessorKey: "materiais",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="whitespace-nowrap"
        >
          Nome do Material
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "tipo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string;
      const colorMap: { [key: string]: string } = {
        Metal: "bg-blue-500",
        Madeira: "bg-amber-500",
        Vidro: "bg-emerald-500",
        Plástico: "bg-purple-500",
      };
      return <Badge variant={"outline"}>{tipo}</Badge>;
    },
  },
  {
    accessorKey: "preco",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Preço
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, table }) => {
      const preco = Number.parseFloat(row.getValue("preco"));

      const updateData = (value: string) => {
        const newValue = Number.parseFloat(value);
        if (!isNaN(newValue)) {
          table.options.meta?.updateData(row.index, "preco", newValue);
        }
      };

      return (
        <Input
          type="number"
          value={preco}
          onChange={(e) => updateData(e.target.value)}
          className="w-24 text-right"
          step="0.01"
        />
      );
    },
  },
];
