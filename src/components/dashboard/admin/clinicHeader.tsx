import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { capitalizeWords } from "@/lib/utils";
import { Clinic } from "./types";

interface ClinicHeaderProps {
  clinic: Clinic;
  onBack: () => void;
}

export const ClinicHeader: React.FC<ClinicHeaderProps> = ({
  clinic,
  onBack,
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <Button
        variant="ghost"
        className="flex items-center gap-2 p-2"
        onClick={onBack}
      >
        <ChevronDown className="h-5 w-5 rotate-90" />
        <span>Voltar</span>
      </Button>
      <h2 className="text-xl font-semibold">
        {capitalizeWords(clinic.sindicato || "") || `Clínica ${clinic.id}`}
      </h2>
      <div className="w-10"></div> {/* Spacer for alignment */}
    </div>
  );
};
