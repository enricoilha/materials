import { createClientServer } from "@/lib/server";

export async function POST(request: Request) {
  const { login, code } = await request.json();

  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from("profissionais")
    .select("id, nome")
    .eq("login", login)
    .single();

  if (!data || error) {
    return Response.json({
      status: 400,
      message: "Código de usuário ou senha estão errados",
    });
  }

  const firstLetter = data?.nome.slice(0, 1);
  const id_numbers = data?.id.slice(0, 5);
  const password = `${firstLetter}${id_numbers}`;

  if (code !== password) {
    return Response.json({
      status: 400,
      message: "Código de usuário ou senha estão errados",
    });
  }

  return Response.json({
    status: 200,
    message: "ok",
    professional_id: data.id,
  });
}
