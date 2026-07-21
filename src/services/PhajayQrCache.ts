/**
 * Cache PhaJay QR per order to avoid TOO_MANY_REQUESTS (429)
 * when React Strict Mode / remounts call generate twice.
 */

export interface CachedQr {
  orderId: number;
  amount: number;
  currency: string;
  bank: string;
  transactionId: string;
  qrCode: string;
  qrImageUrl: string;
  deepLink: string;
  paymentStatus: string;
  createdAt: number;
}

type GlobalCache = {
  byOrder: Map<number, CachedQr>;
  inflight: Map<number, Promise<CachedQr>>;
};

function store(): GlobalCache {
  const g = globalThis as typeof globalThis & { __phajayQrCache?: GlobalCache };
  if (!g.__phajayQrCache) {
    g.__phajayQrCache = {
      byOrder: new Map(),
      inflight: new Map(),
    };
  }
  return g.__phajayQrCache;
}

const TTL_MS = 15 * 60 * 1000;

export function getCachedQr(orderId: number): CachedQr | null {
  const s = store();
  const hit = s.byOrder.get(orderId);
  if (!hit) return null;
  if (Date.now() - hit.createdAt > TTL_MS) {
    s.byOrder.delete(orderId);
    return null;
  }
  return hit;
}

export function setCachedQr(qr: Omit<CachedQr, "createdAt">): CachedQr {
  const full: CachedQr = { ...qr, createdAt: Date.now() };
  store().byOrder.set(qr.orderId, full);
  return full;
}

export function clearCachedQr(orderId: number): void {
  const s = store();
  s.byOrder.delete(orderId);
  s.inflight.delete(orderId);
}

export async function withQrInflight(
  orderId: number,
  factory: () => Promise<CachedQr>,
): Promise<CachedQr> {
  const s = store();
  const existing = s.inflight.get(orderId);
  if (existing) return existing;

  const promise = factory().finally(() => {
    s.inflight.delete(orderId);
  });
  s.inflight.set(orderId, promise);
  return promise;
}
