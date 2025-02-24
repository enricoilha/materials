"use client";
import { Header } from "@/components/Header";
import { Login } from "@/components/Login";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
//Login:SIND4839
//code: M0318f

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) router.push("/");
    };
    checkSession();
  }, []);

  return (
    <>
      <Header />
      <Login />
    </>
  );
}
