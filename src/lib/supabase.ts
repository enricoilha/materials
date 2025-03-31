// import "server-only";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";

// Inicializa o cliente Supabase para uso no servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// Cria um cliente Supabase para uso em Server Components e Server Actions
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: { persistSession: true },
});

// Função para obter uma lista específica com detalhes relacionados
export async function getListaWithDetails(listaId: string) {
  const { data, error } = await supabase
    .from("listas")
    .select(
      `
      *,
      profissional:profissionais (id, nome, funcao, email, telefone),
      clinica:clinicas (id, sindicato, endereco)
    `
    )
    .eq("id", listaId)
    .single();

  if (error) {
    console.error("Erro ao buscar detalhes da lista:", error);
    return null;
  }

  return data;
}

// Função para obter os itens de uma lista com detalhes dos materiais
export async function getListaItensWithMaterial(listaId: string) {
  const { data, error } = await supabase
    .from("lista_materiais_itens")
    .select(
      `
      *,
      material:materiais (id, materiais, tipo, preco)
    `
    )
    .eq("lista_id", listaId)
    .order("id");

  if (error) {
    console.error("Erro ao buscar itens da lista:", error);
    return [];
  }

  return data;
}

// Função para obter listas por mês
export async function getListasByMonth(month: string) {
  const { data, error } = await supabase
    .from("listas")
    .select(
      `
      *,
      profissional:profissionais (id, nome, funcao),
      clinica:clinicas (id, sindicato, endereco)
    `
    )
    .eq("month", month)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar listas por mês:", error);
    return [];
  }

  return data;
}

// Função para obter listas por período
export async function getListasByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("listas")
    .select(
      `
      *,
      profissional:profissionais (id, nome, funcao),
      clinica:clinicas (id, sindicato, endereco)
    `
    )
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar listas por período:", error);
    return [];
  }

  return data;
}

// Função para obter estatísticas mensais
export async function getMonthlyStatistics(month: string) {
  try {
    // Buscar todas as listas do mês
    const { data: listas, error: listasError } = await supabase
      .from("listas")
      .select("*")
      .eq("month", month);

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

    return {
      totalProfissionais,
      totalPreenchidas,
      totalPendentes,
      valorTotal,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas mensais:", error);
    throw error;
  }
}

// Função para obter estatísticas por período
export async function getStatisticsByDateRange(
  startDate: string,
  endDate: string
) {
  try {
    // Buscar todas as listas do período
    const { data: listas, error: listasError } = await supabase
      .from("listas")
      .select("*")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

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

    return {
      totalProfissionais,
      totalPreenchidas,
      totalPendentes,
      valorTotal,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas por período:", error);
    throw error;
  }
}

// Função para obter o histórico de um profissional
export async function getProfessionalHistory(profissionalId: string) {
  const { data, error } = await supabase
    .from("listas")
    .select(
      `
      *,
      clinica:clinicas (id, sindicato, endereco)
    `
    )
    .eq("profissional_id", profissionalId)
    .order("month", { ascending: false });

  if (error) {
    console.error("Erro ao buscar histórico do profissional:", error);
    return [];
  }

  return data;
}

// Função para obter detalhes de um profissional
export async function getProfessionalDetails(profissionalId: string) {
  const { data, error } = await supabase
    .from("profissionais")
    .select(
      `
      *,
      clinica:clinicas (id, sindicato, endereco)
    `
    )
    .eq("id", profissionalId)
    .single();

  if (error) {
    console.error("Erro ao buscar detalhes do profissional:", error);
    return null;
  }

  return data;
}

// Função para obter lista de profissionais
export async function getProfessionals() {
  const { data, error } = await supabase
    .from("profissionais")
    .select("id, nome")
    .order("nome");

  if (error) {
    console.error("Erro ao buscar profissionais:", error);
    return [];
  }

  return data;
}

// Função para obter lista de clínicas
export async function getClinics() {
  const { data, error } = await supabase
    .from("clinicas")
    .select("id, sindicato")
    .order("sindicato");

  if (error) {
    console.error("Erro ao buscar clínicas:", error);
    return [];
  }

  return data;
}

// Função para obter lista de materiais
export async function getMaterials() {
  const { data, error } = await supabase
    .from("materiais")
    .select("*")
    .order("materiais");

  if (error) {
    console.error("Erro ao buscar materiais:", error);
    return [];
  }

  return data;
}

// Função para obter estatísticas gerais do dashboard
export async function getDashboardStatistics() {
  try {
    // Obter o mês atual (para filtrar profissionais ativos)
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;

    // Contar profissionais totais
    const { count: totalProfissionais, error: profError } = await supabase
      .from("profissionais")
      .select("*", { count: "exact", head: true });

    if (profError) throw profError;

    // Contar profissionais com listas no mês atual
    const { data: listasAtivas, error: listasError } = await supabase
      .from("listas")
      .select("profissional_id")
      .eq("month", currentMonth);

    if (listasError) throw listasError;

    const profissionaisAtivos = new Set(
      listasAtivas?.map((lista) => lista.profissional_id) || []
    ).size;

    // Contar total de materiais utilizados
    const { data: materiaisUtilizados, error: materiaisError } = await supabase
      .from("lista_materiais_itens")
      .select("quantidade");

    if (materiaisError) throw materiaisError;

    const totalMateriais =
      materiaisUtilizados?.reduce(
        (acc, item) => acc + (item.quantidade || 0),
        0
      ) || 0;

    // Calcular valor total
    const { data: valorData, error: valorError } = await supabase
      .from("listas")
      .select("preco_total")
      .not("preco_total", "is", null);

    if (valorError) throw valorError;

    const valorTotal =
      valorData?.reduce((acc, item) => acc + (item.preco_total || 0), 0) || 0;

    // Calcular crescimento em relação ao mês anterior
    const lastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(
      lastMonth.getMonth() + 1
    ).padStart(2, "0")}`;

    const { data: lastMonthData, error: lastMonthError } = await supabase
      .from("listas")
      .select("preco_total")
      .eq("month", lastMonthStr)
      .not("preco_total", "is", null);

    if (lastMonthError) throw lastMonthError;

    const lastMonthTotal =
      lastMonthData?.reduce((acc, item) => acc + (item.preco_total || 0), 0) ||
      0;

    const crescimento =
      lastMonthTotal > 0
        ? Math.round(((valorTotal - lastMonthTotal) / lastMonthTotal) * 100)
        : 0;

    return {
      profissionaisAtivos,
      totalProfissionais,
      totalMateriais,
      valorTotal,
      crescimento,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    throw error;
  }
}

// Função para obter listas recentes
export async function getRecentLists(limit = 5) {
  const { data, error } = await supabase
    .from("listas")
    .select(
      `
      id,
      descricao,
      status,
      created_at,
      preco_total,
      profissional:profissionais (nome),
      clinica:clinicas (sindicato)
    `
    )
    .order("created_at", { ascending: false })
    .order("status", "filled")
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar listas recentes:", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    descricao: item.descricao,
    profissional: item.profissional?.nome || "N/A",
    clinica: item.clinica?.sindicato || "N/A",
    status: item.status,
    data: item.created_at,
    valor: item.preco_total || 0,
  }));
}

// Função para obter tendências mensais
export async function getMonthlyTrends(months = 7) {
  try {
    const result = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthShort = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ][date.getMonth()];

      // Buscar profissionais com listas para este mês
      const { data: profissionais, error: errorProf } = await supabase
        .from("listas")
        .select("profissional_id")
        .eq("month", month);

      if (errorProf) throw errorProf;

      const uniqueProfissionais = new Set(
        profissionais?.map((item) => item.profissional_id) || []
      );

      // Calcular valor total
      const { data: valorData, error: errorValor } = await supabase
        .from("listas")
        .select("preco_total")
        .eq("month", month)
        .not("preco_total", "is", null);

      if (errorValor) throw errorValor;

      const valorTotal =
        valorData?.reduce((acc, item) => acc + (item.preco_total || 0), 0) || 0;

      result.push({
        month: monthShort,
        profissionais: uniqueProfissionais.size,
        valor: valorTotal,
      });
    }

    return result;
  } catch (error) {
    console.error("Erro ao buscar tendências mensais:", error);
    throw error;
  }
}

// Função para obter distribuição por clínica - versão otimizada
export async function getClinicDistribution() {
  try {
    // Buscar todas as clínicas de uma vez
    const { data: clinicas, error: clinicasError } = await supabase
      .from("clinicas")
      .select("id, sindicato");

    if (clinicasError) throw clinicasError;

    // Buscar todos os profissionais de uma vez
    const { data: todosProfissionais, error: profError } = await supabase
      .from("profissionais")
      .select("id, id_clinica")
      .not("id_clinica", "is", null);

    if (profError) throw profError;

    // Buscar todas as listas de uma vez
    const { data: todasListas, error: listasError } = await supabase
      .from("listas")
      .select("id, clinica_id, preco_total")
      .not("clinica_id", "is", null);

    if (listasError) throw listasError;

    // Calcular valor total geral
    const valorTotalGeral =
      todasListas.reduce((acc, item) => acc + (item.preco_total || 0), 0) || 1; // Evitar divisão por zero

    // Processar os dados localmente
    const result = [];

    for (const clinica of clinicas) {
      // Contar profissionais
      const profissionaisCount = todosProfissionais.filter(
        (p) => p.id_clinica === clinica.id
      ).length;

      // Filtrar listas da clínica
      const listasClinica = todasListas.filter(
        (l) => l.clinica_id === clinica.id
      );
      const listasCount = listasClinica.length;

      // Calcular valor total
      const valorTotal = listasClinica.reduce(
        (acc, item) => acc + (item.preco_total || 0),
        0
      );

      // Calcular percentual do total
      const percentual = Math.round((valorTotal / valorTotalGeral) * 100);

      result.push({
        name: clinica.sindicato || `Clínica ${clinica.id}`,
        value: percentual,
        profissionais: profissionaisCount,
        listas: listasCount,
        valor: valorTotal,
      });
    }

    // Ordenar por valor e limitar a 5 clínicas
    result.sort((a, b) => b.value - a.value);

    // Se houver mais de 5 clínicas, agrupar as restantes como "Outras"
    if (result.length > 5) {
      const topClinics = result.slice(0, 4);
      const otherClinics = result.slice(4);

      const otherValue = otherClinics.reduce(
        (acc, clinic) => acc + clinic.value,
        0
      );
      const otherProfissionais = otherClinics.reduce(
        (acc, clinic) => acc + clinic.profissionais,
        0
      );
      const otherListas = otherClinics.reduce(
        (acc, clinic) => acc + clinic.listas,
        0
      );
      const otherValor = otherClinics.reduce(
        (acc, clinic) => acc + clinic.valor,
        0
      );

      topClinics.push({
        name: "Outras",
        value: otherValue,
        profissionais: otherProfissionais,
        listas: otherListas,
        valor: otherValor,
      });

      return topClinics;
    }

    return result;
  } catch (error) {
    // Tratamento específico para erro de limite de taxa
    if (error instanceof Error && error.message.includes("Too Many Requests")) {
      console.error("Limite de requisições do Supabase atingido:", error);
      throw new Error(
        "Limite de requisições atingido. Por favor, tente novamente mais tarde."
      );
    }

    console.error("Erro ao buscar distribuição por clínica:", error);
    throw error;
  }
}

// Função para obter visão geral de materiais - versão otimizada
export async function getMaterialsOverview(limit = 5) {
  try {
    // Buscar os materiais e itens em uma única consulta com join
    const { data: materiaisItens, error: materiaisError } = await supabase.from(
      "lista_materiais_itens"
    ).select(`
        quantidade, preco,
        material:materiais (id, materiais, tipo)
      `);

    if (materiaisError) throw materiaisError;

    // Agrupar por material
    const materiaisMap = new Map();

    for (const item of materiaisItens) {
      if (!item.material) continue;

      const materialId = item.material.id;
      const materialNome = item.material.materiais;
      const materialTipo = item.material.tipo;

      if (!materiaisMap.has(materialId)) {
        materiaisMap.set(materialId, {
          id: materialId,
          name: materialNome,
          tipo: materialTipo,
          quantidade: 0,
          valor: 0,
        });
      }

      const material = materiaisMap.get(materialId);
      material.quantidade += item.quantidade || 0;
      material.valor += (item.quantidade || 0) * (item.preco || 0);
    }

    // Converter para array e ordenar por quantidade
    const result = Array.from(materiaisMap.values());
    result.sort((a, b) => b.quantidade - a.quantidade);

    // Limitar ao número especificado
    return result.slice(0, limit);
  } catch (error) {
    // Tratamento específico para erro de limite de taxa
    if (error instanceof Error && error.message.includes("Too Many Requests")) {
      console.error("Limite de requisições do Supabase atingido:", error);
      throw new Error(
        "Limite de requisições atingido. Por favor, tente novamente mais tarde."
      );
    }

    console.error("Erro ao buscar visão geral de materiais:", error);
    throw error;
  }
}

// Função para obter estatísticas de profissionais - versão otimizada
export async function getProfessionalStats(limit = 10) {
  try {
    // Buscar todos os profissionais de uma vez
    const { data: profissionais, error: profError } = await supabase.from(
      "profissionais"
    ).select(`
      id, nome, funcao,
      clinica:clinicas (sindicato)
    `);

    if (profError) throw profError;

    // Buscar todas as listas de uma vez
    const { data: todasListas, error: listasError } = await supabase
      .from("listas")
      .select("id, profissional_id, preco_total")
      .not("profissional_id", "is", null);

    if (listasError) throw listasError;

    // Processar os dados localmente em vez de fazer múltiplas consultas
    const result = [];
    const profMap = new Map();

    // Agrupar listas por profissional
    for (const lista of todasListas) {
      if (!lista.profissional_id) continue;

      if (!profMap.has(lista.profissional_id)) {
        profMap.set(lista.profissional_id, {
          listas: 0,
          valor: 0,
        });
      }

      const profData = profMap.get(lista.profissional_id);
      profData.listas += 1;
      profData.valor += lista.preco_total || 0;
    }

    // Combinar dados de profissionais com suas listas
    for (const prof of profissionais) {
      const stats = profMap.get(prof.id) || { listas: 0, valor: 0 };

      if (stats.listas > 0) {
        result.push({
          name: prof.nome,
          funcao: prof.funcao || "N/A",
          clinica: prof.clinica?.sindicato || "N/A",
          listas: stats.listas,
          valor: stats.valor,
        });
      }
    }

    // Ordenar por número de listas
    result.sort((a, b) => b.listas - a.listas);

    // Limitar ao número especificado
    return result.slice(0, limit);
  } catch (error) {
    // Tratamento específico para erro de limite de taxa
    if (error instanceof Error && error.message.includes("Too Many Requests")) {
      console.error("Limite de requisições do Supabase atingido:", error);
      throw new Error(
        "Limite de requisições atingido. Por favor, tente novamente mais tarde."
      );
    }

    console.error("Erro ao buscar estatísticas de profissionais:", error);
    throw error;
  }
}

// Função para obter listas com detalhes (para exportação)
export async function getListasWithDetails() {
  const { data, error } = await supabase
    .from("listas")
    .select(
      `
      *,
      profissional:profissionais (id, nome, funcao, email, telefone),
      clinica:clinicas (id, sindicato, endereco)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar listas com detalhes:", error);
    return [];
  }

  return data;
}

// Função para obter profissionais (para exportação)
export async function getProfissionais() {
  const { data, error } = await supabase
    .from("profissionais")
    .select(
      `
      *,
      clinica:clinicas (id, sindicato, endereco)
    `
    )
    .order("nome");

  if (error) {
    console.error("Erro ao buscar profissionais:", error);
    return [];
  }

  return data;
}

// Função para obter materiais (para exportação)
export async function getMateriais() {
  const { data, error } = await supabase
    .from("materiais")
    .select("*")
    .order("materiais");

  if (error) {
    console.error("Erro ao buscar materiais:", error);
    return [];
  }

  return data;
}

// Função para obter clínicas (para exportação)
export async function getClinicas() {
  const { data, error } = await supabase
    .from("clinicas")
    .select("*")
    .order("sindicato");

  if (error) {
    console.error("Erro ao buscar clínicas:", error);
    return [];
  }

  return data;
}
