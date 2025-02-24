import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";

export async function POST() {
  const { data, error } = await supabase.from("profissionais").select("*");

  if (error) {
    Response.json({ status: 400, error });
  }

  const array_to_bulk = data?.map((item) => ({
    profissional_id: item.id,
    clinica_id: item.id_clinica,
    month: String(dayjs().month()),
  }));

  if (!array_to_bulk)
    return Response.json({ status: 400, error: "No array_to_bulk" });

  const { count } = await supabase
    .from("listas")
    .insert(array_to_bulk, { count: "exact" });

  return Response.json({
    status: 200,
    message: `Inserted ${count} rows in Lists table`,
  });
}
