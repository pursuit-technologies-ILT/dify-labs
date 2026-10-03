import { createHmac, timingSafeEqual } from "node:crypto";

export const COLLAB_COOKIE_NAME = "dl_collab_session";
export const COLLAB_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 3;

function collabPassword(): string {
  return process.env.COLLAB_PASSWORD ?? process.env.DEMO_PASSWORD ?? "";
}

function sessionSecret(): string {
  const explicit = process.env.COLLAB_SESSION_SECRET?.trim();
  if (explicit) {
    return explicit;
  }
  const password = collabPassword();
  if (!password) {
    return "";
  }
  return createHmac("sha256", "dify-labs-collab-gate")
    .update(password)
    .digest("hex");
}

export function isCollabGateConfigured(): boolean {
  return collabPassword().length > 0 && sessionSecret().length > 0;
}

function sha256Hmac(secret: string, value: string): Buffer {
  return createHmac("sha256", secret).update(value).digest();
}

function buffersEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function passwordsMatch(candidate: string): boolean {
  const expected = collabPassword();
  if (!expected || !candidate) {
    return false;
  }
  const left = sha256Hmac("collab-password-compare", candidate);
  const right = sha256Hmac("collab-password-compare", expected);
  return buffersEqual(left, right);
}

export function createSessionToken(nowMs = Date.now()): string {
  const secret = sessionSecret();
  const expiresAt = nowMs + COLLAB_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${nowMs}.${expiresAt}`;
  const signature = sha256Hmac(secret, payload).toString("hex");
  return `${payload}.${signature}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token || !isCollabGateConfigured()) {
    return false;
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }
  const [issuedRaw, expiresRaw, signatureHex] = parts;
  if (!/^\d+$/.test(issuedRaw) || !/^\d+$/.test(expiresRaw) || !/^[0-9a-f]{64}$/.test(signatureHex)) {
    return false;
  }
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }
  const payload = `${issuedRaw}.${expiresRaw}`;
  const expected = sha256Hmac(sessionSecret(), payload);
  let provided: Buffer;
  try {
    provided = Buffer.from(signatureHex, "hex");
  } catch {
    return false;
  }
  return buffersEqual(expected, provided);
}

export function collabCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: COLLAB_SESSION_MAX_AGE_SECONDS,
  };
}
