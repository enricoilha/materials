import { NextResponse } from "next/server";
import { getDashboardStatistics } from "@/lib/supabase";

export async function GET() {
  try {
    const stats = await getDashboardStatistics();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
