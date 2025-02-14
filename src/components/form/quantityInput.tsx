import { materialSchema } from "@/schemas/materialForm";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";

type FormType = z.infer<typeof materialSchema>;

interface QuantityInputProps {
  name: keyof FormType | `materials.${number}.quantity`;
  label?: string;
}

export const QuantityInput = ({ name, label }: QuantityInputProps) => {
  const { setValue, watch } = useFormContext<FormType>();
  const quantity = watch(name);

  function addQuantity() {
    //maybe later add maximum value
    return setValue(name, +quantity + 1);
  }

  function subtractQuantity() {
    if (+quantity > 1) {
      return setValue(name, +quantity - 1);
    }
    return;
  }
  return (
    <div>
      {label && (
        <label htmlFor={name} className="text-sm">
          {label}
        </label>
      )}
      <div className="flex items-center space-x-3 w-full justify-center mt-2">
        <Button
          type="button"
          disabled={+quantity <= 1}
          onClick={subtractQuantity}
          variant={"secondary"}
        >
          <Minus strokeWidth={3} size={15} />
        </Button>
        <div className="px-4">{+quantity}</div>
        <Button type="button" onClick={addQuantity} variant={"secondary"}>
          <Plus strokeWidth={3} size={15} />
        </Button>
      </div>
    </div>
  );
};
