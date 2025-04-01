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
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID do profissional não especificado" },
      { status: 400 }
    );
  }

  try {
    // Buscar detalhes do profissional
    const { data: professional, error: professionalError } = await supabase
      .from("profissionais")
      .select(
        `
        *,
        clinica:clinicas (id, sindicato, endereco)
      `
      )
      .eq("id", id)
      .single();

    if (professionalError) throw professionalError;

    // Buscar histórico de listas
    const { data: history, error: historyError } = await supabase
      .from("listas")
      .select(
        `
        *,
        clinica:clinicas (id, sindicato, endereco)
      `
      )
      .eq("profissional_id", id)
      .order("month", { ascending: false });

    if (historyError) throw historyError;

    // Preparar dados para o gráfico
    const chartData = history.map((item) => ({
      month: item.month ? item.month.split("-")[1] : "N/A",
      valor: (item.preco_total / 100) || 0,
    }));

    // Ordenar por mês
    chartData.sort((a, b) => {
      if (a.month === "N/A") return 1;
      if (b.month === "N/A") return -1;
      return Number.parseInt(a.month) - Number.parseInt(b.month);
    });

    return NextResponse.json({
      professional,
      history,
      chartData,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do profissional:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}
