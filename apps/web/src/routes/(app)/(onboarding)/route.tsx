import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import Logo from "@/components/logo";
import PixelBlast from "@/components/pixel-blast";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/(app)/(onboarding)")({
  beforeLoad: async ({ context }) => {
    const bankAccounts = await context.queryClient.ensureQueryData(
      context.trpc.bankAccount.all.queryOptions(),
    );
    if (bankAccounts.length > 0) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative isolate grid place-content-center">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 z-0 hidden opacity-100 duration-1500 dark:block starting:opacity-0">
        <PixelBlast
          color="#a1a1a1"
          edgeFade={0.25}
          enableRipples={true}
          rippleSpeed={3}
          patternDensity={0.5}
          patternScale={5}
          pixelSize={3}
          pixelSizeJitter={1}
          speed={0.1}
          variant="triangle"
        />
      </div>
      <div className="absolute inset-0 z-0 block opacity-100 duration-1500 dark:hidden starting:opacity-0">
        <PixelBlast
          color="#f5f5f5"
          edgeFade={0.25}
          enableRipples={true}
          rippleSpeed={3}
          patternDensity={0.5}
          patternScale={5}
          pixelSize={3}
          pixelSizeJitter={1}
          speed={0.1}
          variant="triangle"
        />
      </div>
      <div className="relative isolate z-20 grid justify-items-center gap-16">
        <Logo />
        <Outlet />
      </div>
    </div>
  );
}
