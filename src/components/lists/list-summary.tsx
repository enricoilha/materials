import { formatCurrency, formatToReais } from "@/lib/utils";
import type { Tables } from "../../../database.types";

type ListSummaryProps = {
  items: Array<
    Tables<"lista_materiais_itens"> & {
      materiais: Tables<"materiais"> | null;
    }
  >;
  status: string;
  totalPrice: number | null;
};

export default function ListSummary({
  items,
  status,
  totalPrice,
}: ListSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Resumo</h3>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Itens totais:</span>
          <span className="font-medium">{items.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Quantidade total:</span>
          <span className="font-medium">
            {items.reduce((sum, item) => sum + item.quantidade, 0)}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-900">Total</span>
          <span className="text-lg font-bold text-gray-900">
            {formatToReais(totalPrice!) || ""}
          </span>
        </div>
      </div>

      {status === "pending" && (
        <div className="mt-6">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
            Aprovar Lista
          </button>
        </div>
      )}
    </div>
  );
}
