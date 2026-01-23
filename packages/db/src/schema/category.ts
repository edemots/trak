import { relations } from "drizzle-orm/relations";
import { sql } from "drizzle-orm/sql/sql";
import {
	type AnySQLiteColumn,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { generateRandomString } from "../utils";
import { user } from "./auth";
import { recurringRule } from "./recurring-rule";
import { transaction } from "./transaction";

export const group = sqliteTable("group", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	uid: text("uid")
		.$defaultFn(() => generateRandomString(7))
		.unique()
		.notNull(),
	userId: text("user_id")
		.references((): AnySQLiteColumn => user.id, {
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
});

export const category = sqliteTable("category", {
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
	groupId: integer("group_id")
		.references((): AnySQLiteColumn => group.id, {
			onUpdate: "cascade",
			onDelete: "restrict",
		})
		.notNull(),
	name: text("name").notNull(),
	icon: text("icon").notNull(),
	default: integer("default", { mode: "boolean" }).default(false),
});

export const groupRelations = relations(group, ({ many }) => ({
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
