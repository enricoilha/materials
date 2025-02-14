import { useFormContext } from "react-hook-form";
import { Combobox } from "./combobox";
import { materialSchema } from "@/schemas/materialForm";
import { z } from "zod";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { QuantityInput } from "./quantityInput";
import { motion } from "motion/react";

interface MaterialItemProps {
  index: number;
  remove: () => unknown;
}

type FormType = z.infer<typeof materialSchema>;

export const MaterialItem = ({ index, remove }: MaterialItemProps) => {
  const {
    formState: { errors },
  } = useFormContext<FormType>();
  return (
    <motion.div
      initial={{ opacity: 0.5, y: "-5%" }}
      animate={{ opacity: 1, y: "0%" }}
      className="w-full border rounded-lg p-4 "
    >
      <div className="relative pb-5">
        <Button
          onClick={remove}
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
          options={[{ label: "xxx", value: "123-32313-33" }]}
          error={errors.materials?.[index]?.material_id}
        />
        {errors.materials?.[index]?.material_id && (
          <p className="absolute bottom-0 left-1  text-sm text-red-500">
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
    </motion.div>
  );
};
