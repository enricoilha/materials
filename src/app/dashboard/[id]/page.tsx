"use client";
import { ButtonWithTooltip } from "@/components/ButtonWithTooltip";
import ListHeader from "@/components/lists/list-header";
import ListItems from "@/components/lists/list-items";
import ListSummary from "@/components/lists/list-summary";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Divide } from "lucide-react";
import { notFound, useParams, useRouter } from "next/navigation";

export default function ListaPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["list-page"],
    queryFn: async () => {
      if (!id) return;
      const { data: list, error: listError } = await supabase
        .from("listas")
        .select(
          `
            *,
            clinicas (
              id,
              sindicato,
              endereco
            ),
            profissionais (
              id,
              nome,
              funcao
            )
          `
        )
        .eq("id", id)
        .single();

      if (listError || !list) {
        console.error("Error fetching list:", listError);
        return notFound();
      }

      const { data: listItems, error: itemsError } = await supabase
        .from("lista_materiais_itens")
        .select(
          `
      *,
      materiais (
        id,
        materiais,
        preco,
        tipo
      )
    `
        )
        .eq("lista_id", id);

      if (itemsError) {
        console.error("Error fetching list items:", itemsError);
        return notFound();
      }

      return { listItems, list };
    },
  });
  return (
    <>
      <ButtonWithTooltip tooltipText="Voltar">
        <div onClick={() => router.back()} className="px-4 py-2">
          <ArrowLeft size={20} />
        </div>
      </ButtonWithTooltip>
      <div className="container mx-auto py-8 px-4">
        {isLoading ? (
          <div>Carregando...</div>
        ) : !data ? (
          <div>Erro ao carregar dados</div>
        ) : (
          <>
            <ListHeader
              list={data.list}
              clinic={data.list.clinicas}
              professional={data.list.profissionais}
            />

            {data.listItems.length > 0 ? (
              <>
                <div className="mt-8">
                  <ListItems items={data.listItems} />
                </div>

                <div className="mt-8">
                  <ListSummary
                    items={data.listItems}
                    status={data.list.status}
                    totalPrice={data.list.preco_total}
                  />
                </div>
              </>
            ) : (
              <div className="mt-8 text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  Nenhum item encontrado nesta lista.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
