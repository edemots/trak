import type { BankAccount } from "@trak/db/schema/bank-account";

import { useForm } from "@tanstack/react-form";
import { LoaderCircleIcon } from "lucide-react";
import { iconNames } from "lucide-react/dynamic";
import { toast } from "sonner";
import z from "zod";

import IconCombobox from "@/components/icon-combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateBankAccountMutation } from "@/lib/queries/bank-account";
// import { useSetActiveBankAccount } from "@/store/bank-account";

export interface CreateBankAccountFormOptions {
  onSuccess?: (bankAccount: BankAccount) => void;
}

export function useCreateBankAccountForm(options?: CreateBankAccountFormOptions) {
  const setActiveAccount = () => {};
  // const setActiveAccount = useSetActiveBankAccount();
  const createBankAccount = useCreateBankAccountMutation();

  const form = useForm({
    defaultValues: {
      name: "",
      icon: "piggy-bank",
    },
    onSubmit: ({ value }) => {
      createBankAccount.mutate(
        {
          name: value.name,
          icon: value.icon,
        },
        {
          onSuccess: (newBankAccount) => {
            toast.success("Nouveau compte ajouté.");
            setActiveAccount(newBankAccount);
            options?.onSuccess?.(newBankAccount);
          },
          onError: (error) => {
            toast.error("Impossible d'ajouter le compte");
            console.error(error);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Nom du compte requis"),
        icon: z.enum(iconNames, {
          message: "Sélectionnez une icône",
        }),
      }),
    },
  });

  return { form, isPending: createBankAccount.isPending };
}

export type CreateBankAccountForm = ReturnType<typeof useCreateBankAccountForm>["form"];

export function CreateBankAccountFormFields({ form }: { form: CreateBankAccountForm }) {
  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-none">
        <form.Field name="icon">
          {(field) => (
            <div>
              <Label htmlFor={field.name}>&nbsp;</Label>
              <IconCombobox field={field} />
              {field.state.meta.errors.map((error) => (
                <p className="text-red-500" key={error?.message}>
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>
      <div className="flex-1">
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Nom du compte</Label>
              <Input
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="text"
                value={field.state.value}
              />
              {field.state.meta.errors.map((error) => (
                <p className="text-red-500" key={error?.message}>
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>
    </div>
  );
}

export function CreateBankAccountSubmitButton({
  isPending,
  children,
}: {
  isPending: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {isPending && <LoaderCircleIcon className="animate-spin" />}
      {children}
    </>
  );
}
