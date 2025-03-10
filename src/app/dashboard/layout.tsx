"use client";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/lib/supabase";
import Head from "next/head";
import { redirect } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function FormLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        redirect("/auth/login");
      }

      if (session.user.user_metadata.role !== "admin") {
        console.log("not admin");
        redirect("/");
      }
    };

    check();
  }, []);
  return (
    <div className="md:p-10 ">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      {children}
    </div>
  );
}
