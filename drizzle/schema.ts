import { int, index, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const communities = mysqlTable("communities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  organizerUserId: int("organizerUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ organizerIdx: index("communities_organizer_idx").on(table.organizerUserId) }));

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  communityId: int("communityId").notNull(),
  organizerUserId: int("organizerUserId").notNull(),
  supplierName: varchar("supplierName", { length: 160 }).notNull(),
  productName: varchar("productName", { length: 160 }).notNull(),
  productDescription: text("productDescription"),
  productImageUrl: varchar("productImageUrl", { length: 500 }),
  unitLabel: varchar("unitLabel", { length: 60 }).notNull(),
  status: mysqlEnum("status", ["draft", "open", "threshold_met", "payment_window", "finalized", "ready_for_pickup", "closed"]).default("draft").notNull(),
  minimumQuantity: int("minimumQuantity").notNull(),
  targetQuantity: int("targetQuantity").notNull(),
  committedQuantity: int("committedQuantity").default(0).notNull(),
  orderDeadline: timestamp("orderDeadline").notNull(),
  pickupLocation: varchar("pickupLocation", { length: 240 }).notNull(),
  pickupWindow: varchar("pickupWindow", { length: 160 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ communityIdx: index("orders_community_idx").on(table.communityId), statusIdx: index("orders_status_idx").on(table.status) }));

export const priceTiers = mysqlTable("priceTiers", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  minimumQuantity: int("minimumQuantity").notNull(),
  pricePerUnitPi: varchar("pricePerUnitPi", { length: 32 }).notNull(),
  label: varchar("label", { length: 80 }).notNull(),
}, table => ({ orderIdx: index("price_tiers_order_idx").on(table.orderId) }));

export const orderMembers = mysqlTable("orderMembers", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  userId: int("userId").notNull(),
  committedQuantity: int("committedQuantity").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["not_started", "pending", "submitted", "verified", "needs_review"]).default("not_started").notNull(),
  paymentReference: varchar("paymentReference", { length: 240 }),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ orderIdx: index("order_members_order_idx").on(table.orderId), userIdx: index("order_members_user_idx").on(table.userId) }));

export const paymentRecords = mysqlTable("paymentRecords", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  orderMemberId: int("orderMemberId").notNull(),
  amountPi: varchar("amountPi", { length: 32 }).notNull(),
  provider: mysqlEnum("provider", ["pi"]).default("pi").notNull(),
  status: mysqlEnum("status", ["pending", "submitted", "verified", "needs_review"]).default("pending").notNull(),
  transactionReference: varchar("transactionReference", { length: 240 }),
  submittedAt: timestamp("submittedAt"),
  verifiedAt: timestamp("verifiedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ orderIdx: index("payment_records_order_idx").on(table.orderId) }));

export const orderEvents = mysqlTable("orderEvents", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  actorUserId: int("actorUserId"),
  type: varchar("type", { length: 80 }).notNull(),
  message: varchar("message", { length: 500 }).notNull(),
  metadataJson: text("metadataJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ orderIdx: index("order_events_order_idx").on(table.orderId) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Community = typeof communities.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type PriceTier = typeof priceTiers.$inferSelect;
export type OrderMember = typeof orderMembers.$inferSelect;
export type PaymentRecord = typeof paymentRecords.$inferSelect;
export type OrderEvent = typeof orderEvents.$inferSelect;
