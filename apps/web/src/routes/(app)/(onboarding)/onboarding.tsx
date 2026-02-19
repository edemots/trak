import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";

import {
  CreateBankAccountFormFields,
  useCreateBankAccountForm,
} from "@/components/forms/create-account-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/(app)/(onboarding)/onboarding")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const { form, isPending } = useCreateBankAccountForm({
    onSuccess: async () => {
      await navigate({ to: "/dashboard" });
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <Card className="min-w-sm">
        <CardHeader>
          <CardTitle>Ajouter un compte</CardTitle>
          <CardDescription>
            Ajoutez un compte bancaire pour commencer à gérer vos finances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateBankAccountFormFields form={form} />
        </CardContent>
        <CardFooter className="justify-end">
          <Button disabled={isPending} type="submit">
            {isPending && <LoaderCircleIcon className="animate-spin" />}
            Commencer à gérer mes comptes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
