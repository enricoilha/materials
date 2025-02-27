import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Loader, Lock, LogInIcon, User } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  login: z
    .string({ required_error: "Campo obrigatório" })
    .min(1, { message: "Campo obrigatório" }),
  code: z
    .string({ required_error: "Campo obrigatório" })
    .min(6, { message: "Insira um código válido" }),
});

type FormType = z.infer<typeof formSchema>;

export function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const [loginError, setLoginError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormType) => {
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: `${data.login}@albusdente.com.br`,
      password: data.code,
    });

    if (error) {
      setIsLoading(false);
      return setLoginError("Usuário ou senha estão errados");
    }

    router.push("/");

    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-5 w-full md:max-w-[600px] mx-auto"
    >
      {loginError && (
        <div className="p-4 border rounded-lg text-red-800 border-red-500 bg-red-50 flex items-center justify-center">
          {loginError}
        </div>
      )}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Usuário
        </Label>
        <div className="relative">
          <User
            size={19}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            {...register("login")}
            className={`pl-10 ${errors.login ? "border-red-500" : ""}`}
          />
        </div>
        {errors.login && (
          <p className="text-sm text-red-500">{errors.login.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Senha
        </Label>
        <div className="relative">
          <Lock
            size={19}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("code")}
            className={`pl-10 ${errors.code ? "border-red-500" : ""}`}
          />
        </div>
        {errors.code && (
          <p className="text-sm text-red-500">{errors.code.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full h-11" disabled={isLoading}>
        {isLoading ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogInIcon className="mr-2 h-4 w-4" />
        )}
        Entrar
      </Button>
    </form>
  );
}
