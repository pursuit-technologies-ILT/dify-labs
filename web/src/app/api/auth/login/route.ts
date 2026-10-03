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

export async function POST(request: Request) {
  const ip = clientKeyFromRequest(request);
  if (isLoginBlocked(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429 },
    );
  }

  if (!isCollabGateConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Collaborator login is not configured on this deployment." },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body.password === "string") {
      password = body.password;
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request body must be JSON." },
      { status: 400 },
    );
  }

  if (!passwordsMatch(password)) {
    recordFailedLogin(ip);
    await delayFailedLogin();
    return NextResponse.json(
      { ok: false, error: "That password is not correct." },
      { status: 401 },
    );
  }

  recordSuccessfulLogin(ip);
  const response = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(
    COLLAB_COOKIE_NAME,
    createSessionToken(),
    collabCookieOptions(secure),
  );
  return response;
}
