import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { queryClient } from "@/router";
import { useTRPC } from "@/utils/trpc";

import { authClient } from "../auth-client";
import { generateRandomUid } from "../utils";

export function useBankAccounts() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.bankAccount.all.queryOptions());
}

export function useBankAccount(id: string) {
  const trpc = useTRPC();
  return useQuery(trpc.bankAccount.byUid.queryOptions({ uid: id }));
}

export function useCreateBankAccountMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.bankAccount.create.mutationOptions({
      onMutate: async (newBankAccount) => {
        await queryClient.cancelQueries({
          queryKey: trpc.bankAccount.all.queryKey(),
        });

        const previousBankAccounts = queryClient.getQueryData(trpc.bankAccount.all.queryKey());

        const session = await authClient.getSession();
        queryClient.setQueryData(trpc.bankAccount.all.queryKey(), (old) => [
          ...(old || []),
          {
            id: Number.MAX_SAFE_INTEGER,
            uid: generateRandomUid(),
            name: newBankAccount.name,
            icon: newBankAccount.icon,
            createdAt: new Date(),
            updatedAt: new Date(),
            // biome-ignore lint/style/noNonNullAssertion: ok
            userId: session.data!.user.id,
          },
        ]);

        return { previousBankAccounts };
      },
      onError: (_error, _newBankAccount, context) => {
        queryClient.setQueryData(trpc.bankAccount.all.queryKey(), context?.previousBankAccounts);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.all.queryKey(),
        });
      },
    }),
  );
}

export function useUpdateBankAccountMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.bankAccount.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.all.queryKey(),
        });
        // utils.stats.accountBalances.invalidate();
      },
    }),
  );
}

export function useDeleteBankAccountMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.bankAccount.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.all.queryKey(),
        });
        // utils.stats.invalidate();
      },
    }),
  );
}
