"use client";

import type { LucideIcon } from "lucide-react";

import { Link, useMatchRoute } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { useContext } from "react";

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

export function NavManage({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    requiresAccount?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const matchRoute = useMatchRoute();
  const { activeBankAccount } = useContext(ActiveAccountContext);
  const linkSearch = {
    accountId: activeBankAccount,
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Gestion</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isBlockedWithoutAccount = item.requiresAccount && !activeBankAccount;

          if (isBlockedWithoutAccount) {
            return null;
          }

          return item.items && item.items.length > 0 ? (
              <Collapsible
                className="group/collapsible"
                defaultOpen={matchRoute({ to: item.url, fuzzy: true }) !== false}
                key={item.title}
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
            <SidebarMenuItem key={item.title}>
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
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
