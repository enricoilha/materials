import { createClientServer } from "@/lib/server";
import { type Material, columns } from "./columns";
import { DataTable } from "./data-table";
import { PageHeader } from "@/components/PageHeader";

async function getData(): Promise<Material[] | null> {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("materiais")
    .select("id, materiais, tipo, preco");

  if (error) throw error;
  if (!data) return null;
  return data;
}

export default async function MaterialsPage() {
  const data = await getData();

  return (
    <div className="container max-w-[1200px] mx-auto ">
      <PageHeader
        title="Materiais"
        description="Visualize e altere os preços dos materiais"
      />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
