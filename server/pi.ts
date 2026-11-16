import type { Request } from "express";
import { ENV } from "./_core/env";

export type PiUser = { uid: string; username?: string; wallet_address?: string };
export type PiPayment = {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  network: "Pi Network" | "Pi Testnet";
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: null | { txid: string; verified: boolean; _link?: string };
};

export class PiApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly payload?: unknown) {
    super(message);
    this.name = "PiApiError";
  }
}

function requireApiKey() {
  if (!ENV.piApiKey) throw new PiApiError(503, "Pi integration is not configured: PI_API_KEY is missing.");
  return ENV.piApiKey;
}

async function requestPi<T>(path: string, init: RequestInit = {}, auth: "key" | "bearer" = "key"): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  const bearerHeader = (init.headers as Record<string, string> | undefined)?.Authorization ?? "";
  headers.set("Authorization", auth === "key" ? `Key ${requireApiKey()}` : bearerHeader);
  const response = await fetch(`${ENV.piApiBase}${path}`, { ...init, headers });
  const text = await response.text();
  let payload: unknown = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) {
    const message = typeof payload === "object" && payload && "error" in payload ? String((payload as { error: unknown }).error) : `Pi Platform API returned ${response.status}`;
    throw new PiApiError(response.status, message, payload);
  }
  return payload as T;
}

export function bearerFromRequest(req: Request) {
  const value = req.header("authorization") ?? "";
  return value.startsWith("Bearer ") ? value.slice("Bearer ".length).trim() : "";
}

export async function verifyPiAccessToken(accessToken: string): Promise<PiUser> {
  if (!accessToken) throw new PiApiError(401, "Pi access token is required.");
  const headers = { Authorization: `Bearer ${accessToken}` };
  return requestPi<PiUser>("/me", { headers }, "bearer");
}

export async function getPiPayment(paymentId: string): Promise<PiPayment> {
  return requestPi<PiPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

export async function approvePiPayment(paymentId: string) {
  return requestPi<PiPayment>(`/payments/${encodeURIComponent(paymentId)}/approve`, { method: "POST" });
}

export async function completePiPayment(paymentId: string, txid: string) {
  return requestPi<PiPayment>(`/payments/${encodeURIComponent(paymentId)}/complete`, {
    method: "POST",
    body: JSON.stringify({ txid }),
  });
}

export function piConfigForClient() {
  return { sandbox: ENV.piSandbox };
}
