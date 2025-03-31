import { NextResponse } from "next/server";
import { getMaterialsOverview } from "@/lib/supabase";

export async function GET() {
  try {
    const materials = await getMaterialsOverview(5);
    return NextResponse.json(materials);
  } catch (error) {
    console.error("Erro ao buscar visão geral de materiais:", error);
    return NextResponse.json(
      { error: "Erro ao buscar visão geral de materiais" },
      { status: 500 }
    );
  }
}
