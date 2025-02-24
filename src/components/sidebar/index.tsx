import { Home, Inbox } from "lucide-react";
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

const items = [
  {
    title: "Início",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Materiais",
    url: "/materiais",
    icon: Inbox,
  },
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
      <SidebarFooter />
    </Sidebar>
  );
};
