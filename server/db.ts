import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from "./_core/env";
import {
  communities,
  InsertUser,
  orderEvents,
  orderMembers,
  orders,
  paymentRecords,
  priceTiers,
  users,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) {
    values.role = user.role ?? "admin";
    updateSet.role = values.role;
  }
  values.lastSignedIn ??= new Date();
  updateSet.lastSignedIn ??= new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function upsertPiUser(piUser: { uid: string; username?: string }) {
  const openId = `pi:${piUser.uid}`;
  await upsertUser({ openId, name: piUser.username ?? null, loginMethod: "pi", role: "user" });
  return getUserByOpenId(openId);
}

export async function getCurrentCommunity(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(communities).where(eq(communities.organizerUserId, userId)).limit(1);
  return result[0];
}

export async function ensurePilotCommunity(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await getCurrentCommunity(userId);
  if (existing) return existing;

  return db.transaction(async tx => {
    const [communityResult] = await tx.insert(communities).values({
      name: "Lagos Makers Circle",
      slug: `lagos-makers-${userId}`,
      description: "A focused pilot community for clear group orders.",
      organizerUserId: userId,
    });
    const communityId = Number(communityResult.insertId);
    const [orderResult] = await tx.insert(orders).values({
      communityId,
      organizerUserId: userId,
      supplierName: "Kora Supply Co.",
      productName: "Braided USB-C cable",
      productDescription: "Durable 2m cables for the community's shared workshop kits.",
      unitLabel: "cable",
      status: "open",
      minimumQuantity: 50,
      targetQuantity: 100,
      committedQuantity: 72,
      orderDeadline: new Date("2026-04-26T23:59:00Z"),
      pickupLocation: "Yaba Community Workshop",
      pickupWindow: "Saturday, Apr 30 · 10:00–12:00",
    });
    const orderId = Number(orderResult.insertId);
    await tx.insert(priceTiers).values([
      { orderId, minimumQuantity: 0, pricePerUnitPi: "2.80", label: "Starter" },
      { orderId, minimumQuantity: 50, pricePerUnitPi: "2.40", label: "Circle" },
      { orderId, minimumQuantity: 80, pricePerUnitPi: "2.10", label: "Best price" },
    ]);
    await tx.insert(orderEvents).values({ orderId, actorUserId: userId, type: "opened", message: "Pilot order opened for the community." });
    return (await tx.select().from(communities).where(eq(communities.id, communityId)).limit(1))[0];
  });
}

export async function getActiveOrder(communityId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(and(eq(orders.communityId, communityId), eq(orders.status, "open"))).orderBy(desc(orders.updatedAt)).limit(1);
  return result[0];
}

export async function getOrderBundle(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return undefined;
  const tiers = await db.select().from(priceTiers).where(eq(priceTiers.orderId, orderId)).orderBy(asc(priceTiers.minimumQuantity));
  const members = await db.select({ member: orderMembers, userName: users.name }).from(orderMembers).leftJoin(users, eq(orderMembers.userId, users.id)).where(eq(orderMembers.orderId, orderId)).orderBy(desc(orderMembers.joinedAt));
  const events = await db.select().from(orderEvents).where(eq(orderEvents.orderId, orderId)).orderBy(desc(orderEvents.createdAt));
  const payments = await db.select().from(paymentRecords).where(eq(paymentRecords.orderId, orderId)).orderBy(desc(paymentRecords.createdAt));
  return { order, tiers, members, events, payments };
}

export async function addOrderEvent(orderId: number, actorUserId: number | null, type: string, message: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(orderEvents).values({ orderId, actorUserId, type, message });
}
