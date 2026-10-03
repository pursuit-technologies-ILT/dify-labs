import { NextResponse, type NextRequest } from "next/server";

import { COLLAB_COOKIE_NAME, isValidSessionToken } from "@/lib/collab-auth";

function isPublicPath(pathname: string): boolean {
  // Allow query strings like /login?error=password
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return true;
  }
  if (pathname === "/api/auth/login") {
    return true;
  }
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) {
    if (pathname === "/login") {
      const token = request.cookies.get(COLLAB_COOKIE_NAME)?.value;
      if (isValidSessionToken(token)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(COLLAB_COOKIE_NAME)?.value;
  if (isValidSessionToken(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, error: "Sign in with the collaborator password first." },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
