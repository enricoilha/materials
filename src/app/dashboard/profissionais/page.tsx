"use client";

import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function ProfissionaisPage() {
  const { data } = useQuery({
    queryKey: ["profissionais-page"],
    queryFn: async () => {
      const { data: professionalsData, error: professionalsError } =
        await supabase.from("profissionais").select("*");

      if (professionalsError) {
        throw professionalsError;
      }

      return professionalsData;
    },
  });
  return (
    <>
      <main className="w-full max-w-[1200px]">
        <PageHeader
          title="Profissionais"
          description="Consulte e gerencie informações dos profissionais cadastrados no sistema"
        />

        {data && (
          <div className="mt-10 w-full">
            <p className="font-medium text-sm mb-1">Filtrar Data:</p>

            <DataTable data={data} />
          </div>
        )}
      </main>
    </>
  );
}
