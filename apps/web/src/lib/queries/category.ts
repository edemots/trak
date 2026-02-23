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
            queryKey: trpc.group.all.queryKey(),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.group.byUid.queryKey({ uid: newCategory.groupUid }),
          }),
        ]);

        const previousGroup = queryClient.getQueryData(
          trpc.group.byUid.queryKey({ uid: newCategory.groupUid }),
        );

        queryClient.setQueryData(trpc.group.byUid.queryKey(), (old) =>
          old
            ? {
                ...old,
                categories: [
                  ...old.categories,
                  {
                    uid: generateRandomUid(),
                    ...newCategory,
                  },
                ],
              }
            : old,
        );

        return { previousGroup };
      },
      onError: (_error, newCategory, context) => {
        queryClient.setQueryData(
          trpc.group.byUid.queryKey({ uid: newCategory.groupUid }),
          context?.previousGroup,
        );
      },
      onSettled: async (_data, _error, newCategory) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.group.all.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.group.byUid.queryKey({
              uid: newCategory.groupUid,
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
            queryKey: trpc.group.all.queryKey(),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.group.byUid.queryKey({
              uid: deletedCategory.groupUid,
            }),
          }),
        ]);

        const previousGroup = queryClient.getQueryData(
          trpc.group.byUid.queryKey({ uid: deletedCategory.groupUid }),
        );

        queryClient.setQueryData(trpc.group.byUid.queryKey(), (old) =>
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
          trpc.group.byUid.queryKey({ uid: deletedCategory.groupUid }),
          context?.previousGroup,
        );
      },
      onSettled: async (_data, _error, deletedCategory) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.group.all.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.group.byUid.queryKey({
              uid: deletedCategory.groupUid,
            }),
          }),
        ]);
      },
    }),
  );
}
