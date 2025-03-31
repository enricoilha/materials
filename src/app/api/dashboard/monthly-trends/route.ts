import { NextResponse } from "next/server";
import { getMonthlyTrends } from "@/lib/supabase";

export async function GET() {
  try {
    const trends = await getMonthlyTrends(7);
    return NextResponse.json(trends);
  } catch (error) {
    console.error("Erro ao buscar tendências mensais:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tendências mensais" },
      { status: 500 }
    );
  }
}
