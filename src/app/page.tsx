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
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.id) {
        throw new Error("User not authenticated");
      }

      // Get not filled lists
      const { data: notFilledLists, error: notFilledError } = await supabase
        .from("listas")
        .select("id, created_at, month, profissional_id!inner(user_id)")
        .filter("profissional_id.user_id", "eq", user.id)
        .filter("status", "eq", "not_filled");

      if (notFilledError) {
        throw notFilledError;
      }

      // Get filled but unconfirmed lists
      const { data: filledLists, error: filledError } = await supabase
        .from("listas")
        .select(
          `
          id, 
          created_at, 
          month, 
          profissional_id!inner(user_id),
          delivery_confirmations!left(id)
        `
        )
        .filter("profissional_id.user_id", "eq", user.id)
        .filter("status", "eq", "filled")
        .is("delivery_confirmations.id", null);

      if (filledError) {
        throw filledError;
      }

      return {
        notFilledLists: notFilledLists || [],
        filledLists: filledLists || [],
      };
    },
  });

  function onPressList(id: string) {
    return router.push(`/${id}`);
  }

  useEffect(() => {
    const check = async () => {
      const response = await fetch("/api/session");
      const { session } = await response.json();

      if (!session) {
        redirect("/auth/login");
      }

      if (session.user.user_metadata.role === "admin") {
        redirect("/dashboard");
      }
    };

    check();
  }, []);

  console.log(data);
  return (
    <div className="flex flex-col items-center md:max-w-[600px] md:mx-auto">
      <Header />
      <p className="my-4 p-3 text-center text-sm text-muted-foreground">
        Selecione uma lista abaixo para preencher com os materiais necessários
      </p>

      <div className="h-[.5px] border w-[85%] mb-4" />

      <div className="w-[85%] ">
        {data?.notFilledLists.length === 0 && data?.filledLists.length === 0 ? (
          <div className="text-center p-4 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-500">
            Não há listas disponíveis
          </div>
        ) : (
          <>
            {data?.notFilledLists.map((item, index) => (
              <div
                className="flex flex-col justify-center w-full p-2 bg-white rounded-lg mb-4"
                key={`List-Item_key${index}`}
              >
                <p className="font-semibold text-left">Lista disponível</p>
                <p className="my-1 font-medium">
                  {typeof item.month === "number"
                    ? months[item.month]
                    : "Mês não especificado"}
                </p>
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
            ))}

            {data?.filledLists.map((item, index) => (
              <div
                className="flex flex-col justify-center w-full p-2 bg-white rounded-lg mb-4"
                key={`Filled-List-Item_key${index}`}
              >
                <p className="font-semibold text-left">Lista preenchida</p>
                <p className="my-1 font-medium">
                  {typeof item.month === "number"
                    ? months[item.month]
                    : "Mês não especificado"}
                </p>
                <p className="my-2 text-sm text-muted-foreground">
                  Pressione o botão abaixo para confirmar a entrega dos
                  materiais
                </p>
                <Button
                  type="button"
                  onClick={() => onPressList(item.id)}
                  className="text-sm font-bold h-10 px-4 rounded-xl"
                >
                  Confirmar Entrega
                </Button>
                <p className="text-gray-700 text-sm mt-2"></p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
