import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { generateRandomUid } from "@/lib/utils";
import { queryClient } from "@/router";
import { useTRPC } from "@/utils/trpc";

export function useGroups() {
  const trpc = useTRPC();
  return useQuery(trpc.group.all.queryOptions());
}

export function useSuspenseGroups() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.group.all.queryOptions());
}

export function useGroup(uid: string) {
  const trpc = useTRPC();
  return useQuery(trpc.group.byUid.queryOptions({ uid }));
}

export function useSuspenseGroup(uid: string) {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.group.byUid.queryOptions({ uid }));
}

export function useCreateGroupMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.group.create.mutationOptions({
      onMutate: async (newGroup) => {
        await queryClient.cancelQueries({
          queryKey: trpc.group.all.queryKey(),
        });

        const previousGroups = queryClient.getQueryData(trpc.group.all.queryKey());

        queryClient.setQueryData(trpc.group.all.queryKey(), (old) =>
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
      onError: (_error, _newCategory, context) => {
        queryClient.setQueryData(trpc.group.all.queryKey(), context?.previousGroups);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.group.all.queryKey(),
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
            queryKey: trpc.group.all.queryKey(),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.group.byUid.queryKey({
              uid: deletedGroup.uid,
            }),
          }),
        ]);

        const previousGroups = queryClient.getQueryData(trpc.group.all.queryKey());
        const previousGroup = queryClient.getQueryData(
          trpc.group.byUid.queryKey({
            uid: deletedGroup.uid,
          }),
        );

        queryClient.setQueryData(trpc.group.all.queryKey(), (old) =>
          old ? old.filter((group) => group.uid !== deletedGroup.uid) : old,
        );

        return { previousGroups, previousGroup };
      },
      onError: (_error, deletedGroup, context) => {
        queryClient.setQueryData(trpc.group.all.queryKey(), context?.previousGroups);
        queryClient.setQueryData(
          trpc.group.byUid.queryKey({
            uid: deletedGroup.uid,
          }),
          context?.previousGroup,
        );
      },
      onSettled: async (_data, _error, deletedGroup) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.group.all.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.group.byUid.queryKey({
              uid: deletedGroup.uid,
            }),
          }),
        ]);
      },
    }),
  );
}
