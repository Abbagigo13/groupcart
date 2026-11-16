ALTER TABLE `paymentRecords` ADD `piPaymentId` varchar(160);--> statement-breakpoint
ALTER TABLE `paymentRecords` ADD `transactionId` varchar(160);--> statement-breakpoint
ALTER TABLE `paymentRecords` ADD `network` varchar(32);