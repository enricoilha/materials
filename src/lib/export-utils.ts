"use client";

import { getListaWithDetails, getListaItensWithMaterial } from "@/lib/supabase";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatDate } from "./utils";

// Função para exportar lista para PDF
export async function exportListToPDF(listaId: string) {
  try {
    // Buscar dados da lista e seus itens
    const lista = await getListaWithDetails(listaId);
    const itens = await getListaItensWithMaterial(listaId);

    if (!lista) {
      throw new Error("Lista não encontrada");
    }

    // Criar documento PDF
    const doc = new jsPDF();

    // Adicionar cabeçalho
    doc.setFontSize(18);
    doc.text("Detalhes da Lista de Materiais", 14, 20);

    doc.setFontSize(11);
    doc.text(`ID: ${listaId}`, 14, 30);
    doc.text(`Data: ${formatDate(lista.created_at)}`, 14, 35);
    doc.text(`Profissional: ${lista.profissional?.nome || "N/A"}`, 14, 40);
    doc.text(`Clínica: ${lista.clinica?.sindicato || "N/A"}`, 14, 45);
    doc.text(
      `Status: ${lista.status === "filled" ? "Preenchida" : "Não Preenchida"}`,
      14,
      50
    );
    doc.text(`Mês: ${lista.month || "N/A"}`, 14, 55);

    // Adicionar tabela de itens
    if (itens.length > 0) {
      doc.text("Itens da Lista:", 14, 65);

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: 70,
        head: [
          [
            "Material",
            "Tipo",
            "Quantidade",
            "Preço Unit. (R$)",
            "Preço Total (R$)",
            "Observações",
          ],
        ],
        body: itens.map((item) => [
          item.material?.materiais || "N/A",
          item.material?.tipo || "N/A",
          item.quantidade,
          (item.preco / 100).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }),
          ((item.preco * item.quantidade) / 100).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }),
          item.observacoes || "-",
        ]),
      });

      // Adicionar resumo
      const totalItems = itens.length;
      const totalQuantidade = itens.reduce(
        (acc, item) => acc + Number(item.quantidade),
        0
      );
      const totalValor = itens.reduce(
        (acc, item) => acc + Number(item.preco) * Number(item.quantidade),
        0
      );

      const finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.text("Resumo:", 14, finalY);
      doc.text(`Total de Itens: ${totalItems}`, 14, finalY + 5);
      doc.text(`Quantidade Total: ${totalQuantidade}`, 14, finalY + 10);
      doc.text(
        `Valor Total: R$ ${(totalValor / 100).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`,
        14,
        finalY + 15
      );
    } else {
      doc.text("Nenhum item encontrado nesta lista.", 14, 65);
    }

    // Salvar o PDF
    doc.save(`lista-materiais-${listaId}.pdf`);

    return true;
  } catch (error) {
    console.error("Erro ao exportar lista para PDF:", error);
    throw error;
  }
}

// Função para exportar lista para CSV
export async function exportListToCSV(listaId: string) {
  try {
    // Buscar dados da lista e seus itens
    const lista = await getListaWithDetails(listaId);
    const itens = await getListaItensWithMaterial(listaId);

    if (!lista) {
      throw new Error("Lista não encontrada");
    }

    // Criar cabeçalho do CSV
    let csvContent =
      "Material,Tipo,Quantidade,Preço Unitário (R$),Preço Total (R$),Observações\n";

    // Adicionar linhas de dados
    itens.forEach((item) => {
      const row = [
        `"${item.material?.materiais || "N/A"}"`,
        `"${item.material?.tipo || "N/A"}"`,
        item.quantidade,
        (item.preco / 100).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        }),
        ((item.preco * item.quantidade) / 100).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        }),
        `"${item.observacoes || "-"}"`,
      ];
      csvContent += row.join(",") + "\n";
    });

    // Criar e baixar o arquivo CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lista-materiais-${listaId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Erro ao exportar lista para CSV:", error);
    throw error;
  }
}
