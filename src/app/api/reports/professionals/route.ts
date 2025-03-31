import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializa o cliente Supabase para uso no servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("profissionais")
      .select("id, nome")
      .order("nome");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    return NextResponse.json(
      { error: "Erro ao buscar profissionais" },
      { status: 500 }
    );
  }
}
