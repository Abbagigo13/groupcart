import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { and, eq } from "drizzle-orm";
import { orderMembers, orders, paymentRecords } from "../../drizzle/schema";
import { getDb, upsertPiUser } from "../db";
import { PiApiError, approvePiPayment, bearerFromRequest, completePiPayment, getPiPayment, verifyPiAccessToken, piConfigForClient } from "../pi";

function piErrorResponse(res: express.Response, error: unknown) {
  if (error instanceof PiApiError) return res.status(error.status).json({ error: error.message });
  console.error("[Pi] Unexpected integration error:", error);
  return res.status(500).json({ error: "Pi integration request failed." });
}

function paymentIdFromBody(body: unknown) {
  if (!body || typeof body !== "object" || typeof (body as { paymentId?: unknown }).paymentId !== "string") throw new PiApiError(400, "paymentId is required.");
  const paymentId = (body as { paymentId: string }).paymentId.trim();
  if (!paymentId || paymentId.length > 160) throw new PiApiError(400, "paymentId is invalid.");
  return paymentId;
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/pi/config", (_req, res) => res.json(piConfigForClient()));
  app.post("/api/pi/verify", async (req, res) => {
    try {
      const piUser = await verifyPiAccessToken(bearerFromRequest(req));
      const user = await upsertPiUser(piUser);
      if (!user) throw new PiApiError(503, "Persistent storage is not available.");
      return res.json({ uid: piUser.uid, username: piUser.username ?? null, userId: user.id, sandbox: piConfigForClient().sandbox });
    } catch (error) {
      return piErrorResponse(res, error);
    }
  });
  app.post("/api/pi/payments/approve", async (req, res) => {
    try {
      const paymentId = paymentIdFromBody(req.body);
      const piUser = await verifyPiAccessToken(bearerFromRequest(req));
      const user = await upsertPiUser(piUser);
      const db = await getDb();
      if (!db || !user) throw new PiApiError(503, "Persistent storage is not available.");
      const payment = await getPiPayment(paymentId);
      if (payment.user_uid !== piUser.uid) throw new PiApiError(403, "This Pi payment does not belong to the authenticated Pioneer.");
      const orderId = Number(payment.metadata?.orderId);
      if (!Number.isInteger(orderId) || orderId < 1) throw new PiApiError(400, "Payment metadata is missing a valid GroupCart orderId.");
      const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      const [member] = await db.select().from(orderMembers).where(and(eq(orderMembers.orderId, orderId), eq(orderMembers.userId, user.id))).limit(1);
      if (!order || !member) throw new PiApiError(409, "Join this GroupCart order before starting a Pi payment.");
      if (!["open", "threshold_met", "payment_window"].includes(order.status)) throw new PiApiError(409, "This order is not accepting Pi payments.");
      const [existing] = await db.select().from(paymentRecords).where(eq(paymentRecords.piPaymentId, paymentId)).limit(1);
      if (!existing) {
        await db.insert(paymentRecords).values({ orderId, orderMemberId: member.id, amountPi: String(payment.amount), provider: "pi", status: "pending", piPaymentId: paymentId, network: payment.network, createdAt: new Date() });
      }
      const approved = payment.status.developer_approved ? payment : await approvePiPayment(paymentId);
      return res.json({ identifier: approved.identifier, status: approved.status });
    } catch (error) {
      return piErrorResponse(res, error);
    }
  });
  app.post("/api/pi/payments/complete", async (req, res) => {
    try {
      const paymentId = paymentIdFromBody(req.body);
      const txid = typeof req.body?.txid === "string" ? req.body.txid.trim() : "";
      if (!txid || txid.length > 160) throw new PiApiError(400, "A real blockchain txid is required.");
      const db = await getDb();
      if (!db) throw new PiApiError(503, "Persistent storage is not available.");
      const payment = await getPiPayment(paymentId);
      if (payment.status.cancelled || payment.status.user_cancelled) throw new PiApiError(409, "This Pi payment was cancelled.");
      const completed = payment.status.developer_completed ? payment : await completePiPayment(paymentId, txid);
      if (!completed.status.developer_completed || !completed.status.transaction_verified) throw new PiApiError(409, "Pi did not confirm this transaction as verified.");
      await db.update(paymentRecords).set({ status: "verified", transactionReference: txid, transactionId: txid, verifiedAt: new Date() }).where(eq(paymentRecords.piPaymentId, paymentId));
      return res.json({ identifier: completed.identifier, status: completed.status, transaction: completed.transaction });
    } catch (error) {
      return piErrorResponse(res, error);
    }
  });
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
