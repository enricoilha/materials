// src/app/api/delivery/confirm-clinic/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      clinicId,
      photoUrl,
      signatureUrl,
      observations,
      missingItems,
    } = await request.json();

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 },
      );
    }

    // Verificar se o usuário é um administrador
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json(
        { error: "Erro ao verificar permissões do usuário" },
        { status: 500 },
      );
    }

    if (userData.user.user_metadata.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem confirmar entregas" },
        { status: 403 },
      );
    }

    // Criar a confirmação de entrega
    const confirmationId = uuidv4();
    const { data, error } = await supabase
      .from("clinic_delivery_confirmations")
      .insert({
        id: confirmationId,
        clinica_id: clinicId,
        photo_url: photoUrl,
        signature_url: signatureUrl,
        observations,
        confirmed_by: session.user.id,
        confirmed_at: new Date().toISOString(),
        missing_items: missingItems.length > 0 ? missingItems : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar confirmação:", error);
      return NextResponse.json(
        { error: "Erro ao criar confirmação" },
        { status: 500 },
      );
    }

    // Buscar todas as listas ativas da clínica
    const { data: lists, error: listsError } = await supabase
      .from("listas")
      .select("id")
      .eq("clinica_id", clinicId)
      .eq("status", "filled");

    if (listsError) {
      console.error("Erro ao buscar listas da clínica:", listsError);
      return NextResponse.json(
        { error: "Erro ao buscar listas da clínica" },
        { status: 500 },
      );
    }

    if (!lists || lists.length === 0) {
      return NextResponse.json(
        { error: "Não há listas preenchidas para esta clínica" },
        { status: 400 },
      );
    }

    // Atualizar o status das listas para "delivered"
    const listIds = lists.map((list) => list.id);
    const { error: updateError } = await supabase
      .from("listas")
      .update({
        status: "delivered",
        delivery_confirmation_id: confirmationId,
        delivered_at: new Date().toISOString(),
      })
      .in("id", listIds);

    if (updateError) {
      console.error("Erro ao atualizar status das listas:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar status das listas" },
        { status: 500 },
      );
    }

    // Se existirem itens faltantes, marcar na tabela de itens
    if (missingItems && missingItems.length > 0) {
      const { error: missingItemsError } = await supabase
        .from("lista_materiais_itens")
        .update({
          missing: true,
          missing_reported_at: new Date().toISOString(),
          missing_reported_by: session.user.id,
        })
        .in("id", missingItems);

      if (missingItemsError) {
        console.error("Erro ao marcar itens faltantes:", missingItemsError);
        // Não falha a operação principal, apenas loga o erro
      }
    }

    return NextResponse.json({
      success: true,
      message: "Entrega confirmada com sucesso",
      data,
    });
  } catch (error) {
    console.error("Erro ao processar confirmação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
