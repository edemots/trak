import { relations } from "drizzle-orm/relations";
import { sql } from "drizzle-orm/sql/sql";
import {
  type AnySQLiteColumn,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { generateRandomString } from "../utils";
import { user } from "./auth";
import { bankAccount } from "./bank-account";
import { recurringRule } from "./recurring-rule";
import { transaction } from "./transaction";

export const group = sqliteTable(
  "group",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uid: text("uid")
      .$defaultFn(() => generateRandomString(7))
      .notNull(),
    userId: text("user_id")
      .references((): AnySQLiteColumn => user.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    bankAccountId: integer("bank_account_id")
      .references((): AnySQLiteColumn => bankAccount.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
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
  },
  (table) => [
    uniqueIndex("group_uid_unique").on(table.uid),
    index("group_bank_account_id_idx").on(table.bankAccountId),
    uniqueIndex("group_bank_account_name_icon_unique").on(
      table.bankAccountId,
      table.name,
      table.icon,
    ),
  ],
);

export const category = sqliteTable(
  "category",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uid: text("uid")
      .$defaultFn(() => generateRandomString(7))
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    groupId: integer("group_id")
      .references((): AnySQLiteColumn => group.id, {
        onUpdate: "cascade",
        onDelete: "restrict",
      })
      .notNull(),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    default: integer("default", { mode: "boolean" }).default(false),
  },
  (table) => [
    uniqueIndex("category_uid_unique").on(table.uid),
    uniqueIndex("category_group_name_icon_unique").on(table.groupId, table.name, table.icon),
  ],
);

export const groupRelations = relations(group, ({ many, one }) => ({
  bankAccount: one(bankAccount, {
    fields: [group.bankAccountId],
    references: [bankAccount.id],
  }),
  categories: many(category),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
  group: one(group, {
    fields: [category.groupId],
    references: [group.id],
  }),
  transactions: many(transaction),
  recurringRules: many(recurringRule),
}));
