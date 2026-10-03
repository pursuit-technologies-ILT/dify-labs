"use client";

import { COLLAB_TEARDOWN_DATE } from "@/lib/collab-config";

export function WalkthroughFooter() {
  return (
    <footer className="flex flex-col gap-3 text-sm text-muted-foreground">
      <h2 className="text-foreground text-lg font-medium">Teardown</h2>
      <p>
        This shared password, any public Dify tunnel, and public Studio access
        expire about <strong className="text-foreground">{COLLAB_TEARDOWN_DATE}</strong>{" "}
        (three days from 2026-10-03). Demo-only — not the production portal-BFF
        student path.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Remove Vercel env COLLAB_PASSWORD / DEMO_PASSWORD / COLLAB_SESSION_SECRET.</li>
        <li>Take down the Cloudflare (or other) tunnel to :3847.</li>
        <li>
          Restore Dify CONSOLE_WEB_URL and related URLs to http://localhost:3847.
        </li>
        <li>Restore the Dify admin password and disable public Studio.</li>
        <li>Do not leave a shared Studio password on a public hostname.</li>
      </ul>
    </footer>
  );
}
