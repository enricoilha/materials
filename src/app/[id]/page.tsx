"use client";

import { MaterialItem } from "@/components/form/materialItem";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { materialSchema } from "@/schemas/materialForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type FormType = z.infer<typeof materialSchema>;

export default function FormPage() {
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
    <>
      <Header />

      <main className="flex flex-col mx-auto items-center justify-center mt-3 w-screen ">
        <p className="text-base text-muted-foreground mb-5">
          Insira os materiais que precisa
        </p>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex flex-col px-3 space-y-4 "
          >
            {fields.map((field, idx) => (
              <MaterialItem
                index={idx}
                key={field.id}
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
      </main>
    </>
  );
}
