import { MaterialsOverview } from "@/components/dashboard/materials-overview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function MaterialsOverviewPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Histórico dos Materiais
        </h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">Voltar ao Dashboard</Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Análise de Materiais</CardTitle>
          <CardDescription>Consumo e custos de materiais</CardDescription>
        </CardHeader>
        <CardContent>
          <MaterialsOverview detailed />
        </CardContent>
      </Card>
    </div>
  );
}
