import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { LayersIcon, PlusIcon, TrashIcon } from "lucide-react";
import { memo, useContext, useState } from "react";
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActiveAccountContext } from "@/contexts/active-account";
import {
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useSuspenseGroups,
} from "@/lib/queries/group";

export const Route = createFileRoute("/(app)/(dashboard)/categories/")({
  loader: async ({ context: { queryClient, trpc }, location }) => {
    const accountId = new URLSearchParams(location.search).get("accountId");
    if (!accountId) {
      throw redirect({
        replace: true,
        to: "/dashboard",
      });
    }

    return await queryClient.ensureQueryData(
      trpc.group.all.queryOptions({
        bankAccountUid: accountId,
      }),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { activeBankAccount } = useContext(ActiveAccountContext);
  if (!activeBankAccount) {
    return null;
  }

  const { data: groups } = useSuspenseGroups(activeBankAccount);

  const deleteGroup = useDeleteGroupMutation();

  return (
    <div className="flex h-full flex-col space-y-12">
      <header className="space-y-6">
        <h1 className="flex items-center gap-4 text-4xl font-bold">
          <LayersIcon className="inline size-10" />
          Catégories
        </h1>
      </header>
      <section className="flex-1">
        {groups.length > 0 ? (
          <ul className="isolate grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            <li className="isolate">
              <CreateGroupForm bankAccountUid={activeBankAccount} />
            </li>
            {groups.map((group) => (
              <li className="isolate" key={group.uid}>
                <AlertDialog>
                  <ContextMenu>
                    <ContextMenuTrigger
                      render={
                        <Link search={(prev) => prev} params={{ groupId: group.uid }} to="/categories/$groupId">
                          <Card
                            className="after:from-background/64 relative h-full before:absolute before:inset-0 before:z-0 before:flex before:items-center before:justify-center before:text-[24rem] before:opacity-20 before:saturate-200 before:content-(--emoji) after:absolute after:inset-0 after:z-10 after:bg-linear-to-r after:to-transparent after:backdrop-blur-3xl"
                            style={
                              {
                                "--emoji": `"${group.icon}"`,
                              } as React.CSSProperties
                            }
                          >
                            <CardHeader className="relative z-20 gap-8">
                              <CardDescription className="text-5xl text-shadow-sm">
                                {group.icon}
                              </CardDescription>
                              <div>
                                <CardTitle className="dark:text-shadow-sm">{group.name}</CardTitle>
                                <span className="text-foreground text-sm dark:text-shadow-2xs">
                                  {group.categories.length} catégorie(s)
                                </span>
                              </div>
                            </CardHeader>
                          </Card>
                        </Link>
                      }
                    />

                    <ContextMenuContent>
                      <AlertDialogTrigger
                        nativeButton={false}
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
                        Supprimer la catégorie {group.icon} {group.name} ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Elle sera supprimée définitivement.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={deleteGroup.isPending}
                        onClick={() =>
                          deleteGroup.mutate(
                            { uid: group.uid, bankAccountUid: activeBankAccount },
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
        ) : (
          <Empty className="before:text-primary/25 relative h-full overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(currentColor_1px,transparent_1px)] before:mask-[radial-gradient(circle_at_50%_50%,black_0%,black_32%,transparent_78%)] before:bg-size-[8px_8px] before:[-webkit-mask-image:radial-gradient(circle_at_50%_50%,black_0%,black_32%,transparent_78%)]">
            <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-6">
              <EmptyHeader>
                <EmptyMedia className="size-16" variant="icon">
                  <LayersIcon className="size-8" />
                </EmptyMedia>
                <EmptyTitle className="text-xl">Aucune catégorie</EmptyTitle>
                <EmptyDescription>
                  Vous n'avez pas encore créé de catégorie. Commencez par en ajouter une.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="max-w-none">
                <CreateGroupForm bankAccountUid={activeBankAccount}>
                  <div>
                    <Button>Créer une nouvelle catégorie</Button>
                  </div>
                </CreateGroupForm>
              </EmptyContent>
            </div>
          </Empty>
        )}
      </section>
    </div>
  );
}

export const CreateGroupForm = memo(
  ({
    bankAccountUid,
    categoryId,
    children,
  }: {
    bankAccountUid: string;
    categoryId?: string;
    children?: React.ReactElement;
  }) => {
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

    const createGroup = useCreateGroupMutation();

    const form = useForm({
      defaultValues: {
        icon: "😀",
        name: "",
      },
      onSubmit: ({ value }) => {
        createGroup.mutate(
          {
            icon: value.icon,
            name: value.name,
            bankAccountUid,
          },
          {
            onSuccess: () => {
              setIsCreateGroupOpen(false);
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
          parentId: z.literal(categoryId),
        }),
      },
    });

    return (
      <Dialog onOpenChange={setIsCreateGroupOpen} open={isCreateGroupOpen}>
        <DialogTrigger
          nativeButton={false}
          render={
            children || (
              <Card className="hover:bg-card relative z-20 h-full border border-dashed ring-0 transition-all hover:cursor-pointer">
                <CardHeader className="gap-8">
                  <CardDescription className="text-5xl">
                    <PlusIcon className="size-12" />
                  </CardDescription>
                  <CardTitle>Nouvelle catégorie</CardTitle>
                </CardHeader>
              </Card>
            )
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
                  nativeButton={true}
                  onClick={() => {
                    form.reset();
                  }}
                  render={<Button variant="outline">Annuler</Button>}
                />
                <Button disabled={createGroup.isPending} type="submit">
                  Ajouter la catégorie
                </Button>
              </DialogFooter>
            </form>
          }
        />
      </Dialog>
    );
  },
);
