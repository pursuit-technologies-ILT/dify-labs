"use client";

import { KeyRoundIcon, Trash2Icon } from "lucide-react";

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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type WalkthroughKeyCardProps = {
  hydrated: boolean;
  draftKey: string;
  masked: string | null;
  keyError: string | null;
  storedKey: string | null;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  onClear: () => void;
};

export function WalkthroughKeyCard({
  hydrated,
  draftKey,
  masked,
  keyError,
  storedKey,
  onDraftChange,
  onSave,
  onClear,
}: WalkthroughKeyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Paste your OpenRouter key</CardTitle>
        <CardDescription>
          Create a key at{" "}
          <a
            className="underline underline-offset-4"
            href="https://openrouter.ai/keys"
          >
            openrouter.ai/keys
          </a>
          . It stays in this tab&apos;s sessionStorage and is sent only as a
          request header to our proxy. We never persist it on the server or
          echo the full value after save.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hydrated ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-40" />
          </div>
        ) : (
          <FieldGroup>
            <Field data-invalid={keyError ? true : undefined}>
              <FieldLabel htmlFor="openrouter-key">OPENROUTER_API_KEY</FieldLabel>
              <Input
                id="openrouter-key"
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder="sk-or-…"
                value={draftKey}
                aria-invalid={keyError ? true : undefined}
                onChange={(event) => onDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSave();
                  }
                }}
              />
              <FieldDescription>
                Format check only: keys must start with sk-or-. Clear the key
                when you are done.
              </FieldDescription>
              {keyError ? (
                <p className="text-sm text-destructive">{keyError}</p>
              ) : null}
            </Field>
            {masked ? (
              <Alert>
                <KeyRoundIcon />
                <AlertTitle>Key on this tab</AlertTitle>
                <AlertDescription>
                  Saved as {masked}. Reload keeps it until you close the tab
                  or click Clear.
                </AlertDescription>
              </Alert>
            ) : (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <KeyRoundIcon />
                  </EmptyMedia>
                  <EmptyTitle>No key in this tab yet</EmptyTitle>
                  <EmptyDescription>
                    Paste a key and Save to unlock the connectivity test and
                    FAQ chat. Nothing is stored in git or on Vercel.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </FieldGroup>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={onSave}>Save</Button>
        <Button variant="outline" onClick={onClear} disabled={!storedKey}>
          <Trash2Icon data-icon="inline-start" />
          Clear
        </Button>
      </CardFooter>
    </Card>
  );
}
