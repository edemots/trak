import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import EmojiPicker from "@/components/emoji-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActiveAccountContext } from "@/contexts/active-account";
import { useCreateCategoryMutation, useDeleteCategoryMutation } from "@/lib/queries/category";
import { useSuspenseGroup } from "@/lib/queries/group";

export const Route = createFileRoute("/(app)/(dashboard)/categories/$groupId")({
  loader: async ({ context, params, location }) => {
    const accountId = new URLSearchParams(location.search).get("accountId");
    if (!accountId) {
      throw redirect({
        replace: true,
        to: "/dashboard",
      });
    }

    return await context.queryClient.ensureQueryData(
      context.trpc.group.byUid.queryOptions({
        uid: params.groupId,
        bankAccountUid: accountId,
      }),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { groupId } = Route.useParams();
  const { activeBankAccount } = useContext(ActiveAccountContext);
  if (!activeBankAccount) {
    return null;
  }

  const { data: group } = useSuspenseGroup(groupId, activeBankAccount);
  const deleteCategory = useDeleteCategoryMutation();

  if (!group) {
    return null;
  }

  return (
    <div className="space-y-12">
      <header className="space-y-6">
        <h1 className="flex items-center gap-4 text-4xl font-bold">
          <span>{group.icon}</span>
          <span>{group.name}</span>
        </h1>
        <Button
          nativeButton={false}
          render={
            <Link search={(prev) => prev} to={"/categories"}>
              <ArrowLeftIcon className="size-[1lh]" />
              Retour
            </Link>
          }
          variant="outline"
        />
      </header>
      <section>
        <ul className="isolate grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          <li className="isolate">
            <CreateCategoryForm bankAccountUid={activeBankAccount} />
          </li>
          {group.categories?.map((category) => (
            <li className="isolate" key={category.uid}>
              <AlertDialog>
                <ContextMenu>
                  <ContextMenuTrigger
                    render={
                      <Card
                        className="after:from-background/64 relative h-full before:absolute before:inset-0 before:z-0 before:flex before:items-center before:justify-center before:text-[24rem] before:opacity-20 before:saturate-200 before:content-(--emoji) after:absolute after:inset-0 after:z-10 after:bg-linear-to-r after:to-transparent after:backdrop-blur-3xl"
                        style={
                          {
                            "--emoji": `"${category.icon}"`,
                          } as React.CSSProperties
                        }
                      >
                        <CardHeader className="relative z-20 gap-8">
                          <CardDescription className="text-5xl text-shadow-sm">
                            {category.icon}
                          </CardDescription>
                          <CardTitle className="dark:text-shadow-sm">{category.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    }
                  />

                  <ContextMenuContent>
                    <AlertDialogTrigger
                      render={
                        <ContextMenuItem variant="destructive">
                          <TrashIcon />
                          Supprimer
                        </ContextMenuItem>
                      }
                    />
                  </ContextMenuContent>
                </ContextMenu>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Supprimer la catégorie {category.icon} {category.name} ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Elle sera supprimée définitivement.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deleteCategory.isPending}
                      onClick={() =>
                        deleteCategory.mutate(
                          {
                            uid: category.uid,
                            groupUid: group.uid,
                            bankAccountUid: activeBankAccount,
                          },
                          {
                            onSuccess: () => {
                              toast.success("Catégorie supprimée.");
                            },
                          },
                        )
                      }
                      variant="destructive"
                    >
                      Confirmer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export const CreateCategoryForm = ({ bankAccountUid }: { bankAccountUid: string }) => {
  const { groupId } = Route.useParams();
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  const createCategory = useCreateCategoryMutation();

  const form = useForm({
    defaultValues: {
      icon: "😀",
      name: "",
      groupUid: groupId,
      bankAccountUid,
    },
    onSubmit: ({ value }) => {
      createCategory.mutate(
        {
          icon: value.icon,
          name: value.name,
          groupUid: value.groupUid,
          bankAccountUid: value.bankAccountUid,
        },
        {
          onSuccess: () => {
            setIsCreateCategoryOpen(false);
            toast.success("Nouvelle catégorie ajoutée.");
            form.reset();
          },
          onError: (error: any) => {
            console.error("Impossible d'ajouter la catégorie", error);
            toast.error("Impossible d'ajouter la catégorie");
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        icon: z.string().min(1, "Icône requise"),
        name: z.string().min(1, "Nom de la catégorie requis"),
        groupUid: z.literal(groupId),
        bankAccountUid: z.literal(bankAccountUid),
      }),
    },
  });

  return (
    <Dialog onOpenChange={setIsCreateCategoryOpen} open={isCreateCategoryOpen}>
      <DialogTrigger
        nativeButton={false}
        render={
          <Card className="hover:bg-card relative z-20 h-full border border-dashed ring-0 transition-all hover:cursor-pointer">
            <CardHeader className="gap-8">
              <CardDescription className="text-5xl">
                <PlusIcon className="size-12" />
              </CardDescription>
              <CardTitle>Nouvelle catégorie</CardTitle>
            </CardHeader>
          </Card>
        }
      />
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
              <DialogTitle>Nouvelle catégorie</DialogTitle>
              <DialogDescription>
                Créez une nouvelle catégorie pour y ranger des transactions
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <form.Field name="name">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Nom de la catégorie</Label>
                      <Input
                        autoFocus
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
              <div className="min-w-0 shrink grow-0">
                <form.Field name="icon">
                  {(field) => (
                    <div>
                      <Label htmlFor={field.name}>&nbsp;</Label>
                      <EmojiPicker field={field} />
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
            <DialogFooter>
              <DialogClose
                onClick={() => {
                  form.reset();
                }}
                render={<Button variant="outline">Annuler</Button>}
              />
              <Button disabled={createCategory.isPending} type="submit">
                Ajouter la catégorie
              </Button>
            </DialogFooter>
          </form>
        }
      />
    </Dialog>
  );
};
