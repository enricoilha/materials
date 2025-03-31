"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast, useToast } from "@/hooks/use-toast";
import { DatePickerWithRange } from "./date-range";

export default function ExportPage() {
  const [exportType, setExportType] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Exportação concluída",
        description: "Seu relatório foi exportado com sucesso.",
      });
    }, 2000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Exportar Relatórios
          </h1>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/">Voltar ao Dashboard</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="listas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="listas">Listas</TabsTrigger>
            <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
            <TabsTrigger value="clinicas">Clínicas</TabsTrigger>
          </TabsList>

          <TabsContent value="listas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Listas de Materiais</CardTitle>
                <CardDescription>
                  Configure os parâmetros para exportar relatórios de listas de
                  materiais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date-range">Período</Label>
                    <DatePickerWithRange />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="filled">Preenchidas</SelectItem>
                        <SelectItem value="not_filled">
                          Não Preenchidas
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clinic">Clínica</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="clinic">
                        <SelectValue placeholder="Selecione a clínica" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="1">Clínica A</SelectItem>
                        <SelectItem value="2">Clínica B</SelectItem>
                        <SelectItem value="3">Clínica C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="professional">Profissional</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="professional">
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="1">Dr. Silva</SelectItem>
                        <SelectItem value="2">Dr. Santos</SelectItem>
                        <SelectItem value="3">Dr. Oliveira</SelectItem>
                        <SelectItem value="4">Dr. Pereira</SelectItem>
                        <SelectItem value="5">Dr. Costa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Formato de Exportação</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="csv"
                        name="exportType"
                        value="csv"
                        checked={exportType === "csv"}
                        onChange={() => setExportType("csv")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="csv" className="font-normal">
                        CSV
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="excel"
                        name="exportType"
                        value="excel"
                        checked={exportType === "excel"}
                        onChange={() => setExportType("excel")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="excel" className="font-normal">
                        Excel
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="pdf"
                        name="exportType"
                        value="pdf"
                        checked={exportType === "pdf"}
                        onChange={() => setExportType("pdf")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="pdf" className="font-normal">
                        PDF
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Opções Adicionais</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-details" />
                      <Label htmlFor="include-details" className="font-normal">
                        Incluir detalhes dos itens
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-summary" defaultChecked />
                      <Label htmlFor="include-summary" className="font-normal">
                        Incluir resumo
                      </Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleExport} disabled={isExporting}>
                  {isExporting ? "Exportando..." : "Exportar Relatório"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profissionais" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Relatório de Profissionais</CardTitle>
                <CardDescription>
                  Configure os parâmetros para exportar relatórios de
                  profissionais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Similar form fields for professionals report */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date-range-prof">Período</Label>
                    <DatePickerWithRange />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clinic-prof">Clínica</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="clinic-prof">
                        <SelectValue placeholder="Selecione a clínica" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="1">Clínica A</SelectItem>
                        <SelectItem value="2">Clínica B</SelectItem>
                        <SelectItem value="3">Clínica C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Formato de Exportação</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="csv-prof"
                        name="exportTypeProf"
                        value="csv"
                        checked={exportType === "csv"}
                        onChange={() => setExportType("csv")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="csv-prof" className="font-normal">
                        CSV
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="excel-prof"
                        name="exportTypeProf"
                        value="excel"
                        checked={exportType === "excel"}
                        onChange={() => setExportType("excel")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="excel-prof" className="font-normal">
                        Excel
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="pdf-prof"
                        name="exportTypeProf"
                        value="pdf"
                        checked={exportType === "pdf"}
                        onChange={() => setExportType("pdf")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="pdf-prof" className="font-normal">
                        PDF
                      </Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleExport} disabled={isExporting}>
                  {isExporting ? "Exportando..." : "Exportar Relatório"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materiais" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Relatório de Materiais</CardTitle>
                <CardDescription>
                  Configure os parâmetros para exportar relatórios de materiais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Similar form fields for materials report */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date-range-mat">Período</Label>
                    <DatePickerWithRange />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Material</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="1">Tipo 1</SelectItem>
                        <SelectItem value="2">Tipo 2</SelectItem>
                        <SelectItem value="3">Tipo 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Formato de Exportação</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="csv-mat"
                        name="exportTypeMat"
                        value="csv"
                        checked={exportType === "csv"}
                        onChange={() => setExportType("csv")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="csv-mat" className="font-normal">
                        CSV
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="excel-mat"
                        name="exportTypeMat"
                        value="excel"
                        checked={exportType === "excel"}
                        onChange={() => setExportType("excel")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="excel-mat" className="font-normal">
                        Excel
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="pdf-mat"
                        name="exportTypeMat"
                        value="pdf"
                        checked={exportType === "pdf"}
                        onChange={() => setExportType("pdf")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="pdf-mat" className="font-normal">
                        PDF
                      </Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleExport} disabled={isExporting}>
                  {isExporting ? "Exportando..." : "Exportar Relatório"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clinicas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Relatório de Clínicas</CardTitle>
                <CardDescription>
                  Configure os parâmetros para exportar relatórios de clínicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Similar form fields for clinics report */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date-range-clinic">Período</Label>
                    <DatePickerWithRange />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Formato de Exportação</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="csv-clinic"
                        name="exportTypeClinic"
                        value="csv"
                        checked={exportType === "csv"}
                        onChange={() => setExportType("csv")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="csv-clinic" className="font-normal">
                        CSV
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="excel-clinic"
                        name="exportTypeClinic"
                        value="excel"
                        checked={exportType === "excel"}
                        onChange={() => setExportType("excel")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="excel-clinic" className="font-normal">
                        Excel
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="pdf-clinic"
                        name="exportTypeClinic"
                        value="pdf"
                        checked={exportType === "pdf"}
                        onChange={() => setExportType("pdf")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="pdf-clinic" className="font-normal">
                        PDF
                      </Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleExport} disabled={isExporting}>
                  {isExporting ? "Exportando..." : "Exportar Relatório"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
