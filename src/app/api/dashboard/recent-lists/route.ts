import { NextResponse } from "next/server";
import { getRecentLists } from "@/lib/supabase";

export async function GET() {
  try {
    const lists = await getRecentLists(5);
    return NextResponse.json(lists);
  } catch (error) {
    console.error("Erro ao buscar listas recentes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar listas recentes" },
      { status: 500 }
    );
  }
}
