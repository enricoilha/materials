"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ListHeader } from "./list-header";
import { ListItemsTable } from "./list-items-table";
import { ListSummary } from "./list-summary";
import { ListActions } from "./list-actions";
import { DeliveryConfirmation } from "@/components/delivery/delivery-confirmation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusMap = {
  pending: { label: "Pendente", variant: "outline" },
  filled: { label: "Preenchida", variant: "default" },
  delivered: { label: "Entregue", variant: "success" },
};

export default function ListDetailsPage() {
  const params = useParams();
  const listaId = params.id as string;
  const [lista, setLista] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [deliveryConfirmation, setDeliveryConfirmation] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchListDetails() {
      try {
        const response = await fetch(`/api/reports/list-details/${listaId}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar detalhes da lista");
        }
        const data = await response.json();
        setLista(data.lista);
        setItens(data.itens);
        setDeliveryConfirmation(data.deliveryConfirmation);
      } catch (error) {
        console.error("Erro ao buscar detalhes da lista:", error);
        setError("Erro ao carregar detalhes da lista");
      } finally {
        setIsLoading(false);
      }
    }

    fetchListDetails();
  }, [listaId]);

  const handleDeliveryConfirm = async (photoUrl: string) => {
    try {
      const response = await fetch(`/api/delivery/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listaId,
          photoUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao confirmar entrega");
      }

      // Refresh list details
      const updatedResponse = await fetch(
        `/api/reports/list-details/${listaId}`
      );
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        setLista(data.lista);
        setItens(data.itens);
        setDeliveryConfirmation(data.deliveryConfirmation);
      }
    } catch (error) {
      console.error("Erro ao confirmar entrega:", error);
      throw error;
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Detalhes da Lista
            </h1>
            <Button asChild variant="outline">
              <Link href="/">Voltar ao Dashboard</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Detalhes da Lista
            </h1>
            <p className="text-muted-foreground">ID: {listaId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/reports/monthly-report">
                Voltar ao Relatório Mensal
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Voltar ao Dashboard</Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Carregando detalhes da lista...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {lista && <ListHeader lista={lista} statusMap={statusMap} />}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Itens da Lista</CardTitle>
                  <CardDescription>
                    Materiais solicitados nesta lista
                  </CardDescription>
                </div>
                <ListActions listaId={listaId} />
              </CardHeader>
              <CardContent>
                <ListItemsTable itens={itens} />
                <Separator className="my-4" />
                <ListSummary itens={itens} />
              </CardContent>
            </Card>

            {user && lista?.status === "filled" && !deliveryConfirmation && (
              <DeliveryConfirmation
                listaId={listaId}
                items={itens}
                onConfirm={handleDeliveryConfirm}
              />
            )}

            {deliveryConfirmation && (
              <Card>
                <CardHeader>
                  <CardTitle>Confirmação de Entrega</CardTitle>
                  <CardDescription>
                    Materiais entregues em{" "}
                    {format(
                      new Date(deliveryConfirmation.confirmed_at),
                      "PPP",
                      {
                        locale: ptBR,
                      }
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                      src={deliveryConfirmation.photo_url}
                      alt="Foto dos materiais entregues"
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
