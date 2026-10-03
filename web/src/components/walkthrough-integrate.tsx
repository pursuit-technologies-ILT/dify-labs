"use client";

import { GlobeIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function WalkthroughIntegrateCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GlobeIcon />
          Wire this into the shared website
        </CardTitle>
        <CardDescription>
          For developers exploring the lab — not for students. Production stays
          a single portal login; Dify is the engine behind a BFF.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          Publish the Chatflow in Studio, create an App API key, keep that key
          on the server. The browser never holds the Dify key.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs text-foreground">
{`POST {DIFY}/v1/chat-messages
Authorization: Bearer <DIFY_APP_API_KEY>
Content-Type: application/json

{
  "query": "Does my PPO cover a specialist without a referral?",
  "response_mode": "streaming",
  "user": "student:<portal_user_id>",
  "inputs": {}
}`}
        </pre>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code className="font-mono text-xs">user</code> is your tenancy
            key. Dify does not authenticate it — the portal session must.
          </li>
          <li>
            Collaborators bring their own OpenRouter key for this walkthrough.
            The website integration uses the Dify App key plus whatever model
            provider Studio is configured with.
          </li>
          <li>
            Full notes:{" "}
            <a
              className="underline underline-offset-4"
              href="https://docs.dify.ai/en/api-reference/guides/end-user-identity"
            >
              End-user identity
            </a>
            {" · "}
            <span className="text-foreground">docs/DEPLOY_AND_STUDENT_TENANCY.md</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
