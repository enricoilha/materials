"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const statusMap = {
  filled: { label: "Preenchida", variant: "default" },
  not_filled: { label: "Não Preenchida", variant: "outline" },
  delivered: { label: "Entregue", variant: "success" },
  default: { label: "Desconhecido", variant: "outline" },
};

const getStatusBadge = (status: string) => {
  const statusInfo =
    statusMap[status as keyof typeof statusMap] || statusMap.default;
  return (
    <Badge variant={statusInfo.variant as "outline" | "default" | "success"}>
      {statusInfo.label}
    </Badge>
  );
};

export function RecentLists() {
  const [lists, setLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard/recent-lists");
        if (!response.ok) {
          throw new Error("Erro ao buscar listas recentes");
        }
        const data = await response.json();
        setLists(data);
      } catch (error) {
        console.error("Erro:", error);
        setError("Não foi possível carregar as listas recentes");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* <TableHead>Descrição</TableHead> */}
          <TableHead>Profissional</TableHead>
          {/* <TableHead>Clínica</TableHead> */}
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lists.length > 0 ? (
          lists.map((list) => (
            <TableRow key={list.id}>
              {/* <TableCell>{list.descricao || "Lista de materiais"}</TableCell> */}
              <TableCell>{list.profissional}</TableCell>
              {/* <TableCell>{list.clinica}</TableCell> */}
              <TableCell>{getStatusBadge(list.status)}</TableCell>
              <TableCell>
                {new Date(list.data).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell className="text-right">
                {list.valor > 0
                  ? `R$ ${(list.valor / 100).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  : "-"}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              Nenhuma lista encontrada
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
