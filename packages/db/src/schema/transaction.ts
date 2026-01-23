import { relations } from "drizzle-orm/relations";
import { type SQL, sql } from "drizzle-orm/sql/sql";
import {
	type AnySQLiteColumn,
	index,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { generateRandomString } from "../utils";
import { bankAccount } from "./bank-account";
import { category } from "./category";
import { recurringRule } from "./recurring-rule";

export const transaction = sqliteTable(
	"transaction",
	{
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
		amount_abs: integer("amount_abs")
			.notNull()
			.generatedAlwaysAs((): SQL => sql`ABS(${transaction.amount})`, {
				mode: "virtual",
			}),
		tradeDate: text("trade_date").notNull(),
		postedDate: text("posted_date").notNull(),
		notes: text("notes"),
		recurringRuleId: integer("recurring_rule_id").references(
			(): AnySQLiteColumn => recurringRule.id,
			{ onUpdate: "cascade", onDelete: "restrict" }
		),
	},
	(table) => [
		index("td_pd_cat_acc_idx").on(
			table.tradeDate,
			table.postedDate,
			table.categoryId,
			table.bankAccountId
		),
		index("td_pd_acc_cat_idx").on(
			table.tradeDate,
			table.postedDate,
			table.bankAccountId,
			table.categoryId
		),
		index("td_cat_acc_idx").on(
			table.tradeDate,
			table.categoryId,
			table.bankAccountId
		),
		index("cat_td_acc_idx").on(
			table.categoryId,
			table.tradeDate,
			table.bankAccountId
		),
		index("acc_td_cat_idx").on(
			table.bankAccountId,
			table.tradeDate,
			table.categoryId
		),
		index("acc_cat_td_idx").on(
			table.bankAccountId,
			table.categoryId,
			table.tradeDate
		),
		index("cat_acc_td_idx").on(
			table.categoryId,
			table.bankAccountId,
			table.tradeDate
		),
	]
);

export const transactionRelations = relations(transaction, ({ one }) => ({
	category: one(category, {
		fields: [transaction.categoryId],
		references: [category.id],
	}),
	bankAccount: one(bankAccount, {
		fields: [transaction.bankAccountId],
		references: [bankAccount.id],
	}),
	recurringRule: one(recurringRule, {
		fields: [transaction.recurringRuleId],
		references: [recurringRule.id],
	}),
}));
