import { relations } from "drizzle-orm/relations";
import { sql } from "drizzle-orm/sql/sql";
import {
	type AnySQLiteColumn,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { generateRandomString } from "../utils";
import { bankAccount } from "./bank-account";
import { category } from "./category";
import { transaction } from "./transaction";

export const recurringRule = sqliteTable("recurring_rule", {
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
	bankAccountId: integer("bank_account_id")
		.references((): AnySQLiteColumn => bankAccount.id, {
			onUpdate: "cascade",
			onDelete: "cascade",
		})
		.notNull(),
	categoryId: integer("category_id")
		.references((): AnySQLiteColumn => category.id, {
			onUpdate: "cascade",
			onDelete: "restrict",
		})
		.notNull(),
	name: text("name").notNull(),
	amount: integer("amount").notNull(),
	frequency: text("frequency")
		.$type<"daily" | "weekly" | "monthly" | "yearly">()
		.notNull(),
	interval: integer("interval").notNull().default(1),
	active: integer("active", { mode: "boolean" }).default(true).notNull(),
});

export const recurringRuleRelations = relations(
	recurringRule,
	({ many, one }) => ({
		bankAccount: one(bankAccount, {
			fields: [recurringRule.bankAccountId],
			references: [bankAccount.id],
		}),
		category: one(category, {
			fields: [recurringRule.categoryId],
			references: [category.id],
		}),
		transactions: many(transaction),
	})
);
