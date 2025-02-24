"use client";

import { MaterialItem } from "@/components/form/materialItem";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { materialSchema } from "@/schemas/materialForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type FormType = z.infer<typeof materialSchema>;

export default function FormPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["form-select"],
    queryFn: async () => {
      const { error: checkError } = await supabase
        .from("listas")
        .select("id")
        .eq("id", id as string)
        .single();

      if (checkError) throw new Error("Não existe uma lista válida");

      const { data, error } = await supabase
        .from("materiais")
        .select("id, materiais");

      if (error) {
        throw error;
      }
      const transformedData = data.map((item) => ({
        label: item.materiais,
        value: item.id,
      }));

      return transformedData;
    },
  });

  const methods = useForm<FormType>({
    mode: "onSubmit",
    resolver: zodResolver(materialSchema),
    defaultValues: {
      materials: [{ material_id: undefined, quantity: 1 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "materials",
  });

  async function onSubmit(data: FormType) {
    if (!id) {
      return console.log("Id undefined");
    }
    const parsed = data.materials.map((item) => ({
      lista_id: id as string,
      quantidade: item.quantity,
      material_id: item.material_id,
    }));

    if (!parsed) {
      return console.log("Error parsing data");
    }
    const { error: err } = await supabase
      .from("lista_materiais_itens")
      .insert(parsed);

    const { error: updateError } = await supabase
      .from("listas")
      .update({ status: "filled", filled_at: new Date() })
      .eq("id", id as string);

    return console.log(err, updateError);
  }

  return (
    <div className="max-w-[100vw] h-screen">
      <Header />
      <main className="flex flex-col mx-auto items-center justify-center mt-3 max-w-screen ">
        {isLoading ? (
          <div>Carregando</div>
        ) : (
          <>
            {!error ? (
              data && (
                <>
                  <p className="text-base text-muted-foreground mb-5">
                    Insira os materiais que precisa
                  </p>
                  <FormProvider {...methods}>
                    <form
                      onSubmit={methods.handleSubmit(onSubmit)}
                      className="flex flex-col px-3 space-y-4 max-w-screen"
                    >
                      {fields.map((field, idx) => (
                        <MaterialItem
                          index={idx}
                          key={field.id}
                          options={data}
                          remove={() => remove(idx)}
                        />
                      ))}

                      <div className="w-full">
                        <Button
                          type="button"
                          onClick={() =>
                            append(
                              { material_id: undefined!, quantity: 1 },
                              { shouldFocus: false }
                            )
                          }
                          className="mt-3 w-full"
                          variant={"secondary"}
                        >
                          Adicionar Item
                          <Plus />
                        </Button>
                        <div className="bg-border w-full h-[1px] my-4 mx-5 shrink-0" />
                        <Button className="w-full h-11 mt-6 bg-black font-medium">
                          Finalizar
                        </Button>
                      </div>
                    </form>
                  </FormProvider>
                </>
              )
            ) : (
              <div>Lista não encontrada</div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
