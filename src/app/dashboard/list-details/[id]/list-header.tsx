"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatToReais } from "@/lib/utils";

export function ListHeader({
  lista,
  statusMap,
}: {
  lista: any;
  statusMap: Record<string, { label: string; variant: string }>;
}) {
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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <h3 className="text-sm font-medium leading-none text-muted-foreground">
              Profissional
            </h3>
            <p className="text-lg font-medium">
              {lista.profissional?.nome || "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">
              {lista.profissional?.funcao || "N/A"}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium leading-none text-muted-foreground">
              Clínica
            </h3>
            <p className="text-lg font-medium">
              {lista.clinica?.sindicato || "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">
              {lista.clinica?.endereco || "N/A"}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium leading-none text-muted-foreground">
              Status
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  statusMap[lista.status as keyof typeof statusMap]?.variant as
                    | "outline"
                    | "default"
                }
              >
                {statusMap[lista.status as keyof typeof statusMap]?.label ||
                  lista.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium leading-none text-muted-foreground">
              Descrição
            </h3>
            <p className="text-lg font-medium">
              {lista.descricao || "Sem descrição"}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium leading-none text-muted-foreground">
              Mês
            </h3>
            <p className="text-lg font-medium">{lista.month || "N/A"}</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium leading-none text-muted-foreground">
              Valor Total
            </h3>
            <p className="text-lg font-medium">
              {lista.preco_total
                ? `R$ ${formatToReais(lista.preco_total)}`
                : "Não calculado"}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium leading-none text-muted-foreground">
              Data de Criação
            </h3>
            <p className="text-lg font-medium">
              {formatDate(lista.created_at)}
            </p>
          </div>

          {lista.status === "filled" && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium leading-none text-muted-foreground">
                Data de Preenchimento
              </h3>
              <p className="text-lg font-medium">
                {formatDate(lista.filled_at)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
