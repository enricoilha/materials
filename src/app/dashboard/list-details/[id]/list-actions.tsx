"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon, PrinterIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ListActions({ listaId }: { listaId: string }) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: "pdf" | "csv") => {
    setIsExporting(true);

    try {
      // Simular exportação
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Exportação concluída",
        description: `Lista exportada com sucesso no formato ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error(`Erro ao exportar lista para ${format}:`, error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar a lista. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("pdf")}
        disabled={isExporting}
      >
        <DownloadIcon className="h-4 w-4 mr-2" />
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("csv")}
        disabled={isExporting}
      >
        <DownloadIcon className="h-4 w-4 mr-2" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <PrinterIcon className="h-4 w-4 mr-2" />
        Imprimir
      </Button>
    </div>
  );
}
