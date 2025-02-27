"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InputPreco } from "@/components/InputPreco";
import { capitalizeWords } from "@/lib/utils";

export type Profissional = {
  id: string;
  nome: string;
  funcao: string | null;
  clinica: string | null;
  created_at: string | null;
  sindicato: string | null;
  endereco: string | null;
  email: string | null;
  telefone: string | null;
  id_clinica: number | null;
  login: string | null;
};

export const columns: ColumnDef<Profissional>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => <div>{row.getValue("nome")}</div>,
  },
  {
    accessorKey: "funcao",
    header: "Função",
    cell: ({ row }) => <div>{row.getValue("funcao") || "-"}</div>,
  },
  {
    accessorKey: "clinica",
    header: "Clínica",
    cell: ({ row }) => <div>{row.getValue("clinica") || "-"}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email") || "-"}</div>,
  },

  {
    accessorKey: "sindicato",
    header: "Sindicato",
    cell: ({ row }) => <div>{row.getValue("sindicato") || "-"}</div>,
  },
];
