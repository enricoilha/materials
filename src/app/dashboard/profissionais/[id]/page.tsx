import { notFound } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "../../../../../database.types";
import { ProfessionalHeader } from "@/components/professionals/professionals-header";
import { ListsHistory } from "@/components/professionals/lists-history";
import { StatsCard } from "@/components/professionals/stats-card";
import { formatCurrency } from "@/lib/utils";
import { ButtonWithTooltip } from "@/components/ButtonWithTooltip";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ProfessionalPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient<Database>({ cookies });

  // Fetch the professional details with clinic info
  const { data: professional, error: professionalError } = await supabase
    .from("profissionais")
    .select(
      `
      *,
      clinicas(*)
    `
    )
    .eq("id", params.id)
    .single();

  if (professionalError || !professional) {
    console.error("Error fetching professional:", professionalError);
    return notFound();
  }

  // Fetch the lists created by this professional
  const { data: lists, error: listsError } = await supabase
    .from("listas")
    .select(
      `
      *,
      clinicas (
        id,
        sindicato,
        endereco
      )
    `
    )
    .eq("profissional_id", params.id)
    .order("created_at", { ascending: false });

  if (listsError) {
    console.error("Error fetching lists:", listsError);
    return notFound();
  }

  const totalLists = lists ? lists.length : 0;
  const pendingLists = lists
    ? lists.filter((list) => list.status === "not_filled").length
    : 0;
  const approvedLists = lists
    ? lists.filter((list) => list.status === "filled").length
    : 0;
  const totalValue = lists
    ? lists.reduce((sum, list) => sum + (list.preco_total || 0), 0)
    : 0;

  const listsByMonth: Record<string, number> = {};

  lists?.forEach((list) => {
    if (list.created_at) {
      const monthKey = format(new Date(list.created_at), "MMM yyyy", {
        locale: ptBR,
      });
      listsByMonth[monthKey] = (listsByMonth[monthKey] || 0) + 1;
    }
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <ButtonWithTooltip tooltipText="Voltar">
        <Link href={"/dashboard/profissionais"}>
          <div className="px-4 py-2">
            <ArrowLeft size={20} />
          </div>
        </Link>
      </ButtonWithTooltip>
      <ProfessionalHeader professional={professional} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total de Listas"
          value={totalLists.toString()}
          icon="list"
        />
        <StatsCard
          title="Listas Pendentes"
          value={pendingLists.toString()}
          icon="clock"
        />
        <StatsCard
          title="Valor Total"
          value={formatCurrency(totalValue)}
          icon="dollar"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Histórico de Listas</h2>
        {lists && lists.length > 0 ? (
          <ListsHistory lists={lists} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">
              Este profissional ainda não possui listas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
