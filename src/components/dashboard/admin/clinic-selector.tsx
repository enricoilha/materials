import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, Loader2 } from "lucide-react";
import { capitalizeWords } from "@/lib/utils";
import { Clinic } from "./types";

interface ClinicSelectorProps {
  clinics: Clinic[];
  isLoading: boolean;
  onSelectClinic: (clinic: Clinic) => void;
}

export const ClinicSelector: React.FC<ClinicSelectorProps> = ({
  clinics,
  isLoading,
  onSelectClinic,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmar Entrega de Materiais</CardTitle>
        <CardDescription>
          Selecione uma clínica para iniciar a confirmação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : clinics.length > 0 ? (
            clinics.map((clinic) => (
              <Button
                key={clinic.id}
                variant="outline"
                className="flex justify-between items-center h-auto py-4 px-4 text-left"
                onClick={() => onSelectClinic(clinic)}
              >
                <div className="flex flex-col items-start ">
                  <span className="font-medium text-sm truncate max-w-[200px]">
                    {capitalizeWords(clinic.sindicato || "") ||
                      `Clínica ${clinic.id}`}
                  </span>
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {capitalizeWords(clinic.endereco || "") || "Sem endereço"}
                  </span>
                </div>
                <ChevronDown className="h-5 w-5 opacity-70" />
              </Button>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma clínica encontrada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
