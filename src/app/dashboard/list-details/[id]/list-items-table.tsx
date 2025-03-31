"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatToReais } from "@/lib/utils";

export function ListItemsTable({ itens }: { itens: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = itens.filter((item) =>
    item.material?.materiais?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Preço Unitário</TableHead>
              <TableHead className="text-right">Preço Total</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.material?.materiais || "N/A"}
                  </TableCell>
                  <TableCell>{item.material?.tipo || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    {item.quantidade}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {formatToReais(item.preco)}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {formatToReais(item.preco * Number(item.quantidade))}
                  </TableCell>
                  <TableCell>{item.observacoes || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm
                    ? "Nenhum material encontrado"
                    : "Nenhum item na lista"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
