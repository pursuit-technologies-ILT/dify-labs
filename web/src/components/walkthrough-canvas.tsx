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
import { canvasUrl, studioBaseUrl } from "@/lib/collab-config";

export function WalkthroughCanvasCard() {
  const studio = studioBaseUrl();
  const canvas = canvasUrl();
  const live = Boolean(studio);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WorkflowIcon />
          2. Open the live Dify canvas
        </CardTitle>
        <CardDescription>
          One password already signed you in here. Open canvas uses a short-lived
          ticket so Dify Studio does not ask for a second login. This is the
          real Start → LLM → Answer Chatflow, not a screenshot.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {live ? (
          <p className="text-sm text-muted-foreground">
            Studio opens on the tunneled host (required for Dify cookies and
            localStorage). Bring your own OpenRouter key on this page for chat
            tests; paste it in Dify model settings only if you want Studio LLM
            nodes to use your key instead of the lab provider.
          </p>
        ) : (
          <Alert>
            <WorkflowIcon />
            <AlertTitle>Public Studio URL not set</AlertTitle>
            <AlertDescription>
              Set NEXT_PUBLIC_DIFY_STUDIO_URL to the HTTPS tunnel in front of
              Dify nginx :3847, then redeploy. Local operators can use
              http://localhost:3847 (not 127.0.0.1).
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {live ? (
          <Button
            nativeButton={false}
            render={<a href="/api/auth/studio-launch" target="_self" />}
          >
            <ExternalLinkIcon data-icon="inline-start" />
            Open Dify canvas
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
        {canvas ? (
          <Button
            nativeButton={false}
            render={<a href={canvas} target="_self" rel="noreferrer" />}
            variant="outline"
          >
            Canvas URL only
          </Button>
        ) : null}
        {studio ? (
          <span className="text-muted-foreground text-xs break-all">{studio}</span>
        ) : null}
      </CardFooter>
    </Card>
  );
}
