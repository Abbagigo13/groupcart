import { relations } from "drizzle-orm";
import { communities, orderEvents, orderMembers, orders, paymentRecords, priceTiers, users } from "./schema";

export const communityRelations = relations(communities, ({ one, many }) => ({
  organizer: one(users, { fields: [communities.organizerUserId], references: [users.id] }),
  orders: many(orders),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  community: one(communities, { fields: [orders.communityId], references: [communities.id] }),
  organizer: one(users, { fields: [orders.organizerUserId], references: [users.id] }),
  tiers: many(priceTiers),
  members: many(orderMembers),
  payments: many(paymentRecords),
  events: many(orderEvents),
}));

export const priceTierRelations = relations(priceTiers, ({ one }) => ({
  order: one(orders, { fields: [priceTiers.orderId], references: [orders.id] }),
}));

export const orderMemberRelations = relations(orderMembers, ({ one, many }) => ({
  order: one(orders, { fields: [orderMembers.orderId], references: [orders.id] }),
  user: one(users, { fields: [orderMembers.userId], references: [users.id] }),
  payments: many(paymentRecords),
}));

export const paymentRecordRelations = relations(paymentRecords, ({ one }) => ({
  order: one(orders, { fields: [paymentRecords.orderId], references: [orders.id] }),
  member: one(orderMembers, { fields: [paymentRecords.orderMemberId], references: [orderMembers.id] }),
}));

export const orderEventRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
  actor: one(users, { fields: [orderEvents.actorUserId], references: [users.id] }),
}));
