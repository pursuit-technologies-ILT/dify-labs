export const DIFY_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_DIFY_ADMIN_EMAIL ?? "lab-admin@example.com";

export const DIFY_CANVAS_PATH =
  process.env.NEXT_PUBLIC_DIFY_CANVAS_PATH ??
  "/app/2615218e-4cd3-4f56-bad4-866a62c93627/workflow";

export const COLLAB_TEARDOWN_DATE =
  process.env.NEXT_PUBLIC_COLLAB_EXPIRES ?? "2026-10-06";

export const MEMBER_BENEFITS_APP_ID = "2615218e-4cd3-4f56-bad4-866a62c93627";

export function studioBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_DIFY_STUDIO_URL ?? "").replace(/\/$/, "");
}

export function canvasUrl(): string | null {
  const base = studioBaseUrl();
  if (!base) {
    return null;
  }
  const path = DIFY_CANVAS_PATH.startsWith("/")
    ? DIFY_CANVAS_PATH
    : `/${DIFY_CANVAS_PATH}`;
  return `${base}${path}`;
}

export function studioSigninUrl(): string | null {
  const base = studioBaseUrl();
  if (!base) {
    return null;
  }
  return `${base}/signin`;
}
