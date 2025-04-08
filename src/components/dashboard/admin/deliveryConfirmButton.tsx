import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface DeliveryConfirmButtonProps {
  isDeliveryAgreed: boolean;
  isSubmitting: boolean;
  isFormValid: boolean;
  onAgreementChange: (checked: boolean) => void;
  onSubmit: () => void;
}

export const DeliveryConfirmButton: React.FC<DeliveryConfirmButtonProps> = ({
  isDeliveryAgreed,
  isSubmitting,
  isFormValid,
  onAgreementChange,
  onSubmit,
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 mb-6">
          <Checkbox
            id="delivery-agreed"
            checked={isDeliveryAgreed}
            onCheckedChange={(checked) => onAgreementChange(!!checked)}
          />
          <Label
            htmlFor="delivery-agreed"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Confirmo que realizei a conferência dos materiais e registrei
            corretamente os itens em falta
          </Label>
        </div>

        <Button
          className="w-full"
          disabled={isSubmitting || !isDeliveryAgreed || !isFormValid}
          onClick={onSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Confirmar Entrega"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
