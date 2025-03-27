import { DateRange } from "react-day-picker";
import { Card, CardContent } from "./ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TableSummaryProps {
  data: any[];
  dateRange: DateRange;
}

export function TableSummary({ data, dateRange }: TableSummaryProps) {
  const totalLists = data.length;
  const completedLists = data.filter((item) => item.status === "filled").length;
  const pendingLists = data.filter(
    (item) => item.status === "not_filled"
  ).length;
  const totalValue =
    data.reduce((acc, item) => acc + (item.preco_total || 0), 0) / 100;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">
        Relatório do período:{" "}
        <span className="font-normal">
          {dateRange.from &&
            format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })}{" "}
          -{" "}
          {dateRange.to && format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total de Listas</p>
            <p className="text-2xl">{totalLists}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Listas Preenchidas</p>
            <p className="text-2xl ">{completedLists}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Listas Pendentes</p>
            <p className="text-2xl">{pendingLists}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl ">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalValue)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
