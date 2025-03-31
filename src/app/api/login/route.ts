import { createClientServer } from "@/lib/server";

export async function POST(request: Request) {
  const { login, code } = await request.json();

  const supabase = await createClientServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email: `${login}@albusdente.com.br`,
    password: code,
  });

  if (!user || error) {
    return Response.json({
      status: 400,
      message: "Código de usuário ou senha estão errados",
    });
  }

  return Response.json({
    status: 200,
    message: "ok",
    professional_id: user.id,
    role: user.user_metadata.role,
  });
}
