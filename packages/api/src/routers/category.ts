import { db } from "@trak/db";
import { bankAccount, userToBankAccount } from "@trak/db/schema/bank-account";
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
        bankAccountUid: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const bankAccountForUser = await db
        .select({
          id: bankAccount.id,
        })
        .from(bankAccount)
        .innerJoin(userToBankAccount, eq(bankAccount.id, userToBankAccount.bankAccountId))
        .where(
          and(
            eq(userToBankAccount.userId, ctx.session.user.id),
            eq(bankAccount.uid, input.bankAccountUid),
          ),
        )
        .limit(1)
        .get();

      if (!bankAccountForUser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès refusé au compte bancaire.",
        });
      }

      const groupForCategory = await db
        .select()
        .from(group)
        .where(and(eq(group.uid, input.groupUid), eq(group.bankAccountId, bankAccountForUser.id)))
        .limit(1)
        .get();

      if (!groupForCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Le groupe n'existe pas",
        });
      }

      const existingCategory = await db
        .select({ id: category.id })
        .from(category)
        .where(
          and(
            eq(category.groupId, groupForCategory.id),
            eq(category.name, input.name),
            eq(category.icon, input.icon),
          ),
        )
        .limit(1)
        .get();

      if (existingCategory) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cette catégorie existe déjà dans ce groupe.",
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
        bankAccountUid: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { uid } = input;
      const bankAccountForUser = await db
        .select({
          id: bankAccount.id,
        })
        .from(bankAccount)
        .innerJoin(userToBankAccount, eq(bankAccount.id, userToBankAccount.bankAccountId))
        .where(
          and(
            eq(userToBankAccount.userId, ctx.session.user.id),
            eq(bankAccount.uid, input.bankAccountUid),
          ),
        )
        .limit(1)
        .get();

      if (!bankAccountForUser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès refusé au compte bancaire.",
        });
      }

      const categoryToDelete = await db
        .select({
          id: category.id,
        })
        .from(category)
        .innerJoin(group, and(eq(category.groupId, group.id), eq(group.uid, input.groupUid)))
        .where(
          and(
            eq(group.bankAccountId, bankAccountForUser.id),
            eq(category.uid, uid),
            eq(group.uid, input.groupUid),
          ),
        )
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
