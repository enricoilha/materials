"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function MaterialsOverview({
  detailed = false,
}: {
  detailed?: boolean;
}) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard/materials-overview");

        if (response.status === 429) {
          // Erro de limite de taxa - aguardar e tentar novamente
          const retryAfter = response.headers.get("Retry-After") || "5";
          const waitTime = Number.parseInt(retryAfter, 10) * 1000 || 5000;

          setError(
            `Muitas requisições. Tentando novamente em ${
              waitTime / 1000
            } segundos...`
          );

          // Tentar novamente após o tempo de espera, mas limitar a 3 tentativas
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, waitTime);
          } else {
            setError(
              "Não foi possível carregar os dados devido a limites de requisição. Tente novamente mais tarde."
            );
          }
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Erro ao buscar visão geral de materiais: ${response.status}`
          );
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (error) {
        console.error("Erro:", error);
        setError("Não foi possível carregar a visão geral de materiais");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [retryCount]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className={detailed ? "h-[400px]" : "h-[300px]"} />
        {detailed && <Skeleton className="h-[200px]" />}
      </div>
    );
  }

  // Preparar dados para o gráfico com valores convertidos para reais
  const chartData = data.map((item) => ({
    ...item,
    valorDisplay: item.valor / 100, // Converter para reais para exibição
  }));

  return (
    <div className="space-y-4">
      <ChartContainer
        config={{
          quantidade: {
            label: "Quantidade",
            color: "hsl(var(--chart-1))",
          },
          valorDisplay: {
            label: "Valor (R$)",
            color: "hsl(var(--chart-2))",
          },
        }}
        className={detailed ? "h-[400px]" : "h-[300px]"}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                `R$${value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`
              }
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              yAxisId="left"
              dataKey="quantidade"
              fill="var(--color-quantidade)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="valorDisplay"
              fill="var(--color-valorDisplay)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {detailed && (
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.tipo || "N/A"}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell className="text-right">
                      R${" "}
                      {(item.valor / 100).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
