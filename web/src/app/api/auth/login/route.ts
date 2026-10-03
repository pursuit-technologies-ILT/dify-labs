import { NextResponse } from "next/server";

import {
  collabCookieOptions,
  COLLAB_COOKIE_NAME,
  createSessionToken,
  isCollabGateConfigured,
  passwordsMatch,
} from "@/lib/collab-auth";
import {
  clientKeyFromRequest,
  delayFailedLogin,
  isLoginBlocked,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/lib/collab-rate-limit";

async function readPassword(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const value = form.get("password");
    return typeof value === "string" ? value : "";
  }
  try {
    const body = (await request.json()) as { password?: unknown };
    return typeof body.password === "string" ? body.password : "";
  } catch {
    return "";
  }
}

function wantsBrowserRedirect(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  const contentType = request.headers.get("content-type") ?? "";
  return (
    accept.includes("text/html") ||
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  );
}

function requestOrigin(request: Request): string {
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    new URL(request.url).protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    new URL(request.url).host;
  return `${proto}://${host}`;
}

function isHttpsRequest(request: Request): boolean {
  return requestOrigin(request).startsWith("https://");
}

export async function POST(request: Request) {
  const ip = clientKeyFromRequest(request);
  const browser = wantsBrowserRedirect(request);

  const origin = requestOrigin(request);

  if (isLoginBlocked(ip)) {
    if (browser) {
      return NextResponse.redirect(new URL("/login?error=rate", origin), 303);
    }
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429 },
    );
  }

  if (!isCollabGateConfigured()) {
    if (browser) {
      return NextResponse.redirect(new URL("/login?error=config", origin), 303);
    }
    return NextResponse.json(
      { ok: false, error: "Collaborator login is not configured on this deployment." },
      { status: 503 },
    );
  }

  const password = await readPassword(request);

  if (!passwordsMatch(password)) {
    recordFailedLogin(ip);
    await delayFailedLogin();
    if (browser) {
      return NextResponse.redirect(
        new URL("/login?error=password", origin),
        303,
      );
    }
    return NextResponse.json(
      { ok: false, error: "That password is not correct." },
      { status: 401 },
    );
  }

  recordSuccessfulLogin(ip);
  const secure = isHttpsRequest(request) || process.env.NODE_ENV === "production";
  const cookie = {
    name: COLLAB_COOKIE_NAME,
    value: createSessionToken(),
    ...collabCookieOptions(secure),
  };

  if (browser) {
    const response = NextResponse.redirect(new URL("/", origin), 303);
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
      path: cookie.path,
      maxAge: cookie.maxAge,
    });
    return response;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });
  return response;
}
