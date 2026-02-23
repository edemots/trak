import { db } from "@trak/db";
import { category, group } from "@trak/db/schema/category";
import { transaction } from "@trak/db/schema/transaction";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, router } from "../index";

export const groupRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    const groups = await db.query.group.findMany({
      columns: {
        uid: true,
        name: true,
        icon: true,
      },
      with: {
        categories: {
          columns: {
            uid: true,
            name: true,
            icon: true,
          },
          orderBy: (c, { asc }) => [asc(c.default), asc(c.name)],
        },
      },
      where: (g, { eq }) => eq(g.userId, ctx.session.user.id),
      orderBy: (g, { asc }) => [asc(g.name)],
    });

    return groups;
  }),
  byUid: protectedProcedure
    .input(
      z.object({
        uid: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const groupToReturn = await db.query.group.findFirst({
        where: (g, { eq }) => eq(g.uid, input.uid),
        columns: {
          uid: true,
          name: true,
          icon: true,
        },
        with: {
          categories: {
            columns: {
              uid: true,
              name: true,
              icon: true,
            },
            orderBy: (c, { asc }) => [asc(c.default), asc(c.name)],
          },
        },
      });

      if (!groupToReturn) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Le groupe n'existe pas.",
        });
      }

      return groupToReturn;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        icon: z.string().min(1),
        withOther: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, icon, withOther } = input;
      const userId = ctx.session.user.id;

      const [createdGroup] = await db
        .insert(group)
        .values({
          name,
          icon,
          userId,
        })
        .returning({ insertedId: group.id });

      if (!createdGroup) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Impossible de créer le groupe.",
        });
      }

      if (withOther) {
        try {
          await db.insert(category).values({
            name: "Autre",
            icon: "📂",
            groupId: createdGroup.insertedId,
            default: true,
          });
        } catch (error) {
          await db.delete(group).where(eq(group.id, createdGroup.insertedId));
          throw error;
        }
      }

      return await db.query.group.findFirst({
        where: (g, { eq }) => eq(g.id, createdGroup.insertedId),
        columns: {
          uid: true,
          name: true,
          icon: true,
        },
        with: {
          categories: {
            columns: {
              uid: true,
              name: true,
              icon: true,
            },
            orderBy: (c, { asc }) => [asc(c.default), asc(c.name)],
          },
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        uid: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { uid } = input;
      const userId = ctx.session.user.id;

      const groupToDelete = await db
        .select({ id: group.id })
        .from(group)
        .where(and(eq(group.uid, uid), eq(group.userId, userId)))
        .limit(1)
        .get();

      if (!groupToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Impossible de supprimer le groupe.",
        });
      }

      const groupCategories = db
        .select({
          data: category.id,
        })
        .from(category)
        .where(eq(category.groupId, groupToDelete.id));

      const groupTransactions = await db
        .select({
          id: transaction.id,
        })
        .from(transaction)
        .where(inArray(transaction.categoryId, groupCategories));

      if (groupTransactions.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Impossible de supprimer le groupe car des transactions y sont associées.",
        });
      }

      await db.delete(category).where(eq(category.groupId, groupToDelete.id));
      await db.delete(group).where(eq(group.id, groupToDelete.id));
    }),
});
