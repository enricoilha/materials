"use client";

import { MaterialItem } from "@/components/form/materialItem";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { materialSchema } from "@/schemas/materialForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type FormType = z.infer<typeof materialSchema>;

export default function FormPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["form-select"],
    queryFn: async () => {
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
    return console.log(data);
  }

  return (
    <div className="max-w-[100vw] h-screen">
      <main className="flex flex-col mx-auto items-center justify-center mt-3 max-w-screen ">
        <p className="text-base text-muted-foreground mb-5">
          Insira os materiais que precisa
        </p>

        {!isLoading
          ? data && (
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
            )
          : null}
      </main>
    </div>
  );
}
