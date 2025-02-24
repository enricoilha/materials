"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { capitalizeWords } from "@/lib/utils";

export type Lista = {
  id: string;
  descricao: string;
  profissional_id: {
    nome: string;
    email: string;
  };
  clinica_id: {
    sindicato: string;
  };
  status: "filled" | "not_filled";
  created_at: string;
  lista_materiais_itens?: {
    material_id: {
      materiais: string;
    };
    quantidade: number;
  }[];
};

export const columns: ColumnDef<Lista>[] = [
  {
    accessorKey: "profissional_id",
    header: "Profissional",
    cell: ({ row }) => (
      <div>
        <div className=" font-light">
          {capitalizeWords(row.original.profissional_id.nome)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "clinica_id",
    header: "Clínica",
    cell: ({ row }) => capitalizeWords(row.original.clinica_id.sindicato),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div
          className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${
            status === "filled"
              ? "bg-green-100 text-green-800"
              : status === "not_filled"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status === "filled" ? "Preenchido" : "Não preenchido"}
        </div>
      );
    },
  },

  {
    accessorKey: "lista_materiais_itens",
    header: "Itens",
    cell: ({ row }) => (
      <div className="">
        {(
          row.getValue(
            "lista_materiais_itens"
          ) as Lista["lista_materiais_itens"]
        )?.length ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Data de Criação",
    cell: ({ row }) => (
      <div className="w-44">
        {format(new Date(row.getValue("created_at")), "dd/MM/yyyy HH:mm")}
      </div>
    ),
  },
  // {
  //   id: "actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const lista = row.original;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Abrir menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Ações</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={() => navigator.clipboard.writeText(lista.id)}
  //           >
  //             Copiar ID da lista
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
  //           <DropdownMenuItem>Editar lista</DropdownMenuItem>
  //           <DropdownMenuItem>Arquivar lista</DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];
