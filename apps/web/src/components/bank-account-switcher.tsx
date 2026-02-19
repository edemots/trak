"use client";

import type { BankAccount } from "@trak/api/routers/bank-account";

import { useMatches, useNavigate } from "@tanstack/react-router";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { PiggyBankIcon } from "lucide-react";
import { LoaderCircleIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { useCallback, useContext, useEffect, useState } from "react";

import {
  CreateBankAccountFormFields,
  useCreateBankAccountForm,
} from "@/components/forms/create-account-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ActiveAccountContext } from "@/contexts/active-account";
import { useHydrated } from "@/lib/utils";

const ALL_BANK_ACCOUNTS_SHORTCUT = "&";
const BANK_ACCOUNT_SHORTCUTS = ["é", '"', "'"];

function CreateBankAccountDialogContent({ onSuccess }: { onSuccess?: () => void }) {
  const { form, isPending } = useCreateBankAccountForm({
    onSuccess: () => {
      onSuccess?.();
    },
  });

  return (
    <DialogContent
      render={
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Ajouter un compte</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau compte bancaire pour gérer vos finances.
            </DialogDescription>
          </DialogHeader>
          <CreateBankAccountFormFields form={form} />
          <DialogFooter>
            <Button disabled={isPending} type="submit">
              {isPending && <LoaderCircleIcon className="animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      }
    />
  );
}

export function BankAccountSwitcher({
  bankAccounts,
}: {
  bankAccounts: Pick<BankAccount, "uid" | "name" | "icon">[];
}) {
  const { isMobile } = useSidebar();
  const matches = useMatches();
  const navigate = useNavigate({
    from: matches.at(-1)?.fullPath || "/",
  });
  const { activeBankAccount: activeBankAccountId } = useContext(ActiveAccountContext);

  const activeBankAccount = activeBankAccountId
    ? bankAccounts.find((bA) => bA.uid === activeBankAccountId)
    : undefined;

  const [dialogOpen, setDialogOpen] = useState(false);
  const isHydrated = useHydrated();

  const selectBankAccount = useCallback(
    async (account: (typeof bankAccounts)[number] | undefined) => {
      await navigate({
        search: (prev) => ({
          ...prev,
          accountId: account?.uid,
        }),
      });
    },
    [navigate],
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (
        event.key === ALL_BANK_ACCOUNTS_SHORTCUT &&
        (event.metaKey || event.ctrlKey) &&
        activeBankAccount !== undefined
      ) {
        event.preventDefault();
        await selectBankAccount(undefined);
      }
      const nextBankAccount = bankAccounts[BANK_ACCOUNT_SHORTCUTS.indexOf(event.key)];
      if (
        BANK_ACCOUNT_SHORTCUTS.includes(event.key) &&
        (event.metaKey || event.ctrlKey) &&
        nextBankAccount &&
        (!activeBankAccount || activeBankAccountId !== nextBankAccount.uid)
      ) {
        event.preventDefault();
        await selectBankAccount(nextBankAccount);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBankAccount, activeBankAccountId, bankAccounts, isHydrated, selectBankAccount]);

  if (!isHydrated) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Skeleton className="size-8 rounded-lg" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <Skeleton className="h-4 w-32" />
            </div>
            <ChevronsUpDownIcon className="ml-auto opacity-30" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger
              nativeButton={true}
              render={
                activeBankAccount ? (
                  <SidebarMenuButton
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    size="lg"
                  >
                    {activeBankAccount.icon && (
                      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <DynamicIcon name={activeBankAccount.icon as IconName} />
                      </div>
                    )}
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{activeBankAccount.name}</span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto" />
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    size="lg"
                  >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      <PiggyBankIcon />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Tous les comptes</span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto" />
                  </SidebarMenuButton>
                )
              }
            />
            <DropdownMenuContent
              align="start"
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  Comptes
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={async () => await selectBankAccount(undefined)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <PiggyBankIcon />
                  </div>
                  Tous les comptes
                  <DropdownMenuShortcut>⌘{1}</DropdownMenuShortcut>
                </DropdownMenuItem>
                {bankAccounts.map((account, index) => (
                  <DropdownMenuItem
                    className="gap-2 p-2"
                    key={account.uid}
                    onClick={async () => await selectBankAccount(account)}
                  >
                    {account.icon && (
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <DynamicIcon name={account.icon as IconName} />
                      </div>
                    )}
                    {account.name}
                    <DropdownMenuShortcut>⌘{index + 2}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DialogTrigger
                  nativeButton={false}
                  render={
                    <DropdownMenuItem className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                        <PlusIcon className="size-4" />
                      </div>
                      <div className="text-muted-foreground font-medium">Ajouter un compte</div>
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <CreateBankAccountDialogContent
            onSuccess={() => {
              setDialogOpen(false);
            }}
          />
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
