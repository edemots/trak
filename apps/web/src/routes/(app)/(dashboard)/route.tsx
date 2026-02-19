import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import z from "zod";

import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ActiveAccountContext } from "@/contexts/active-account";
import { getUser } from "@/functions/get-user";
import { useHydrated } from "@/lib/utils";

export const dashboardSearchSchema = z.object({
  accountId: z.string().optional(),
});

export const Route = createFileRoute("/(app)/(dashboard)")({
  validateSearch: dashboardSearchSchema,
  beforeLoad: async ({ context, location, search }) => {
    const session = await getUser();
    if (!session) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.href },
      });
    }

    const bankAccounts = await context.queryClient.ensureQueryData(
      context.trpc.bankAccount.all.queryOptions(),
    );
    if (bankAccounts.length === 0) {
      throw redirect({
        to: "/onboarding",
      });
    }

    const hasValidSearchAccountId =
      !search.accountId || bankAccounts.some((account) => account.uid === search.accountId);

    if (!hasValidSearchAccountId) {
      throw redirect({
        replace: true,
        to: location.pathname,
        search: (prev) => ({
          ...prev,
          accountId: undefined,
        }),
      });
    }

    return {
      session,
      bankAccounts,
      activeAccountId: search.accountId,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { accountId } = Route.useSearch();
  const { session, bankAccounts, activeAccountId } = Route.useRouteContext();
  const isHydrated = useHydrated();

  const resolvedActiveAccountId = isHydrated
    ? (accountId ?? activeAccountId)
    : activeAccountId;

  return (
    <ActiveAccountContext value={{ activeBankAccount: resolvedActiveAccountId }}>
      <SidebarProvider>
        {session.user && <AppSidebar bankAccounts={bankAccounts} user={session.user} />}
        <SidebarInset>
          <header className="relative flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="absolute top-4 right-4 z-10">
              <ThemeToggle />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ActiveAccountContext>
  );
}
