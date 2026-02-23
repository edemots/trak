import { useMutation } from "@tanstack/react-query";

import { queryClient } from "@/router";
import { useTRPC } from "@/utils/trpc";

import { generateRandomUid } from "../utils";

export function useCreateCategoryMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.category.create.mutationOptions({
      onMutate: async (newCategory) => {
        await Promise.all([
          queryClient.cancelQueries({
            queryKey: trpc.group.all.queryKey({ bankAccountUid: newCategory.bankAccountUid }),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.group.byUid.queryKey({
              uid: newCategory.groupUid,
              bankAccountUid: newCategory.bankAccountUid,
            }),
          }),
        ]);

        const previousGroup = queryClient.getQueryData(
          trpc.group.byUid.queryKey({
            uid: newCategory.groupUid,
            bankAccountUid: newCategory.bankAccountUid,
          }),
        );

        queryClient.setQueryData(
          trpc.group.byUid.queryKey({
            uid: newCategory.groupUid,
            bankAccountUid: newCategory.bankAccountUid,
          }),
          (old) =>
            old
              ? {
                  ...old,
                  categories: [
                    ...old.categories,
                    {
                      uid: generateRandomUid(),
                      name: newCategory.name,
                      icon: newCategory.icon,
                    },
                  ],
                }
              : old,
        );

        return { previousGroup };
      },
      onError: (_error, newCategory, context) => {
        queryClient.setQueryData(
          trpc.group.byUid.queryKey({
            uid: newCategory.groupUid,
            bankAccountUid: newCategory.bankAccountUid,
          }),
          context?.previousGroup,
        );
      },
      onSettled: async (_data, _error, newCategory) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.group.all.queryKey({ bankAccountUid: newCategory.bankAccountUid }),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.group.byUid.queryKey({
              uid: newCategory.groupUid,
              bankAccountUid: newCategory.bankAccountUid,
            }),
          }),
        ]);
      },
    }),
  );
}

// export function useUpdateCategoryMutation() {
// 	return useMutation(
// 		trpc.category.update.mutationOptions({
// 			onSuccess: () => {
// 				queryClient.invalidateQueries({
// 					queryKey: trpc.category.get.queryKey(),
// 				});
// 			},
// 		})
// 	);
// }

export function useDeleteCategoryMutation() {
  const trpc = useTRPC();
  return useMutation(
    trpc.category.delete.mutationOptions({
      onMutate: async (deletedCategory) => {
        await Promise.all([
          queryClient.cancelQueries({
            queryKey: trpc.group.all.queryKey({ bankAccountUid: deletedCategory.bankAccountUid }),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.group.byUid.queryKey({
              uid: deletedCategory.groupUid,
              bankAccountUid: deletedCategory.bankAccountUid,
            }),
          }),
        ]);

        const previousGroup = queryClient.getQueryData(
          trpc.group.byUid.queryKey({
            uid: deletedCategory.groupUid,
            bankAccountUid: deletedCategory.bankAccountUid,
          }),
        );

        queryClient.setQueryData(
          trpc.group.byUid.queryKey({
            uid: deletedCategory.groupUid,
            bankAccountUid: deletedCategory.bankAccountUid,
          }),
          (old) =>
            old
              ? {
                  ...old,
                  categories: old.categories.filter(
                    (category) => category.uid !== deletedCategory.uid,
                  ),
                }
              : old,
        );

        return { previousGroup };
      },
      onError: (_error, deletedCategory, context) => {
        queryClient.setQueryData(
          trpc.group.byUid.queryKey({
            uid: deletedCategory.groupUid,
            bankAccountUid: deletedCategory.bankAccountUid,
          }),
          context?.previousGroup,
        );
      },
      onSettled: async (_data, _error, deletedCategory) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.group.all.queryKey({
              bankAccountUid: deletedCategory.bankAccountUid,
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.group.byUid.queryKey({
              uid: deletedCategory.groupUid,
              bankAccountUid: deletedCategory.bankAccountUid,
            }),
          }),
        ]);
      },
    }),
  );
}
