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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type WalkthroughFaqCardProps = {
  storedKey: string | null;
  prompt: string;
  loading: boolean;
  error: string | null;
  reply: string | null;
  onPromptChange: (value: string) => void;
  onSend: () => void;
};

export function WalkthroughFaqCard({
  storedKey,
  prompt,
  loading,
  error,
  reply,
  onPromptChange,
  onSend,
}: WalkthroughFaqCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Member Benefits FAQ</CardTitle>
        <CardDescription>
          Module 1 of the course: a Chat App that answers synthetic member
          questions. In Docker this is a Dify Chatflow. Here it is the same
          system prompt against OpenRouter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="faq-prompt">Member question</FieldLabel>
            <Textarea
              id="faq-prompt"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              rows={4}
            />
          </Field>
          {!reply && !loading && !error ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>No reply yet</EmptyTitle>
                <EmptyDescription>
                  Send the prompt to see how the lab model answers a benefits
                  FAQ. Full canvas editing still requires self-hosted Dify.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>FAQ request failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {reply ? (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm whitespace-pre-wrap">
              {reply}
            </div>
          ) : null}
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={onSend} disabled={!storedKey || loading}>
          {loading ? <Spinner data-icon="inline-start" /> : null}
          Send FAQ prompt
        </Button>
      </CardFooter>
    </Card>
  );
}
