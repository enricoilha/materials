"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

export function MonthlyTrends() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard/monthly-trends");
        if (!response.ok) {
          throw new Error("Erro ao buscar tendências mensais");
        }
        const result = await response.json();

        // Converter valores de centavos para reais
        const formattedData = result.map((item: any) => ({
          ...item,
          valorDisplay: item.valor / 100, // Valor em reais para exibição
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Erro:", error);
        setError("Não foi possível carregar as tendências mensais");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <ChartContainer
      config={{
        profissionais: {
          label: "Profissionais",
          color: "hsl(var(--chart-1))",
        },
        valorDisplay: {
          label: "Valor (R$)",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
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
              `R$${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
            }
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="profissionais"
            stroke="var(--color-profissionais)"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="valorDisplay"
            stroke="var(--color-valorDisplay)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
