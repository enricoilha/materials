"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatToReais } from "@/lib/utils";

export function ListSummary({ itens }: { itens: any[] }) {
  // Calcular totais
  const totalItems = itens.length;
  const totalQuantidade = itens.reduce(
    (acc, item) => acc + Number(item.quantidade),
    0
  );
  const totalValor = itens.reduce(
    (acc, item) => acc + (Number(item.preco) / 100) * Number(item.quantidade),
    0
  );

  const tipoCount: Record<string, { count: number; valor: number }> = {};
  itens.forEach((item) => {
    const tipo = item.material?.tipo || "Sem tipo";
    if (!tipoCount[tipo]) {
      tipoCount[tipo] = { count: 0, valor: 0 };
    }
    tipoCount[tipo].count += 1;
    tipoCount[tipo].valor += (item.preco / 100) * Number(item.quantidade);
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Resumo</h3>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </div>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Quantidade Total
            </div>
            <div className="text-2xl font-bold">{totalQuantidade}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Valor Total
            </div>
            <div className="text-2xl font-bold">
              R${" "}
              {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {Object.keys(tipoCount).length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2">Distribuição por Tipo</h4>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(tipoCount).map(([tipo, { count, valor }]) => (
              <Card key={tipo}>
                <CardContent className="p-4">
                  <div className="text-sm font-medium">{tipo}</div>
                  <div className="flex justify-between mt-1">
                    <div className="text-sm text-muted-foreground">
                      {count} itens
                    </div>
                    <div className="text-sm font-medium">
                      R${" "}
                      {valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
