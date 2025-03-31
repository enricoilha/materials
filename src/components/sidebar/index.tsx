"use client";
import { Calendar, Home, Inbox, LogOut, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Visão Geral",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Materiais",
    url: "/dashboard/materials-overview",
    icon: Inbox,
  },
  {
    title: "Profissionais",
    url: "/dashboard/professional-history",
    icon: User,
  },
  {
    title: "Relatório por Período",
    url: "/dashboard/monthly-report",
    icon: Calendar,
  },
];
export const AppSidebar = () => {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  return (
    <Sidebar className={`hidden ${isDashboard ? "xl:inline" : ""}`}>
      <SidebarHeader className="p-5">
        <div className="font-semibold text-xl tracking-wide my-10 flex items-center ">
          Materiais
        </div>
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`${
                  pathname === item.url ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={() => supabase.auth.signOut()} variant={"outline"}>
          <LogOut /> Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
