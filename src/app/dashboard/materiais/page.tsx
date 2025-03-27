import { createClientServer } from "@/lib/server";
import { type Material, columns } from "./columns";
import { DataTable } from "./data-table";
import { PageHeader } from "@/components/PageHeader";

async function getData(): Promise<Material[]> {
  try {
    const supabase = await createClientServer();

    if (!supabase) {
      console.error("Failed to create Supabase client");
      return [];
    }

    const { data, error } = await supabase
      .from("materiais")
      .select("id, materiais, tipo, preco");

    if (error) {
      console.error("Supabase error:", error);
      return [];
    }

    if (!data) {
      console.log("No data returned from Supabase");
      return [];
    }

    return data as Material[];
  } catch (error) {
    console.error("Error in getData:", error);
    return [];
  }
}

export default async function MaterialsPage() {
  const data = await getData();

  return (
    <div className="container max-w-[1200px] ">
      <PageHeader
        title="Materiais"
        description="Visualize e altere os preços dos materiais"
      />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
