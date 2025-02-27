import { supabase } from "@/lib/supabase";


const updateProfissionaisTable = async () => {
  const { data } = await supabase
    .from("temp_profissionais_csv")
    .select("id, clinica, sindicato");

  if (!data) return console.log("error");

  data?.forEach(async (item) => {
    await supabase
      .from("profissionais")
      .update({
        clinica: item.clinica,
        sindicato: item.sindicato,
      })
      //@ts-ignore
      .eq("id", item.id);
  });
};

updateProfissionaisTable();