CREATE TABLE `bank_account` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bank_account_uid_unique` ON `bank_account` (`uid`);--> statement-breakpoint
CREATE TABLE `bank_account_user` (
	`bank_account_id` integer NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`bank_account_id`, `user_id`),
	FOREIGN KEY (`bank_account_id`) REFERENCES `bank_account`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`group_id` integer NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`default` integer DEFAULT false,
	FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_uid_unique` ON `category` (`uid`);--> statement-breakpoint
CREATE TABLE `group` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_uid_unique` ON `group` (`uid`);--> statement-breakpoint
CREATE TABLE `recurring_rule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`bank_account_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`amount` integer NOT NULL,
	`frequency` text NOT NULL,
	`interval` integer DEFAULT 1 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`bank_account_id`) REFERENCES `bank_account`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recurring_rule_uid_unique` ON `recurring_rule` (`uid`);--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`bank_account_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`amount` integer NOT NULL,
	`amount_abs` integer GENERATED ALWAYS AS (ABS("amount")) VIRTUAL NOT NULL,
	`trade_date` text NOT NULL,
	`posted_date` text NOT NULL,
	`notes` text,
	`recurring_rule_id` integer,
	FOREIGN KEY (`bank_account_id`) REFERENCES `bank_account`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`recurring_rule_id`) REFERENCES `recurring_rule`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transaction_uid_unique` ON `transaction` (`uid`);--> statement-breakpoint
CREATE INDEX `td_pd_cat_acc_idx` ON `transaction` (`trade_date`,`posted_date`,`category_id`,`bank_account_id`);--> statement-breakpoint
CREATE INDEX `td_pd_acc_cat_idx` ON `transaction` (`trade_date`,`posted_date`,`bank_account_id`,`category_id`);--> statement-breakpoint
CREATE INDEX `td_cat_acc_idx` ON `transaction` (`trade_date`,`category_id`,`bank_account_id`);--> statement-breakpoint
CREATE INDEX `cat_td_acc_idx` ON `transaction` (`category_id`,`trade_date`,`bank_account_id`);--> statement-breakpoint
CREATE INDEX `acc_td_cat_idx` ON `transaction` (`bank_account_id`,`trade_date`,`category_id`);--> statement-breakpoint
CREATE INDEX `acc_cat_td_idx` ON `transaction` (`bank_account_id`,`category_id`,`trade_date`);--> statement-breakpoint
CREATE INDEX `cat_acc_td_idx` ON `transaction` (`category_id`,`bank_account_id`,`trade_date`);