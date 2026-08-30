import { BookOpen, CircleHelp, Home, Layers3, Users } from "lucide-react";

import { SidebarAppearance } from "@/components/Common/Appearance";
import { Logo } from "@/components/Common/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/useAuth";
import { type Item, Main } from "./Main";
import { User } from "./User";

const baseItems: Item[] = [{ icon: Home, title: "Dashboard", path: "/" }];

export function AppSidebar() {
  const { user: currentUser } = useAuth();

  let items: Item[] = baseItems;

  if (currentUser?.role === "editor" || currentUser?.is_superuser) {
    items = [
      ...baseItems,
      { icon: BookOpen, title: "Subjects", path: "/subjects" },
      { icon: Layers3, title: "Topics", path: "/topics" },
      { icon: CircleHelp, title: "Questions", path: "/questions" },
    ];
  }

  if (currentUser?.is_superuser) {
    items = [...items, { icon: Users, title: "Admin", path: "/admin" }];
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent>
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
