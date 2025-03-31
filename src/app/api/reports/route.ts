import { type NextRequest, NextResponse } from "next/server";
import {
  getListasWithDetails,
  getProfissionais,
  getMateriais,
  getClinicas,
} from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reportType = searchParams.get("type");
  const format = searchParams.get("format");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    let data;

    switch (reportType) {
      case "listas":
        data = await getListasWithDetails();
        break;
      case "profissionais":
        data = await getProfissionais();
        break;
      case "materiais":
        data = await getMateriais();
        break;
      case "clinicas":
        data = await getClinicas();
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de relatório inválido" },
          { status: 400 }
        );
    }

    // Filtragem por data, se aplicável
    if (startDate && endDate && data) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      data = data.filter((item: any) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= start && itemDate <= end;
      });
    }

    // Aqui você implementaria a lógica para formatar os dados de acordo com o formato solicitado
    // Por exemplo, converter para CSV, Excel ou PDF

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}
