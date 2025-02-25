import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Row, Table } from "@tanstack/react-table";
import { Material } from "@/app/materiais/columns";
import { supabase } from "@/lib/supabase";
import { formatToReais, parseFromReais } from "@/lib/utils";

interface ComponentProps {
  row: Row<Material>;
  table: Table<Material>;
}

export const InputPreco = ({ row, table }: ComponentProps) => {
  const preco = Number.parseFloat(row.getValue("preco"));

  const [displayValue, setDisplayValue] = useState(formatToReais(preco));

  useEffect(() => {
    const timer = setTimeout(async () => {
      const newValue = parseFromReais(displayValue);

      if (!isNaN(newValue) && newValue !== preco) {
        const { error } = await supabase
          .from("materiais")
          .update({ preco: newValue })
          .eq("id", row.original.id);

        if (error) {
          console.error("Error updating price:", error);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [displayValue, preco, row.original.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value;

    // Update the display value directly (allowing user to type normally)
    setDisplayValue(userInput);

    // Try to parse and update local table data if it's a valid number
    try {
      const newValue = parseFromReais(userInput);
      if (!isNaN(newValue)) {
        table.options.meta?.updateData(row.index, "preco", newValue);
      }
    } catch (error) {
      // Invalid input, don't update table
    }
  };

  // When user leaves input, format it properly
  const handleBlur = () => {
    try {
      const value = parseFromReais(displayValue);
      setDisplayValue(formatToReais(value));
    } catch (error) {
      // Reset to original value if invalid
      setDisplayValue(formatToReais(preco));
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        R$
      </span>
      <Input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="pl-8 w-28 text-right"
      />
    </div>
  );
};
