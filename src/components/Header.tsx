"use client";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function Header() {
  const pathname = usePathname();
  async function signOut() {
    await supabase.auth.signOut();
  }
  return (
    <header className="w-full max-w-[100vw] h-16 border-b flex items-center justify-between px-4">
      {pathname !== "/auth/login" && (
        <div className="w-1/3">
          <Button className="w-5/6" onClick={signOut} variant={"secondary"}>
            <LogOut /> Sair
          </Button>
        </div>
      )}
      <div className="font-semibold text-2xl w-1/3 flex justify-center items-center text-center">
        Materiais
      </div>
      <div className="w-1/3" />
    </header>
  );
}
