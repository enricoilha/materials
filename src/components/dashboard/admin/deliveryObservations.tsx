import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface DeliveryObservationsProps {
  observations: string;
  onObservationsChange: (value: string) => void;
}

export const DeliveryObservations: React.FC<DeliveryObservationsProps> = ({
  observations,
  onObservationsChange,
}) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Observações</CardTitle>
        <CardDescription>
          Adicione informações importantes sobre a entrega
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Descreva qualquer ocorrência ou observação relevante sobre a entrega..."
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          className="min-h-[100px]"
        />
      </CardContent>
    </Card>
  );
};
