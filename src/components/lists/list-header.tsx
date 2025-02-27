import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "../../../database.types";
import { capitalizeWords } from "@/lib/utils";

type ListHeaderProps = {
  list: Tables<"listas"> & {
    clinicas: Tables<"clinicas"> | null;
    profissionais: Tables<"profissionais"> | null;
  };
  clinic: Tables<"clinicas"> | null;
  professional: Tables<"profissionais"> | null;
};

export default function ListHeader({
  list,
  clinic,
  professional,
}: ListHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Lista {list.id.substring(0, 8)}
          </h1>
          <p className="text-gray-500 mt-1">
            {list.descricao || "Sem descrição"}
          </p>
          <div className="mt-3">
            <div
              className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${
                list.status === "filled"
                  ? "bg-green-100 text-green-800"
                  : list.status === "not_filled"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {list.status === "filled" ? "Preenchido" : "Não preenchido"}
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="text-sm text-gray-500">
            <p>
              Criada em:{" "}
              {list.created_at &&
                format(new Date(list.created_at), "PPP", { locale: ptBR })}
            </p>
            {list.filled_at && (
              <p>
                Preenchida em:{" "}
                {format(new Date(list.filled_at), "PPP", { locale: ptBR })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Clínica</h3>
          {clinic ? (
            <div className="mt-1">
              <p className="font-medium">{capitalizeWords(clinic.sindicato)}</p>
              <p className="text-gray-500 text-sm">
                {capitalizeWords(clinic.endereco)}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Informações não disponíveis</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Profissional</h3>
          {professional ? (
            <div className="mt-1">
              <p className="font-medium">{professional.nome}</p>
              <p className="text-gray-500 text-sm">{professional.funcao}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Informações não disponíveis</p>
          )}
        </div>
      </div>
    </div>
  );
}
