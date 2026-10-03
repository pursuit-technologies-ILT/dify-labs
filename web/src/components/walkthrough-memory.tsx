"use client";

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
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { TranscriptLine } from "@/lib/walkthrough-client";

type WalkthroughMemoryCardProps = {
  storedKey: string | null;
  loading: boolean;
  error: string | null;
  lines: TranscriptLine[];
  onRun: () => void;
};

export function WalkthroughMemoryCard({
  storedKey,
  loading,
  error,
  lines,
  onRun,
}: WalkthroughMemoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>5. Optional: remember plan type</CardTitle>
        <CardDescription>
          Module 2 maps n8n memory nodes to Chatflow conversation variables.
          This two-turn call shows the idea: the member states HDHP, then
          asks about the deductible. Dify persists that in Postgres; this
          demo only sends prior turns in the request.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {lines.length === 0 && !loading && !error ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>Two-turn memory demo idle</EmptyTitle>
              <EmptyDescription>
                Runs “I am on an HDHP” then a deductible follow-up without
                restating the plan type.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : null}
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Memory walkthrough failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {lines.map((line, index) => (
          <div
            key={`${line.role}-${index}`}
            className="rounded-lg border p-3 text-sm"
          >
            <p className="mb-1 font-medium">
              {line.role === "user" ? "Member" : "FAQ agent"}
            </p>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {line.content}
            </p>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button
          variant="secondary"
          onClick={onRun}
          disabled={!storedKey || loading}
        >
          {loading ? <Spinner data-icon="inline-start" /> : null}
          Run two-turn memory demo
        </Button>
      </CardFooter>
    </Card>
  );
}
