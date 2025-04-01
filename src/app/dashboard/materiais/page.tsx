"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "../../../../database.types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { capitalizeWords, formatToReais } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { InputPreco } from "@/components/InputPreco";

type Material = Database["public"]["Tables"]["materiais"]["Row"];

const handlePrecoChange = async (
  id: string,
  novoPreco: number,
  setMateriais: React.Dispatch<React.SetStateAction<Material[]>>
) => {
  try {
    const { error } = await supabase
      .from("materiais")
      .update({ preco: novoPreco })
      .eq("id", id);

    if (error) throw error;

    setMateriais((prevMateriais) =>
      prevMateriais.map((material) =>
        material.id === id ? { ...material, preco: novoPreco } : material
      )
    );
    toast.success("Preço atualizado com sucesso");
  } catch (error) {
    console.error("Erro ao atualizar preço:", error);
    toast.error("Erro ao atualizar preço");
  }
};

const columns = (
  setMateriais: React.Dispatch<React.SetStateAction<Material[]>>
): ColumnDef<Material>[] => [
  {
    accessorKey: "materiais",
    header: "Material",
    cell: ({ row }) => capitalizeWords(row.original.materiais) || "-",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => row.original.tipo || "-",
  },
  {
    accessorKey: "preco",
    header: "Preço",
    cell: ({ row, table }) => {
      return (
        <div className="flex items-center gap-2">
          <span className="font-light">R$</span>
          <InputPreco row={row} table={table} />
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const material = row.original;
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handlePrecoChange(material.id, material.preco, setMateriais)
          }
        >
          Salvar
        </Button>
      );
    },
  },
];

export default function MateriaisPage() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetchMateriais();
  }, []);

  const fetchMateriais = async () => {
    try {
      const { data, error } = await supabase
        .from("materiais")
        .select("*")
        .order("materiais", { ascending: true });

      if (error) throw error;
      setMateriais(data || []);
    } catch (error) {
      console.error("Erro ao buscar materiais:", error);
      toast.error("Erro ao carregar materiais");
    } finally {
      setLoading(false);
    }
  };

  const table = useReactTable({
    data: materiais,
    columns: columns(setMateriais),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Gerenciar Preços dos Materiais
      </h1>

      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar material..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm w-[30%]">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próxima
        </Button>
        <span className="flex items-center gap-1 text-sm">
          <div>Página</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </strong>
        </span>
      </div>
    </div>
  );
}
