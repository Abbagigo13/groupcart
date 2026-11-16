export type PiPaymentDto = {
  identifier: string;
  transaction: null | { txid: string };
  metadata?: Record<string, unknown>;
};

type PiAuthResult = { accessToken: string; user: { uid: string; username: string } };
type PiSdk = {
  init(options: { version: "2.0"; sandbox: boolean }): void;
  authenticate(scopes: Array<"username" | "payments">, onIncompletePaymentFound: (payment: PiPaymentDto) => void): Promise<PiAuthResult>;
  createPayment(data: { amount: number; memo: string; metadata: Record<string, unknown> }, callbacks: {
    onReadyForServerApproval: (paymentId: string) => void | Promise<void>;
    onReadyForServerCompletion: (paymentId: string, txid: string) => void | Promise<void>;
    onCancel: (paymentId: string) => void;
    onError: (error: Error, payment?: PiPaymentDto) => void;
  }): void;
};

declare global {
  interface Window { Pi?: PiSdk; }
}

const PI_TOKEN_KEY = "groupcart-pi-access-token";

export function piSandboxMode() {
  return import.meta.env.PROD ? import.meta.env.VITE_PI_SANDBOX === "true" : import.meta.env.VITE_PI_SANDBOX !== "false";
}

export function initPiSdk() {
  if (typeof window === "undefined" || !window.Pi) return false;
  window.Pi.init({ version: "2.0", sandbox: piSandboxMode() });
  return true;
}

export function getPiAccessToken() {
  try { return sessionStorage.getItem(PI_TOKEN_KEY); } catch { return null; }
}

function setPiAccessToken(token: string) {
  try { sessionStorage.setItem(PI_TOKEN_KEY, token); } catch { /* storage is optional */ }
}

async function recoverIncompletePayment(payment: PiPaymentDto) {
  if (!payment.identifier || !payment.transaction?.txid) return;
  await fetch("/api/pi/payments/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction.txid }),
  });
}

export async function authenticateWithPi() {
  if (!window.Pi) throw new Error("Open GroupCart inside Pi Browser or the Pi Sandbox to use Pi authentication.");
  const auth = await window.Pi.authenticate(["username", "payments"], payment => { void recoverIncompletePayment(payment); });
  setPiAccessToken(auth.accessToken);
  const verify = await fetch("/api/pi/verify", { method: "POST", headers: { Authorization: `Bearer ${auth.accessToken}` } });
  if (!verify.ok) throw new Error("Pi authentication could not be verified by GroupCart.");
  return auth;
}

export function createPiPayment(data: { amount: number; memo: string; metadata: Record<string, unknown> }, callbacks: {
  onReadyForServerApproval: (paymentId: string) => void | Promise<void>;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void | Promise<void>;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPaymentDto) => void;
}) {
  if (!window.Pi) throw new Error("Pi SDK is unavailable. Open GroupCart in Pi Browser or the Pi Sandbox.");
  window.Pi.createPayment(data, callbacks);
}
