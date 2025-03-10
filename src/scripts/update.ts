import { supabase } from "@/lib/supabase";
import fs from "fs/promises";
import Papa from "papaparse";

interface Professional {
  id: string;
  nome: string;
  funcao: string;
  clinica: string;
  created_at: string;
  sindicato: string;
  endereco: string;
  email: string;
  telefone: string;
  id_clinica: number;
  login: string;
  senha: string;
  user_id: string;
}

async function parseProfessionalsCSV(): Promise<Professional[]> {
  const fileContent = await fs.readFile(
    "src/scripts/updated_profissionais.csv"
  );
  const textContent = new TextDecoder().decode(fileContent);

  return new Promise((resolve, reject) => {
    Papa.parse(textContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const professionals = results.data as Professional[];

        const validProfessionals = professionals.map((prof) => {
          return {
            ...prof,
            id_clinica:
              typeof prof.id_clinica === "number"
                ? prof.id_clinica
                : parseInt(prof.id_clinica as unknown as string) || 0,
          };
        });

        resolve(validProfessionals);
      },
      error: (error: string) => {
        reject(new Error(`Error parsing CSV: ${error}`));
      },
    });
  });
}

async function updateUsers() {
  const profissionais = await parseProfessionalsCSV();
  profissionais.forEach(async (prof) => {
    await supabase
      .from("profissionais")
      .update({ user_id: prof.user_id })
      .eq("id", prof.id);
  });
}

updateUsers();
