import { db } from "@trak/db";
import { category, group } from "@trak/db/schema/category";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, router } from "../index";

export const categoryRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        icon: z.string().min(1),
        groupUid: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const groupForCategory = await db
        .select()
        .from(group)
        .where(eq(group.uid, input.groupUid))
        .limit(1)
        .get();

      if (!groupForCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Le groupe n'existe pas",
        });
      }

      const [createdCategory] = await db
        .insert(category)
        .values({
          name: input.name,
          icon: input.icon,
          groupId: groupForCategory.id,
        })
        .returning({
          uid: category.uid,
          name: category.name,
          icon: category.icon,
        });

      return createdCategory;
    }),
  // update: protectedProcedure.mutation(async ({ ctx }) => {}),
  delete: protectedProcedure
    .input(
      z.object({
        uid: z.string(),
        groupUid: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { uid } = input;
      const userId = ctx.session.user.id;

      const categoryToDelete = await db
        .select({
          id: category.id,
        })
        .from(category)
        .innerJoin(group, eq(category.groupId, group.id))
        .where(and(eq(group.userId, userId), eq(category.uid, uid)))
        .limit(1)
        .get();

      if (!categoryToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Impossible de trouver la catégorie à supprimer.",
        });
      }

      return await db.delete(category).where(eq(category.id, categoryToDelete.id));
    }),
});
