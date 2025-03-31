"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
import { ListActions } from "./list-actions";
import { ListItemsTable } from "./list-items-table";
import { ListSummary } from "./list-summary";

export default function ListDetailsPage() {
  const params = useParams();
  const listaId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [lista, setLista] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/reports/list-details/${listaId}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar detalhes da lista");
        }
        const data = await response.json();
        setLista(data.lista);
        setItens(data.itens);
      } catch (error) {
        console.error("Erro ao buscar detalhes da lista:", error);
        setError("Não foi possível carregar os detalhes da lista");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [listaId]);

  const statusMap = {
    not_filled: { label: "Não Preenchida", variant: "outline" },
    filled: { label: "Preenchida", variant: "default" },
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
          </div>
        )}
      </main>
    </div>
  );
}
