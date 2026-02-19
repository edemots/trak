import { db } from "@trak/db";
import { bankAccount, userToBankAccount } from "@trak/db/schema/bank-account";
import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, router } from "../index";

export type { BankAccount } from "@trak/db/schema/bank-account";

export const bankAccountRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select({
        uid: bankAccount.uid,
        name: bankAccount.name,
        icon: bankAccount.icon,
      })
      .from(bankAccount)
      .innerJoin(userToBankAccount, eq(bankAccount.id, userToBankAccount.bankAccountId))
      .where(eq(userToBankAccount.userId, ctx.session.user.id))
      .orderBy(asc(bankAccount.uid))
      .all();
  }),
  byUid: protectedProcedure
    .input(
      z.object({
        uid: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await db
        .select()
        .from(bankAccount)
        .where(eq(bankAccount.uid, input.uid))
        .limit(1)
        .get();
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        icon: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newBankAccount = await db
        .insert(bankAccount)
        .values({
          name: input.name,
          icon: input.icon,
        })
        .returning({
          id: bankAccount.id,
          uid: bankAccount.uid,
          name: bankAccount.name,
          icon: bankAccount.icon,
        });

      if (!newBankAccount[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible de créer le compte.",
        });
      }

      await db.insert(userToBankAccount).values({
        bankAccountId: newBankAccount[0].id,
        userId: ctx.session.user.id,
      });

      const { id: _id, ...bankAccountWithoutId } = newBankAccount[0];

      return bankAccountWithoutId;
    }),
  update: protectedProcedure.mutation(async ({ ctx }) => {}),
  delete: protectedProcedure.mutation(async ({ ctx }) => {}),
});
