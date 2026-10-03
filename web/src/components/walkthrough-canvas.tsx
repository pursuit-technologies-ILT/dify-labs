"use client";

import { ExternalLinkIcon, WorkflowIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  canvasUrl,
  DIFY_ADMIN_EMAIL,
  studioBaseUrl,
  studioSigninUrl,
} from "@/lib/collab-config";

export function WalkthroughCanvasCard() {
  const studio = studioBaseUrl();
  const canvas = canvasUrl();
  const signin = studioSigninUrl();
  const live = Boolean(canvas);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WorkflowIcon />
          2. Open the real Dify canvas
        </CardTitle>
        <CardDescription>
          Member Benefits FAQ Chatflow (Start → LLM → Answer). This is the
          Studio editor, not a screenshot. Chat/test on this page still uses
          the OpenRouter key you pasted above. Studio LLM nodes may keep using
          the lab provider until someone pastes a key in Dify model settings —
          you do not need to re-enter the key if walkthrough chat already works.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {live ? (
          <>
            <p className="text-sm text-muted-foreground">
              Same-tab open is the reliable path (Studio cookies belong to the
              tunnel host). An iframe is shown when the tunnel allows embedding.
            </p>
            <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
              <iframe
                title="Dify Member Benefits FAQ canvas"
                src={canvas ?? undefined}
                className="h-[min(70vh,640px)] w-full bg-background"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </>
        ) : (
          <Alert>
            <WorkflowIcon />
            <AlertTitle>Public Studio URL not set</AlertTitle>
            <AlertDescription>
              Set NEXT_PUBLIC_DIFY_STUDIO_URL on Vercel to the HTTPS tunnel in
              front of Dify nginx :3847. Local operators can use
              http://localhost:3847 (not 127.0.0.1).
            </AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground">
          If Dify shows its own sign-in, use {DIFY_ADMIN_EMAIL} and the same
          collaborator password as this site. Do not create a second password.
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {canvas ? (
          <Button
            nativeButton={false}
            render={<a href={canvas} target="_self" rel="noreferrer" />}
          >
            <ExternalLinkIcon data-icon="inline-start" />
            Open canvas
          </Button>
        ) : (
          <Button
            nativeButton={false}
            render={
              <a href="http://localhost:3847/app/2615218e-4cd3-4f56-bad4-866a62c93627/workflow" />
            }
            variant="outline"
          >
            Local canvas
          </Button>
        )}
        {signin ? (
          <Button
            nativeButton={false}
            render={<a href={signin} target="_self" rel="noreferrer" />}
            variant="outline"
          >
            Studio sign-in
          </Button>
        ) : null}
        {studio ? (
          <span className="text-muted-foreground text-xs break-all">{studio}</span>
        ) : null}
      </CardFooter>
    </Card>
  );
}
