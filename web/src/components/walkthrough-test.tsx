"use client";

import { PlugZapIcon } from "lucide-react";

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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { OPENROUTER_MODEL } from "@/lib/openrouter";
import type { TestResult } from "@/lib/walkthrough-client";

type WalkthroughTestCardProps = {
  storedKey: string | null;
  loading: boolean;
  error: string | null;
  result: TestResult | null;
  onTest: () => void;
};

export function WalkthroughTestCard({
  storedKey,
  loading,
  error,
  result,
  onTest,
}: WalkthroughTestCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Connectivity test</CardTitle>
        <CardDescription>
          Lists models and runs a tiny completion on{" "}
          <code className="font-mono text-xs">{OPENROUTER_MODEL}</code> — the
          same light model the lab Chatflow uses.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!storedKey ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PlugZapIcon />
              </EmptyMedia>
              <EmptyTitle>Save a key first</EmptyTitle>
              <EmptyDescription>
                The test button stays idle until a valid key is in this tab.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : null}
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>OpenRouter did not accept the test</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {result ? (
          <Alert>
            <PlugZapIcon />
            <AlertTitle>Connected</AlertTitle>
            <AlertDescription>
              Catalog returned {result.modelCount} models
              {result.hasLabModel
                ? `; ${OPENROUTER_MODEL} is available.`
                : `; ${OPENROUTER_MODEL} was not listed, but the ping still ran.`}{" "}
              Ping reply: {result.snippet || "(empty)"}
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button onClick={onTest} disabled={!storedKey || loading}>
          {loading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <PlugZapIcon data-icon="inline-start" />
          )}
          Test OpenRouter
        </Button>
      </CardFooter>
    </Card>
  );
}
