"use client";
import { Home, Inbox, LogOut, User } from "lucide-react";
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

const items = [
  {
    title: "Início",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Materiais",
    url: "/dashboard/materiais",
    icon: Inbox,
  },
  { title: "Profissionais", url: "/dashboard/profissionais", icon: User },
];

export const AppSidebar = () => {
  return (
    <Sidebar className="hidden xl:inline">
      <SidebarHeader className="p-3">
        <div className="font-semibold text-xl tracking-wide my-10 flex items-center ">
          Materiais
        </div>
      </SidebarHeader>
      <SidebarContent className="p-1">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
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
