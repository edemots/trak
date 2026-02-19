import type { BankAccount } from "@trak/api/routers/bank-account";
import type { LucideIcon } from "lucide-react";

import { Link, useMatchRoute } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import React, { useContext } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ActiveAccountContext } from "@/contexts/active-account";

import { BankAccountSwitcher } from "./bank-account-switcher";

export function NavMain({
  items,
  bankAccounts,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  bankAccounts?: Pick<BankAccount, "uid" | "name" | "icon">[];
}) {
  const matchRoute = useMatchRoute();
  const { activeBankAccount } = useContext(ActiveAccountContext);
  const linkSearch = {
    accountId: activeBankAccount,
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Compte</SidebarGroupLabel>
      <div className="pb-2">
        <BankAccountSwitcher bankAccounts={bankAccounts || []} />
      </div>
      <SidebarMenu>
        {items.map((item) => (
          <React.Fragment key={item.title}>
            {item.items && item.items.length > 0 ? (
              <Collapsible
                className="group/collapsible"
                defaultOpen={matchRoute({ to: item.url, fuzzy: true }) !== false}
                render={
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          isActive={matchRoute({ to: item.url, fuzzy: true }) !== false}
                          tooltip={item.title}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ArrowRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      }
                    />
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              render={
                                <Link search={linkSearch} to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              }
                            />
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                }
              />
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={matchRoute({ to: item.url, fuzzy: true }) !== false}
                  render={
                    <Link search={linkSearch} to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            )}
          </React.Fragment>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
