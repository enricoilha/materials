"use client";

import { DatePickerRange } from "@/components/DatePickerRange";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/table/data-table";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { addDays } from "date-fns";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

export default function Home() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["table-data"],
    queryFn: async () => {
      if (date.from === undefined || !date.to === undefined)
        throw new Error("There is no date selected");

      const { data: listas, error } = await supabase
        .from("listas")
        .select(
          `id, descricao, status, created_at, profissional_id(nome, email), clinica_id(*),
           lista_materiais_itens(material_id(materiais), quantidade)`
        )
        .gte("created_at", new Date(date?.from).toISOString())
        .lte("created_at", new Date(date?.to).toISOString());

      if (error) throw error;

      return listas;
    },
  });

  useEffect(() => {
    refetch();
  }, [date]);
  console.log(isError);

  return (
    <>
      <main className="w-full max-w-[1200px] mx-auto">
        <PageHeader
          title="Listas"
          description="Gerencie e acompanhe listas de materiais com profissionais, clínicas e itens de inventário associados."
        />

        {data && (
          <div className="mt-10 w-full">
            <p className="font-medium text-sm mb-1">Filtrar Data:</p>
            <DatePickerRange date={date} setDate={setDate} />

            <DataTable data={data} />
          </div>
        )}
      </main>
    </>
  );
}
