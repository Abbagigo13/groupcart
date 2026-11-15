import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addOrderEvent, ensurePilotCommunity, getActiveOrder, getCurrentCommunity, getDb, getOrderBundle } from "./db";
import { orderEvents, orderMembers, orders, paymentRecords, priceTiers } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";

const paymentReference = z.string().trim().min(4).max(240);
const quantity = z.number().int().min(1).max(1000);

function requireDatabase(db: Awaited<ReturnType<typeof getDb>>): NonNullable<typeof db> {
  if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Persistent storage is not available yet." });
  return db;
}

function isOrganizer(userId: number, order: { organizerUserId: number }) {
  return userId === order.organizerUserId;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  community: router({
    current: protectedProcedure.query(async ({ ctx }) => {
      const community = await ensurePilotCommunity(ctx.user.id);
      return community ?? null;
    }),
  }),
  order: router({
    active: protectedProcedure.query(async ({ ctx }) => {
      const community = await ensurePilotCommunity(ctx.user.id);
      if (!community) return null;
      const order = await getActiveOrder(community.id);
      return order ? getOrderBundle(order.id) : null;
    }),
    byId: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const bundle = await getOrderBundle(input.id);
      if (!bundle) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      return bundle;
    }),
    create: protectedProcedure.input(z.object({
      communityId: z.number().int().positive(),
      supplierName: z.string().trim().min(2).max(160),
      productName: z.string().trim().min(2).max(160),
      productDescription: z.string().trim().max(1000).optional(),
      unitLabel: z.string().trim().min(1).max(60),
      minimumQuantity: quantity,
      targetQuantity: quantity,
      orderDeadline: z.coerce.date(),
      pickupLocation: z.string().trim().min(2).max(240),
      pickupWindow: z.string().trim().min(2).max(160),
      tiers: z.array(z.object({ minimumQuantity: quantity, pricePerUnitPi: z.string().regex(/^\d+(\.\d{1,8})?$/), label: z.string().trim().min(1).max(80) })).min(1).max(8),
    })).mutation(async ({ ctx, input }) => {
      if (input.minimumQuantity > input.targetQuantity) throw new TRPCError({ code: "BAD_REQUEST", message: "Minimum quantity cannot exceed the target." });
      const db = requireDatabase(await getDb());
      const community = await getCurrentCommunity(ctx.user.id);
      if (!community || community.id !== input.communityId) throw new TRPCError({ code: "FORBIDDEN", message: "You cannot create an order for this community." });
      const result = await db.transaction(async tx => {
        const orderResult = await tx.insert(orders).values({ communityId: input.communityId, organizerUserId: ctx.user.id, supplierName: input.supplierName, productName: input.productName, productDescription: input.productDescription, unitLabel: input.unitLabel, status: "draft", minimumQuantity: input.minimumQuantity, targetQuantity: input.targetQuantity, orderDeadline: input.orderDeadline, pickupLocation: input.pickupLocation, pickupWindow: input.pickupWindow });
        const orderId = Number(orderResult[0].insertId);
        await tx.insert(priceTiers).values(input.tiers.map(tier => ({ orderId, ...tier })));
        await tx.insert(orderEvents).values({ orderId, actorUserId: ctx.user.id, type: "created", message: "Draft order created." });
        return orderId;
      });
      return { id: result };
    }),
    join: protectedProcedure.input(z.object({ orderId: z.number().int().positive(), committedQuantity: quantity })).mutation(async ({ ctx, input }) => {
      const db = requireDatabase(await getDb());
      const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      if (order.status !== "open") throw new TRPCError({ code: "CONFLICT", message: "This order is not open for new commitments." });
      if (order.orderDeadline.getTime() < Date.now()) throw new TRPCError({ code: "CONFLICT", message: "The order deadline has passed." });
      const [existing] = await db.select().from(orderMembers).where(and(eq(orderMembers.orderId, input.orderId), eq(orderMembers.userId, ctx.user.id))).limit(1);
      const previousQuantity = existing?.committedQuantity ?? 0;
      if (existing) {
        await db.update(orderMembers).set({ committedQuantity: input.committedQuantity, updatedAt: new Date() }).where(eq(orderMembers.id, existing.id));
      } else {
        await db.insert(orderMembers).values({ orderId: input.orderId, userId: ctx.user.id, committedQuantity: input.committedQuantity });
      }
      await db.update(orders).set({ committedQuantity: order.committedQuantity - previousQuantity + input.committedQuantity, updatedAt: new Date() }).where(eq(orders.id, input.orderId));
      await addOrderEvent(input.orderId, ctx.user.id, "member_joined", `${ctx.user.name ?? "A member"} committed ${input.committedQuantity} ${order.unitLabel}s.`);
      return { success: true, committedQuantity: input.committedQuantity } as const;
    }),
    submitPayment: protectedProcedure.input(z.object({ orderId: z.number().int().positive(), amountPi: z.string().regex(/^\d+(\.\d{1,8})?$/), transactionReference: paymentReference })).mutation(async ({ ctx, input }) => {
      const db = requireDatabase(await getDb());
      const [member] = await db.select().from(orderMembers).where(and(eq(orderMembers.orderId, input.orderId), eq(orderMembers.userId, ctx.user.id))).limit(1);
      if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "Join the order before submitting payment." });
      await db.update(orderMembers).set({ paymentStatus: "submitted", paymentReference: input.transactionReference, updatedAt: new Date() }).where(eq(orderMembers.id, member.id));
      await db.insert(paymentRecords).values({ orderId: input.orderId, orderMemberId: member.id, amountPi: input.amountPi, provider: "pi", status: "submitted", transactionReference: input.transactionReference, submittedAt: new Date() });
      await addOrderEvent(input.orderId, ctx.user.id, "payment_submitted", "A payment reference was submitted and is waiting for verification.");
      return { success: true, status: "submitted" as const };
    }),
    updateStatus: protectedProcedure.input(z.object({ orderId: z.number().int().positive(), status: z.enum(["open", "threshold_met", "payment_window", "finalized", "ready_for_pickup", "closed"]) })).mutation(async ({ ctx, input }) => {
      const db = requireDatabase(await getDb());
      const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      if (!isOrganizer(ctx.user.id, order)) throw new TRPCError({ code: "FORBIDDEN", message: "Only the organizer can change the order state." });
      await db.update(orders).set({ status: input.status, updatedAt: new Date() }).where(eq(orders.id, input.orderId));
      await addOrderEvent(input.orderId, ctx.user.id, "status_changed", `Order moved to ${input.status.replaceAll("_", " ")}.`);
      return { success: true, status: input.status };
    }),
  }),
});

export type AppRouter = typeof appRouter;
