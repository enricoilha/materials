"use client";

import { MaterialItem } from "@/components/form/materialItem";
import { TotalPrice } from "@/components/form/TotalPrice";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { parseFromReais } from "@/lib/utils";
import { materialSchema } from "@/schemas/materialForm";
import { usePriceStore } from "@/stores/material-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type FormType = z.infer<typeof materialSchema>;

export default function FormPage() {
  const { id } = useParams();
  const { resetStore, totalPrice } = usePriceStore((state) => state);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["form-select"],
    queryFn: async () => {
      const { data: checkData, error: checkError } = await supabase
        .from("listas")
        .select("id, status")
        .eq("id", id as string)
        .single();

      if (checkError) throw new Error("Não existe uma lista válida");
      if (checkData.status === "filled") {
        return { status: 201, message: "Lista já preenchida" };
      }

      const { data, error } = await supabase
        .from("materiais")
        .select("id, materiais, preco");

      if (error) {
        throw error;
      }
      const transformedData = data.map((item) => ({
        label: item.materiais,
        value: item.id,
        preco: item.preco,
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
    setIsSubmitting(true);
    if (!id) {
      setIsSubmitting(false);
      return console.log("Id undefined");
    }
    const parsed = data.materials.map((item) => {
      return {
        lista_id: id as string,
        quantidade: item.quantity,
        material_id: item.material_id,
        preco: item.preco,
      };
    });

    if (!parsed) {
      setIsSubmitting(false);
      return console.log("Error parsing data");
    }
    const { error: err } = await supabase
      .from("lista_materiais_itens")
      .insert(parsed);

    const { error: updateError } = await supabase
      .from("listas")
      .update({
        status: "filled",
        filled_at: new Date().toISOString(),
        preco_total: totalPrice,
      })
      .eq("id", id as string);

    if (updateError) {
      setIsSubmitting(false);
      throw new Error(updateError.message);
    }

    refetch();
    setIsSubmitting(false);
    return;
  }

  useEffect(() => {
    resetStore();
  }, [resetStore]);

  return (
    <div className="max-w-[100vw] h-screen">
      <Header />
      <main className="flex flex-col mx-auto items-center justify-center mt-3 pb-8 max-w-screen ">
        {isLoading ? (
          <div>Carregando</div>
        ) : (
          <>
            {!error &&
              (Array.isArray(data) ? (
                <>
                  <div className="w-full p-4">
                    <TotalPrice />
                  </div>
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
                              {
                                material_id: undefined!,
                                quantity: 1,
                                preco: 0,
                              },
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
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-11 mt-6 bg-black font-medium"
                        >
                          {isSubmitting ? (
                            <Loader className="animate-spin" />
                          ) : (
                            "Finalizar"
                          )}
                        </Button>
                      </div>
                    </form>
                  </FormProvider>
                </>
              ) : (
                <div className="text-center p-4 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-500">
                  {data?.message}
                </div>
              ))}
          </>
        )}
      </main>
    </div>
  );
}
