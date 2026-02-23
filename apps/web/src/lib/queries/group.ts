import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { generateRandomUid } from "@/lib/utils";
import { queryClient } from "@/router";
import { useTRPC } from "@/utils/trpc";

export function useGroups(bankAccountUid: string) {
  const trpc = useTRPC();
  return useQuery(trpc.group.all.queryOptions({ bankAccountUid }));
}

export function useSuspenseGroups(bankAccountUid: string) {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.group.all.queryOptions({ bankAccountUid }));
}

export function useGroup(uid: string, bankAccountUid: string) {
  const trpc = useTRPC();
  return useQuery(trpc.group.byUid.queryOptions({ uid, bankAccountUid }));
}

export function useSuspenseGroup(uid: string, bankAccountUid: string) {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.group.byUid.queryOptions({ uid, bankAccountUid }));
}

export function useCreateGroupMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.group.create.mutationOptions({
      onMutate: async (newGroup) => {
        await queryClient.cancelQueries({
          queryKey: trpc.group.all.queryKey({ bankAccountUid: newGroup.bankAccountUid }),
        });

        const previousGroups = queryClient.getQueryData(
          trpc.group.all.queryKey({ bankAccountUid: newGroup.bankAccountUid }),
        );

        queryClient.setQueryData(
          trpc.group.all.queryKey({ bankAccountUid: newGroup.bankAccountUid }),
          (old) =>
          old
            ? [
                ...old,
                {
                  uid: generateRandomUid(),
                  name: newGroup.name,
                  icon: newGroup.icon,
                  ...(newGroup.withOther
                    ? {
                        categories: [
                          {
                            uid: generateRandomUid(),
                            name: "Autre",
                            icon: "📂",
                          },
                        ],
                      }
                    : { categories: [] }),
                },
              ].sort((a, b) => a.name.localeCompare(b.name))
            : old,
        );

        return { previousGroups };
      },
      onError: (_error, newGroup, context) => {
        queryClient.setQueryData(
          trpc.group.all.queryKey({ bankAccountUid: newGroup.bankAccountUid }),
          context?.previousGroups,
        );
      },
      onSettled: async (_data, _error, newGroup) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.group.all.queryKey({ bankAccountUid: newGroup.bankAccountUid }),
        });
      },
    }),
  );
}

// // export function useUpdateCategoryMutation() {
// // 	return useMutation(
// // 		trpc.category.update.mutationOptions({
// // 			onSuccess: () => {
// // 				queryClient.invalidateQueries({
// // 					queryKey: trpc.category.get.queryKey(),
// // 				});
// // 			},
// // 		})
// // 	);
// // }

export function useDeleteGroupMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.group.delete.mutationOptions({
      onMutate: async (deletedGroup) => {
        await Promise.all([
          queryClient.cancelQueries({
            queryKey: trpc.group.all.queryKey({ bankAccountUid: deletedGroup.bankAccountUid }),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.group.byUid.queryKey({
              uid: deletedGroup.uid,
              bankAccountUid: deletedGroup.bankAccountUid,
            }),
          }),
        ]);

        const previousGroups = queryClient.getQueryData(
          trpc.group.all.queryKey({ bankAccountUid: deletedGroup.bankAccountUid }),
        );
        const previousGroup = queryClient.getQueryData(
          trpc.group.byUid.queryKey({
            uid: deletedGroup.uid,
            bankAccountUid: deletedGroup.bankAccountUid,
          }),
        );

        queryClient.setQueryData(
          trpc.group.all.queryKey({ bankAccountUid: deletedGroup.bankAccountUid }),
          (old) => (old ? old.filter((group) => group.uid !== deletedGroup.uid) : old),
        );

        return { previousGroups, previousGroup };
      },
      onError: (_error, deletedGroup, context) => {
        queryClient.setQueryData(
          trpc.group.all.queryKey({ bankAccountUid: deletedGroup.bankAccountUid }),
          context?.previousGroups,
        );
        queryClient.setQueryData(
          trpc.group.byUid.queryKey({
            uid: deletedGroup.uid,
            bankAccountUid: deletedGroup.bankAccountUid,
          }),
          context?.previousGroup,
        );
      },
      onSettled: async (_data, _error, deletedGroup) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.group.all.queryKey({ bankAccountUid: deletedGroup.bankAccountUid }),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.group.byUid.queryKey({
              uid: deletedGroup.uid,
              bankAccountUid: deletedGroup.bankAccountUid,
            }),
          }),
        ]);
      },
    }),
  );
}
