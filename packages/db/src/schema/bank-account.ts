import { relations, sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { generateRandomString } from "../utils";
import { user } from "./auth";
import { recurringRule } from "./recurring-rule";
import { transaction } from "./transaction";

export const bankAccount = sqliteTable("bank_account", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uid: text("uid")
    .$defaultFn(() => generateRandomString(7))
    .unique()
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

export const userToBankAccount = sqliteTable(
  "bank_account_user",
  {
    bankAccountId: integer("bank_account_id")
      .references((): AnySQLiteColumn => bankAccount.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    userId: text("user_id")
      .references((): AnySQLiteColumn => user.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.bankAccountId, t.userId] })],
);

export const bankAccountRelations = relations(bankAccount, ({ many }) => ({
  users: many(userToBankAccount),
  transactions: many(transaction),
  recurringRules: many(recurringRule),
}));

export const userToBankAccountRelations = relations(userToBankAccount, ({ one }) => ({
  bankAccount: one(bankAccount, {
    fields: [userToBankAccount.bankAccountId],
    references: [bankAccount.id],
  }),
  user: one(user, {
    fields: [userToBankAccount.userId],
    references: [user.id],
  }),
}));

export type BankAccount = typeof bankAccount.$inferSelect;
