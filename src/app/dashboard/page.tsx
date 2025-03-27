"use client";

import { DatePickerRange } from "@/components/DatePickerRange";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/table/data-table";
import { TableSummary } from "@/components/TableSummary";
import { supabase } from "@/lib/supabase";
import { useDateRangeStore } from "@/stores/date";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function Home() {
  const { dateRange, setDateRange } = useDateRangeStore();
  const { data, refetch } = useQuery({
    queryKey: ["table-data"],
    queryFn: async () => {
      if (dateRange.from === undefined || !dateRange.to === undefined)
        throw new Error("There is no date selected");

      const { data: listas, error } = await supabase
        .from("listas")
        .select(
          `id, descricao, status, created_at, profissional_id(nome, email), clinica_id(*), preco_total, filled_at,lista_materiais_itens(material_id(materiais), quantidade)`
        )
        .gte("created_at", new Date(dateRange?.from).toISOString())
        .lte("created_at", new Date(dateRange?.to).toISOString())
        .order("status", "filled");

      if (error) throw error;

      return listas;
    },
  });

  useEffect(() => {
    refetch();
  }, [dateRange]);

  return (
    <>
      <main className="w-full max-w-[1500px]">
        <PageHeader
          title="Listas"
          description="Gerencie e acompanhe listas de materiais com profissionais, clínicas e itens de inventário associados."
        />

        {data && (
          <div className="mt-10 w-full">
            <p className="font-medium text-sm mb-1">Filtrar Data:</p>
            <TableSummary data={data} dateRange={dateRange} />

            <DatePickerRange date={dateRange} setDate={setDateRange} />

            <DataTable data={data} />
          </div>
        )}
      </main>
    </>
  );
}
