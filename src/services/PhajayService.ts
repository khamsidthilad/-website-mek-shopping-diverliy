/**
 * PhaJay Payment QR integration
 * Docs: https://payment-doc.lailaolab.com/v1/connect-payment-QR/generateQR
 * Keys: https://portal.phajay.co/la/private/key-management
 */

export type PhajayBank = "bcel" | "jdb" | "ldb" | "ib" | "stb" | "m-money";

export interface GenerateQrInput {
  amount: number;
  description: string;
  bank?: PhajayBank;
  tag1?: string;
  tag2?: string;
  tag3?: string;
}

export interface GenerateQrResult {
  message: string;
  transactionId: string;
  qrCode: string;
  link: string;
  bank: PhajayBank;
  qrImageUrl: string;
}

export interface PhajayWebhookPayload {
  message?: string;
  transactionId?: string;
  status?: string;
  txnAmount?: number;
  paymentMethod?: string;
  description?: string;
  tag1?: string;
  tag2?: string;
  tag3?: string;
  tag4?: string;
  tag5?: string;
  tag6?: string;
  billNumber?: string;
  refNo?: string | number;
  [key: string]: unknown;
}

const BANK_PATHS: Record<PhajayBank, string> = {
  bcel: "generate-bcel-qr",
  jdb: "generate-jdb-qr",
  ldb: "generate-ldb-qr",
  ib: "generate-ib-qr",
  stb: "generate-stb-qr",
  "m-money": "generate-m-money-qr",
};

function stripQuotes(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

function resolveBank(raw?: string): PhajayBank {
  const bank = (raw ?? process.env.PHAJAY_BANK ?? "bcel")
    .trim()
    .toLowerCase() as PhajayBank;
  if (!(bank in BANK_PATHS)) {
    throw new Error(
      `Unsupported PhaJay bank "${raw}". Use: bcel, jdb, ldb, ib, stb, m-money`,
    );
  }
  return bank;
}

function isSandbox(): boolean {
  return (process.env.PHAJAY_SANDBOX ?? "true").trim().toLowerCase() === "true";
}

/**
 * Sandbox / not-KYC → use public (test) key as secretKey header.
 * Production KYC → use PHAJAY_SECRET_KEY from portal Key Management.
 */
function resolveSecretKey(): string {
  const sandbox = isSandbox();
  const secret = stripQuotes(process.env.PHAJAY_SECRET_KEY);
  const publicKey = stripQuotes(process.env.PHAJAY_PUBLIC_KEY);
  const devKey = stripQuotes(process.env.PHAJAY_DEV_KEY);

  if (sandbox) {
    const key = publicKey || devKey;
    if (!key || key.includes("paste-your") || key.includes("your-")) {
      throw new Error(
        "Missing PhaJay public/test key. Set PHAJAY_PUBLIC_KEY from https://portal.phajay.co/la/private/key-management",
      );
    }
    return key;
  }

  if (!secret || secret.includes("your-") || secret.includes("paste-your")) {
    throw new Error(
      "Missing PhaJay production secretKey. Set PHAJAY_SECRET_KEY (or enable PHAJAY_SANDBOX=true for testing).",
    );
  }
  return secret;
}

function gatewayBase(): string {
  return (
    stripQuotes(process.env.PHAJAY_GATEWAY_URL) ||
    "https://payment-gateway.phajay.co"
  ).replace(/\/$/, "");
}

function buildGenerateUrl(bank: PhajayBank): string {
  const path = BANK_PATHS[bank];
  const prefix = isSandbox()
    ? "/v1/api/test/payment/"
    : "/v1/api/payment/";
  return `${gatewayBase()}${prefix}${path}`;
}

/** ASCII-only description for BCEL (docs: no Lao/Thai characters). */
function sanitizeDescription(description: string, bank: PhajayBank): string {
  const trimmed = description.trim().slice(0, 120);
  if (bank === "bcel") {
    return trimmed.replace(/[^\x20-\x7E]/g, "").trim() || "Order payment";
  }
  return trimmed || "Order payment";
}

class PhajayService {
  public async generateQr(input: GenerateQrInput): Promise<GenerateQrResult> {
    const bank = resolveBank(input.bank);
    const amount = Number(input.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Payment amount must be a positive number");
    }

    const body = {
      amount: Math.round(amount),
      description: sanitizeDescription(input.description, bank),
      ...(input.tag1 ? { tag1: String(input.tag1) } : {}),
      ...(input.tag2 ? { tag2: String(input.tag2) } : {}),
      ...(input.tag3 ? { tag3: String(input.tag3) } : {}),
    };

    const url = buildGenerateUrl(bank);
    const secretKey = resolveSecretKey();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error(
        `PhaJay returned non-JSON (${response.status}): ${text.slice(0, 200)}`,
      );
    }

    if (!response.ok) {
      throw new Error(
        `PhaJay QR failed (${response.status}): ${
          (data.message as string) || text.slice(0, 200)
        }`,
      );
    }

    const transactionId = String(
      data.transactionId ?? data.transactionID ?? "",
    );
    const qrCode = String(data.qrCode ?? "");
    const link = String(data.link ?? "");

    if (!transactionId || !qrCode) {
      throw new Error(
        `PhaJay response missing transactionId/qrCode: ${JSON.stringify(data)}`,
      );
    }

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&data=${encodeURIComponent(qrCode)}`;

    return {
      message: String(data.message ?? "SUCCESS"),
      transactionId,
      qrCode,
      link,
      bank,
      qrImageUrl,
    };
  }

  public isPaymentCompleted(payload: PhajayWebhookPayload): boolean {
    const status = String(payload.status ?? "").toUpperCase();
    return (
      status === "PAYMENT_COMPLETED" ||
      status === "SUCCESS" ||
      status === "COMPLETED" ||
      status === "PAID"
    );
  }

  public parseOrderIdFromTags(payload: PhajayWebhookPayload): number | null {
    for (const key of ["tag3", "tag2", "tag1"] as const) {
      const raw = payload[key];
      if (raw == null || raw === "") continue;
      const n = parseInt(String(raw).replace(/^ORDER-/i, ""), 10);
      if (Number.isInteger(n) && n > 0) return n;
    }
    return null;
  }
}

export default new PhajayService();
