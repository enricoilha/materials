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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import { capitalizeWords, formatToReais } from "@/lib/utils";

export default function ProfessionalHistoryPage() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProfessionals() {
      try {
        const response = await fetch("/api/reports/professionals");
        if (!response.ok) {
          throw new Error("Erro ao buscar profissionais");
        }
        const data = await response.json();
        setProfessionals(data);

        if (data.length > 0 && !selectedProfessionalId) {
          setSelectedProfessionalId(data[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar profissionais:", error);
      }
    }

    fetchProfessionals();
  }, []);

  // Buscar dados do profissional selecionado
  useEffect(() => {
    if (!selectedProfessionalId) return;

    async function fetchProfessionalData() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/reports/professional?id=${selectedProfessionalId}`
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar dados do profissional");
        }
        const data = await response.json();

        setProfessionalData(data.professional);
        setHistoricalData(data.history);
        setChartData(data.chartData);
      } catch (error) {
        console.error("Erro ao buscar dados do profissional:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfessionalData();
  }, [selectedProfessionalId]);

  const handleProfessionalChange = (professionalId: string) => {
    setSelectedProfessionalId(professionalId);
  };

  const statusMap = {
    filled: { label: "Preenchida", variant: "default" },
    not_filled: { label: "Não Preenchida", variant: "outline" },
    delivered: { label: "Entregue", variant: "success" },
    default: { label: "Desconhecido", variant: "outline" },
  };

  const getStatusBadge = (status: string) => {
    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.default;
    return (
      <Badge variant={statusInfo.variant as "outline" | "default" | "success"}>
        {statusInfo.label}
      </Badge>
    );
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

  const exportToExcel = () => {
    if (!professionalData || !historicalData) return;

    // Preparar dados do profissional
    const profissionalInfo = {
      Nome: professionalData.nome,
      Clínica:
        professionalData.clinica?.sindicato ||
        professionalData.clinica ||
        "N/A",
      Função: professionalData.funcao || "N/A",
      Email: professionalData.email || "N/A",
      Telefone: professionalData.telefone || "N/A",
    };

    // Preparar histórico de listas
    const historicoFormatado = historicalData.map((item) => ({
      Mês: getMonthName(item.month),
      Status: getStatusBadge(item.status),
      "Data de Criação": formatDate(item.created_at),
      Valor: item.preco_total > 0 ? `R$ ${item.preco_total / 100}` : "-",
    }));

    // Criar workbook com duas planilhas
    const wb = XLSX.utils.book_new();

    // Adicionar dados do profissional
    const wsProfissional = XLSX.utils.json_to_sheet([profissionalInfo]);
    XLSX.utils.book_append_sheet(wb, wsProfissional, "Dados do Profissional");

    // Adicionar histórico
    const wsHistorico = XLSX.utils.json_to_sheet(historicoFormatado);
    XLSX.utils.book_append_sheet(wb, wsHistorico, "Histórico");

    // Exportar arquivo
    XLSX.writeFile(wb, `historico_${professionalData.nome}.xlsx`);
  };

  const exportToPDF = async () => {
    if (!professionalData) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    // Capture and add info section
    const infoElement = document.getElementById("pdf-info-content");
    if (infoElement) {
      const canvas = await html2canvas(infoElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      doc.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      doc.addPage();
    }

    // Capture and add history section
    const historyElement = document.getElementById("pdf-history-content");
    if (historyElement) {
      const canvas = await html2canvas(historyElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check remaining space on current page
      const currentPageHeight = doc.internal.pageSize.getHeight();
      const currentY = (doc as any).lastAutoTable?.finalY || margin;
      const spaceLeft = currentPageHeight - currentY - margin;

      if (imgHeight > spaceLeft) {
        doc.addPage();
      }

      doc.addImage(
        imgData,
        "PNG",
        margin,
        currentY + margin,
        imgWidth,
        imgHeight
      );
    }

    doc.save(`historico_${professionalData.nome}.pdf`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Histórico do Profissional
          </h1>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/">Voltar ao Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-[250px]">
            <Select
              value={selectedProfessionalId}
              onValueChange={handleProfessionalChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {capitalizeWords(prof.nome)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <Button onClick={exportToExcel} disabled={!professionalData}>
            Exportar Excel
          </Button>
          <Button onClick={exportToPDF} disabled={!professionalData}>
            Exportar PDF
          </Button> */}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Carregando dados...</p>
          </div>
        ) : professionalData ? (
          <>
            <div id="pdf-info-content" className="bg-white">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Informações do Profissional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Nome
                      </p>
                      <p className="text-lg">{professionalData.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Clínica
                      </p>
                      <p className="text-lg">
                        {professionalData.clinica?.sindicato ||
                          professionalData.clinica ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Função
                      </p>
                      <p className="text-lg">
                        {professionalData.funcao || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email
                      </p>
                      <p className="text-lg">
                        {professionalData.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Telefone
                      </p>
                      <p className="text-lg">
                        {professionalData.telefone || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {chartData.length > 0 && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Histórico de Valores</CardTitle>
                    <CardDescription>
                      Valores mensais das listas de materiais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        valor: {
                          label: "Valor (R$)",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
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
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `R$${value}`}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar
                            dataKey="valor"
                            fill="var(--color-valor)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            <div id="pdf-history-content" className="bg-white">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Listas</CardTitle>
                  <CardDescription>
                    Detalhamento das listas mensais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicalData.length > 0 ? (
                        historicalData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{getMonthName(item.month)}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>{formatDate(item.created_at)}</TableCell>
                            <TableCell className="text-right">
                              {item.preco_total > 0
                                ? `R$ ${formatToReais(item.preco_total)}`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={`/dashboard/list-details/${item.id}`}
                                >
                                  Detalhes
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            Nenhuma lista encontrada para este profissional
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p>Selecione um profissional para ver seu histórico</p>
          </div>
        )}
      </main>
    </div>
  );
}
