import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  COLLAB_COOKIE_NAME,
  createStudioTicket,
  isValidSessionToken,
} from "@/lib/collab-auth";
import { DIFY_CANVAS_PATH, studioBaseUrl } from "@/lib/collab-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const jar = await cookies();
  if (!isValidSessionToken(jar.get(COLLAB_COOKIE_NAME)?.value)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const studio = studioBaseUrl();
  if (!studio) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "NEXT_PUBLIC_DIFY_STUDIO_URL is not set. Start the Dify tunnel, then redeploy.",
      },
      { status: 503 },
    );
  }

  const ticket = createStudioTicket();
  const nextPath = DIFY_CANVAS_PATH.startsWith("/")
    ? DIFY_CANVAS_PATH
    : `/${DIFY_CANVAS_PATH}`;
  const target = new URL("/collab-sso", `${studio}/`);
  target.searchParams.set("ticket", ticket);
  target.searchParams.set("next", nextPath);
  return NextResponse.redirect(target);
}
