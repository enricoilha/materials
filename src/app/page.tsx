"use client";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function HomePage() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["home-query"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("listas")
        .select("id, created_at, month")
        .match({
          status: "not_filled",
          profissional_id: user?.user_metadata.professional_id,
        });

      if (!data) {
        throw new Error("No data found");
      }

      return data;
    },
  });

  function onPressList(id: string) {
    return router.push(`/${id}`);
  }

  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        redirect("/auth/login");
      }
    };

    check();
  }, []);

  return (
    <div className="flex flex-col items-center md:max-w-[600px] md:mx-auto">
      <Header />
      <p className="my-4 p-3 text-center text-sm text-muted-foreground">
        Selecione uma lista abaixo para preencher com os materiais necessários
      </p>

      <div className="h-[.5px] border w-[85%] mb-4" />

      <div className="w-[85%] ">
        {data?.[0] === undefined ? (
          <div className="text-center p-4 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-500">
            Não há listas disponíveis
          </div>
        ) : (
          data?.map((item, index) => (
            <div
              className="flex flex-col justify-center w-full p-2 bg-white  rounded-lg"
              key={`List-Item_key${index}`}
            >
              <p className="font-semibold text-left">Lista disponível</p>
              <p className="my-1 font-medium">{months[item.month]}</p>
              <p className="my-2 text-sm text-muted-foreground">
                Pressione o botão abaixo para preencher a lista de materiais
              </p>
              <Button
                type="button"
                onClick={() => onPressList(item.id)}
                className="text-sm font-bold h-10 px-4 rounded-xl"
              >
                Preencher Lista
              </Button>
              <p className="text-gray-700 text-sm mt-2"></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
