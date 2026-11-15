CREATE TABLE `communities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`description` text,
	`organizerUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communities_id` PRIMARY KEY(`id`),
	CONSTRAINT `communities_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `orderEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`actorUserId` int,
	`type` varchar(80) NOT NULL,
	`message` varchar(500) NOT NULL,
	`metadataJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`committedQuantity` int NOT NULL,
	`paymentStatus` enum('not_started','pending','submitted','verified','needs_review') NOT NULL DEFAULT 'not_started',
	`paymentReference` varchar(240),
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orderMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`organizerUserId` int NOT NULL,
	`supplierName` varchar(160) NOT NULL,
	`productName` varchar(160) NOT NULL,
	`productDescription` text,
	`productImageUrl` varchar(500),
	`unitLabel` varchar(60) NOT NULL,
	`status` enum('draft','open','threshold_met','payment_window','finalized','ready_for_pickup','closed') NOT NULL DEFAULT 'draft',
	`minimumQuantity` int NOT NULL,
	`targetQuantity` int NOT NULL,
	`committedQuantity` int NOT NULL DEFAULT 0,
	`orderDeadline` timestamp NOT NULL,
	`pickupLocation` varchar(240) NOT NULL,
	`pickupWindow` varchar(160) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`orderMemberId` int NOT NULL,
	`amountPi` varchar(32) NOT NULL,
	`provider` enum('pi') NOT NULL DEFAULT 'pi',
	`status` enum('pending','submitted','verified','needs_review') NOT NULL DEFAULT 'pending',
	`transactionReference` varchar(240),
	`submittedAt` timestamp,
	`verifiedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paymentRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceTiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`minimumQuantity` int NOT NULL,
	`pricePerUnitPi` varchar(32) NOT NULL,
	`label` varchar(80) NOT NULL,
	CONSTRAINT `priceTiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `communities_organizer_idx` ON `communities` (`organizerUserId`);--> statement-breakpoint
CREATE INDEX `order_events_order_idx` ON `orderEvents` (`orderId`);--> statement-breakpoint
CREATE INDEX `order_members_order_idx` ON `orderMembers` (`orderId`);--> statement-breakpoint
CREATE INDEX `order_members_user_idx` ON `orderMembers` (`userId`);--> statement-breakpoint
CREATE INDEX `orders_community_idx` ON `orders` (`communityId`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `payment_records_order_idx` ON `paymentRecords` (`orderId`);--> statement-breakpoint
CREATE INDEX `price_tiers_order_idx` ON `priceTiers` (`orderId`);