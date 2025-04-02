import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { clinicaId, photoUrl, observations } = await request.json();

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Criar a confirmação de entrega
    const { data, error } = await supabase
      .from("clinic_delivery_confirmations")
      .insert({
        id: uuidv4(),
        clinica_id: clinicaId,
        photo_url: photoUrl,
        observations,
        confirmed_by: session.user.id,
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar confirmação:", error);
      return NextResponse.json(
        { error: "Erro ao criar confirmação" },
        { status: 500 }
      );
    }

    // Atualizar o status das listas da clínica
    const { error: updateError } = await supabase
      .from("listas")
      .update({ status: "delivered" })
      .eq("clinica_id", clinicaId)
      .eq("status", "filled");

    if (updateError) {
      console.error("Erro ao atualizar status das listas:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar status das listas" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao processar confirmação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 