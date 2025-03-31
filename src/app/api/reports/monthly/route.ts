import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializa o cliente Supabase para uso no servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Período de datas não especificado" },
      { status: 400 }
    );
  }

  try {
    // Iniciar a consulta
    const query = supabase
      .from("listas")
      .select(
        `
        *,
        profissional:profissionais (id, nome, funcao),
        clinica:clinicas (id, sindicato, endereco)
      `
      )
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Executar a consulta
    const { data: listas, error: listasError } = await query.order(
      "created_at",
      { ascending: false }
    );

    if (listasError) throw listasError;

    // Contar profissionais únicos
    const profissionaisIds = new Set(
      listas?.map((lista) => lista.profissional_id) || []
    );
    const totalProfissionais = profissionaisIds.size;

    // Contar listas preenchidas e pendentes
    const totalPreenchidas =
      listas?.filter((lista) => lista.status === "filled").length || 0;
    const totalPendentes =
      listas?.filter((lista) => lista.status === "not_filled").length || 0;

    // Calcular valor total
    const valorTotal =
      listas?.reduce((acc, lista) => acc + (lista.preco_total || 0), 0) || 0;

    // Processar dados para exibição
    const profissionaisData =
      listas?.map((lista) => ({
        id: lista.id,
        nome: lista.profissional?.nome || "N/A",
        clinica: lista.clinica?.sindicato || "N/A",
        status: lista.status,
        valor: lista.preco_total || 0,
        created_at: lista.created_at,
        month: lista.month,
      })) || [];

    return NextResponse.json({
      totalProfissionais,
      totalPreenchidas,
      totalPendentes,
      valorTotal,
      profissionais: profissionaisData,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do relatório mensal:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}
