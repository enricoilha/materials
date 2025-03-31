"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthlyTrends } from "@/components/dashboard/monthly-trends";
import { ClinicDistribution } from "@/components/dashboard/clinic-distribution";
import { RecentLists } from "@/components/dashboard/recent-lists";
import { MaterialsOverview } from "@/components/dashboard/materials-overview";
import { ProfessionalStats } from "@/components/dashboard/professional-stats";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    profissionaisAtivos: 0,
    totalProfissionais: 0,
    totalMateriais: 0,
    valorTotal: 0,
    crescimento: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) {
          throw new Error("Erro ao buscar estatísticas");
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Erro:", error);
        setError("Não foi possível carregar as estatísticas");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Relatórios
          </h1>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="mr-2">
              <Link href="/dashboard/monthly-report">
                Relatório por Período
              </Link>
            </Button>
            <Button asChild variant="outline" className="mr-2">
              <Link href="/dashboard/professional-history">
                Histórico de Profissionais
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/reports/export">Exportar Dados</Link>
            </Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {isLoading ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[100px]" />
                  ))}
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Profissionais com Listas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.profissionaisAtivos}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.totalProfissionais > 0
                          ? `${Math.round(
                              (stats.profissionaisAtivos /
                                stats.totalProfissionais) *
                                100
                            )}% do total`
                          : "0% do total"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Profissionais Ativos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalProfissionais}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total de profissionais cadastrados
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Materiais Utilizados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalMateriais.toLocaleString("pt-BR")}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total de itens em todas as listas
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Valor Total
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R${" "}
                        {(stats.valorTotal / 100).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.crescimento > 0
                          ? `+${stats.crescimento}% em relação ao mês anterior`
                          : `${stats.crescimento}% em relação ao mês anterior`}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Listas Recentes</CardTitle>
                  <CardDescription>
                    Últimas atividades nas listas de materiais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentLists />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Visão Geral de Materiais</CardTitle>
                  <CardDescription>Materiais mais utilizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <MaterialsOverview />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
