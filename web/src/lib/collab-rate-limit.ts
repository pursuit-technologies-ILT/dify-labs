type Bucket = {
  failures: number;
  windowStartMs: number;
  blockedUntilMs: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const BLOCK_MS = 15 * 60 * 1000;
const FAIL_DELAY_MS = 700;

const buckets = new Map<string, Bucket>();

function now(): number {
  return Date.now();
}

function prune(ip: string, at: number): Bucket {
  const existing = buckets.get(ip);
  if (!existing || at - existing.windowStartMs > WINDOW_MS) {
    const fresh: Bucket = { failures: 0, windowStartMs: at, blockedUntilMs: 0 };
    buckets.set(ip, fresh);
    return fresh;
  }
  return existing;
}

export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

export function isLoginBlocked(ip: string): boolean {
  const at = now();
  const bucket = prune(ip, at);
  return bucket.blockedUntilMs > at;
}

export async function delayFailedLogin(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, FAIL_DELAY_MS);
  });
}

export function recordFailedLogin(ip: string): void {
  const at = now();
  const bucket = prune(ip, at);
  bucket.failures += 1;
  if (bucket.failures >= MAX_FAILURES) {
    bucket.blockedUntilMs = at + BLOCK_MS;
  }
  buckets.set(ip, bucket);
}

export function recordSuccessfulLogin(ip: string): void {
  buckets.delete(ip);
}
