import type { Tables } from "../../../database.types";
import { User, Mail, Phone, MapPin, Building2 } from "lucide-react";

type ProfessionalHeaderProps = {
  professional: Tables<"profissionais"> & {
    clinicas: Tables<"clinicas"> | null;
  };
};

export function ProfessionalHeader({ professional }: ProfessionalHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-8 h-8 text-blue-600" />
        </div>

        <div className="mt-4 md:mt-0 md:ml-6 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {professional.nome}
          </h1>
          <p className="text-gray-500">
            {professional.funcao || "Função não especificada"}
          </p>
        </div>

        {/* <div className="mt-4 md:mt-0 md:text-right">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Editar Profissional
          </button>
        </div> */}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        <div className="space-y-3">
          {professional.email && (
            <div className="flex items-center text-sm">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <span>{professional.email}</span>
            </div>
          )}

          {professional.telefone && (
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{professional.telefone}</span>
            </div>
          )}

          {professional.endereco && (
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>{professional.endereco}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {professional.clinicas && (
            <>
              <div className="flex items-center text-sm">
                <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                <span>
                  {professional.clinicas.sindicato ||
                    "Clínica não especificada"}
                </span>
              </div>

              {professional.clinicas.endereco && (
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{professional.clinicas.endereco}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
