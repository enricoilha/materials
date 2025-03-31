import { NextResponse } from "next/server";
import { getProfessionalStats } from "@/lib/supabase";

export async function GET() {
  try {
    const stats = await getProfessionalStats(10);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas de profissionais:", error);

    // Verificar se é um erro de limite de taxa
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    const status = errorMessage.includes("Limite de requisições") ? 429 : 500;

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status }
    );
  }
}
