import { NextResponse } from "next/server";

import { COLLAB_COOKIE_NAME, collabCookieOptions } from "@/lib/collab-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(COLLAB_COOKIE_NAME, "", {
    ...collabCookieOptions(secure),
    maxAge: 0,
  });
  return response;
}
