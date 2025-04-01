"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { DateRange } from "react-day-picker";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { DatePickerWithRange } from "@/components/dashboard/date-range-picker";
import { formatToReais } from "@/lib/utils";

export default function MonthlyReportPage() {
  // Definir intervalo padrão como o mês atual
  const currentDate = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(currentDate),
    to: endOfMonth(currentDate),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>({
    totalProfissionais: 0,
    totalPreenchidas: 0,
    totalPendentes: 0,
    valorTotal: 0,
    profissionais: [],
  });

  useEffect(() => {
    async function fetchData() {
      if (!dateRange?.from || !dateRange?.to) return;

      setIsLoading(true);
      try {
        // Construir URL com parâmetros de data
        const url = `/api/reports/monthly?startDate=${format(
          dateRange.from,
          "yyyy-MM-dd"
        )}&endDate=${format(dateRange.to, "yyyy-MM-dd")}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Erro ao buscar dados");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Erro ao buscar dados do relatório mensal:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dateRange]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const statusMap = {
    filled: { label: "Preenchida", variant: "default" },
    not_filled: { label: "Não Preenchida", variant: "outline" },
  };

  // Função para formatar data
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  // Função para formatar o nome do mês
  const getMonthName = (month: string): string => {
    if (!month) return "";

    // Formato esperado: YYYY-MM ou MM/YYYY
    let year, monthNumber;

    if (month.includes("-")) {
      [year, monthNumber] = month.split("-");
    } else if (month.includes("/")) {
      [monthNumber, year] = month.split("/");
    } else {
      return month; // Retorna o próprio valor se não estiver em um formato reconhecido
    }

    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const index = Number.parseInt(monthNumber, 10) - 1;
    if (isNaN(index) || index < 0 || index > 11) return month;

    return `${monthNames[index]}/${year}`;
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Relatório por Período
          </h1>
          {/* <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/">Voltar ao Dashboard</Link>
            </Button>
          </div> */}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Período de Análise
            </label>
            <DatePickerWithRange
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>

          <div className="flex items-end">
            <Button>Exportar Relatório</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Carregando dados...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Profissionais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.totalProfissionais}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Listas Preenchidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.totalPreenchidas}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.totalProfissionais > 0
                      ? `${Math.round(
                          (data.totalPreenchidas / data.totalProfissionais) *
                            100
                        )}% do total`
                      : "0% do total"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Listas Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.totalPendentes}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.totalProfissionais > 0
                      ? `${Math.round(
                          (data.totalPendentes / data.totalProfissionais) * 100
                        )}% do total`
                      : "0% do total"}
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
                    R$ {formatToReais(data.valorTotal)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Listas de Profissionais</CardTitle>
                <CardDescription>
                  Detalhamento das listas de materiais por profissional
                  {dateRange?.from && dateRange?.to && (
                    <>
                      {" "}
                      (período: {formatDate(
                        dateRange.from.toISOString()
                      )} a {formatDate(dateRange.to.toISOString())})
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Clínica</TableHead>
                      <TableHead>Mês</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.profissionais.length > 0 ? (
                      data.profissionais.map((prof: any) => (
                        <TableRow key={prof.id}>
                          <TableCell>{prof.nome}</TableCell>
                          <TableCell>{prof.clinica}</TableCell>
                          <TableCell>
                            {prof.month ? getMonthName(prof.month) : "N/A"}
                          </TableCell>
                          <TableCell>
                            {prof.status === "filled" && (
                              <Badge variant="default">Preenchida</Badge>
                            )}
                            {prof.status === "not_filled" && (
                              <Badge variant="outline">Não Preenchida</Badge>
                            )}
                            {prof.status === "delivered" && (
                              <Badge variant="success">Entregue</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(prof.created_at)}</TableCell>
                          <TableCell className="text-right">
                            {prof.valor > 0
                              ? `R$ ${formatToReais(prof.valor)}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/list-details/${prof.id}`}>
                                Detalhes
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Nenhuma lista encontrada para este período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
