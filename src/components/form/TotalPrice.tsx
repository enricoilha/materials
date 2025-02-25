import { formatToReais } from "@/lib/utils";
import { usePriceStore } from "@/stores/material-form";

export const TotalPrice = () => {
  const { totalPrice } = usePriceStore();

  return (
    <div className="flex flex-col  justify-center p-4 bg-muted rounded-md w-full">
      <p className="text-muted-foreground text-sm">Valor Total:</p>
      <p className="text-xl font-bold">{formatToReais(totalPrice)}</p>
    </div>
  );
};
