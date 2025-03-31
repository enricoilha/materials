import { NextResponse } from "next/server";
import { getClinicDistribution } from "@/lib/supabase";

export async function GET() {
  try {
    const distribution = await getClinicDistribution();
    return NextResponse.json(distribution);
  } catch (error) {
    console.error("Erro ao buscar distribuição por clínica:", error);
    return NextResponse.json(
      { error: "Erro ao buscar distribuição por clínica" },
      { status: 500 }
    );
  }
}
