"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
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

// Cores para o gráfico
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ClinicDistribution({
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
        const response = await fetch("/api/dashboard/clinic-distribution");

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
            `Erro ao buscar distribuição por clínica: ${response.status}`
          );
        }

        const result = await response.json();

        // Adicionar cor a cada item
        const dataWithColors = result.map((item: any, index: number) => ({
          ...item,
          color: COLORS[index % COLORS.length],
        }));

        setData(dataWithColors);
        setError(null);
      } catch (error) {
        console.error("Erro:", error);
        setError("Não foi possível carregar a distribuição por clínica");
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

  return (
    <div className="space-y-4">
      <ChartContainer
        config={{
          clinicas: {
            label: "Clínicas",
          },
        }}
        className={detailed ? "h-[400px]" : "h-[300px]"}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      {detailed && (
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clínica</TableHead>
                  <TableHead>Profissionais</TableHead>
                  <TableHead>Listas</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((clinic, index) => (
                  <TableRow key={index}>
                    <TableCell>{clinic.name}</TableCell>
                    <TableCell>{clinic.profissionais}</TableCell>
                    <TableCell>{clinic.listas}</TableCell>
                    <TableCell className="text-right">
                      R${" "}
                      {(clinic.valor / 100).toLocaleString("pt-BR", {
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
