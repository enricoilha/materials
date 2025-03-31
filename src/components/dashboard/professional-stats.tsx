"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
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

export function ProfessionalStats() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard/professional-stats");

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
            `Erro ao buscar estatísticas de profissionais: ${response.status}`
          );
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (error) {
        console.error("Erro:", error);
        setError(
          "Não foi possível carregar as estatísticas de profissionais. Tente novamente mais tarde."
        );
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
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartContainer
        config={{
          listas: {
            label: "Listas",
            color: "hsl(var(--chart-1))",
          },
          valor: {
            label: "Valor (R$)",
            color: "hsl(var(--chart-2))",
          },
        }}
        className="h-[400px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 50,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              scale="band"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="listas"
              fill="var(--color-listas)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Clínica</TableHead>
                <TableHead>Listas</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 5).map((prof, index) => (
                <TableRow key={index}>
                  <TableCell>{prof.name}</TableCell>
                  <TableCell>{prof.funcao}</TableCell>
                  <TableCell>{prof.clinica}</TableCell>
                  <TableCell>{prof.listas}</TableCell>
                  <TableCell className="text-right">
                    R${" "}
                    {(prof.valor / 100).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
