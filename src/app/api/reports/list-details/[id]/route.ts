import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializa o cliente Supabase para uso no servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const listaId = params.id;

  try {
    // Buscar detalhes da lista
    const { data: lista, error: listaError } = await supabase
      .from("listas")
      .select(
        `
        *,
        profissional:profissionais (id, nome, funcao, email, telefone),
        clinica:clinicas (id, sindicato, endereco)
      `
      )
      .eq("id", listaId)
      .single();

    if (listaError) throw listaError;

    // Buscar itens da lista
    const { data: itens, error: itensError } = await supabase
      .from("lista_materiais_itens")
      .select(
        `
        *,
        material:materiais (id, materiais, tipo, preco)
      `
      )
      .eq("lista_id", listaId)
      .order("id");

    if (itensError) throw itensError;

    return NextResponse.json({
      lista,
      itens,
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes da lista:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes da lista" },
      { status: 500 }
    );
  }
}
