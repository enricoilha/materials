import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Combobox } from "./combobox";
import { materialSchema } from "@/schemas/materialForm";
import { z } from "zod";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { QuantityInput } from "./quantityInput";
import { motion } from "motion/react";
import { usePriceStore } from "@/stores/material-form";

interface MaterialItemProps {
  index: number;
  remove: () => unknown;
  options: { label: string; value: string; preco: number }[] | [];
}

type FormType = z.infer<typeof materialSchema>;

export const MaterialItem = ({ index, remove, options }: MaterialItemProps) => {
  const {
    formState: { errors },
    control,
  } = useFormContext<FormType>();

  const updateItem = usePriceStore((state) => state.updateItem);
  const removeItem = usePriceStore((state) => state.removeItem);

  const materialId = useWatch({
    control,
    name: `materials.${index}.material_id`,
  });

  const quantity = useWatch({
    control,
    name: `materials.${index}.quantity`,
    defaultValue: 1,
  });

  const selectedMaterial = options.find((opt) => opt.value === materialId);

  useEffect(() => {
    if (materialId && selectedMaterial) {
      const precoInCents = Math.round(selectedMaterial.preco * 100);
      updateItem(materialId, precoInCents, quantity || 1);
    }
  }, [materialId, quantity, selectedMaterial, updateItem]);

  const handleRemove = () => {
    if (materialId) {
      removeItem(materialId);
    }
    remove();
  };

  return (
    <motion.div
      initial={{ opacity: 0.5, y: "-5%" }}
      animate={{ opacity: 1, y: "0%" }}
      className="w-full border rounded-lg p-4"
    >
      <div className="relative pb-5">
        <Button
          onClick={handleRemove}
          type="button"
          variant={"ghost"}
          className="flex ml-auto items-center text-xs h-8 text-red-600"
        >
          Remover
          <Trash2 size={12} />
        </Button>
        <Combobox
          label="Nome do item"
          name={`materials.${index}.material_id`}
          options={options}
          error={errors.materials?.[index]?.material_id}
        />
        {errors.materials?.[index]?.material_id && (
          <p className="absolute bottom-0 left-1 text-sm text-red-500">
            {errors.materials?.[index]?.material_id.message}
          </p>
        )}
      </div>

      <div className="relative pb-5">
        <QuantityInput
          name={`materials.${index}.quantity`}
          label="Quantidade"
        />
      </div>

      {selectedMaterial && (
        <div className="text-right text-sm text-muted-foreground">
          Preço: R${" "}
          {((selectedMaterial.preco * quantity) / 100).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </div>
      )}
    </motion.div>
  );
};
