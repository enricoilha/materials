import { supabase } from "@/lib/supabase";

async function fetchProfessionals() {
  return (await supabase.from("profissionais").select("id, sindicato")).data;
}

async function parsedArray(): Promise<{ id: string; login: string }[] | void> {
  const professionals = await fetchProfessionals();

  const parsed = professionals?.map((prof) => {
    const firstDigits = prof.sindicato?.slice(0, 4);
    const idLastDigits = prof.id.slice(-4);

    return { id: prof.id, login: `${firstDigits}${idLastDigits}` };
  });

  if (!parsed) return;
  return parsed;
}

(async () => {
  const array = await parsedArray();
  if (!array) return;
  array.forEach(async ({ id, login }) => {
    await supabase.from("profissionais").update({ login }).eq("id", id);
  });
})();
