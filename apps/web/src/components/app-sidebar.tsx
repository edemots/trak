import type { BankAccount } from "@trak/api/routers/bank-account";
import type { User } from "better-auth";
import type * as React from "react";

import { ArrowUpDownIcon, ChartPieIcon, LayersIcon } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import Logo from "./logo";
import { NavManage } from "./nav-manage";

const data = {
  main: [
    {
      title: "Suivi",
      url: "/dashboard",
      icon: ChartPieIcon,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: ArrowUpDownIcon,
    },
  ],
  manage: [
    {
      title: "Catégories",
      url: "/categories",
      icon: LayersIcon,
      requiresAccount: true,
    },
  ],
};

export function AppSidebar({
  user,
  bankAccounts,
  ...props
}: {
  user: User;
  bankAccounts?: Pick<BankAccount, "uid" | "name" | "icon">[];
} & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="none" {...props}>
      <SidebarHeader className="flex-row items-center gap-2">
        <Logo size={48} />
        <p className="text-2xl font-bold">trak</p>
      </SidebarHeader>
      <SidebarContent>
        <NavMain bankAccounts={bankAccounts} items={data.main} />
        <NavManage items={data.manage} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
