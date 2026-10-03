"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpenIcon,
  KeyRoundIcon,
  MessageSquareIcon,
  PlugZapIcon,
  ShieldIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_FAQ_PROMPT,
  KEY_STORAGE_KEY,
  looksLikeOpenRouterKey,
  maskApiKey,
  MEMBER_BENEFITS_SYSTEM,
  MEMORY_FIRST_TURN,
  MEMORY_SECOND_TURN,
  OPENROUTER_MODEL,
  type ChatMessage,
} from "@/lib/openrouter";

type TestResult = {
  modelCount: number;
  hasLabModel: boolean;
  snippet: string;
};

type TranscriptLine = {
  role: "user" | "assistant";
  content: string;
};

async function proxyOpenRouter(
  key: string,
  payload: { action: "test" } | { action: "chat"; messages: ChatMessage[] },
): Promise<Record<string, unknown>> {
  const response = await fetch("/api/openrouter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-openrouter-key": key,
    },
    body: JSON.stringify(payload),
  });
  const json = (await response.json()) as Record<string, unknown>;
  if (!response.ok || json.ok !== true) {
    const error =
      typeof json.error === "string"
        ? json.error
        : "The proxy could not complete this OpenRouter call.";
    throw new Error(error);
  }
  return json;
}

export function Walkthrough() {
  const [draftKey, setDraftKey] = useState("");
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [faqPrompt, setFaqPrompt] = useState(DEFAULT_FAQ_PROMPT);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState<string | null>(null);
  const [faqReply, setFaqReply] = useState<string | null>(null);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [memoryLines, setMemoryLines] = useState<TranscriptLine[]>([]);

  useEffect(() => {
    try {
      const existing = sessionStorage.getItem(KEY_STORAGE_KEY);
      if (existing && looksLikeOpenRouterKey(existing)) {
        setStoredKey(existing);
      }
    } catch {
      // sessionStorage may be unavailable; the visitor can still paste per session in memory.
    }
    setHydrated(true);
  }, []);

  const persistKey = useCallback((value: string) => {
    try {
      sessionStorage.setItem(KEY_STORAGE_KEY, value);
    } catch {
      toast.message("Saved in this tab only — sessionStorage is blocked.");
    }
  }, []);

  const clearKey = useCallback(() => {
    setStoredKey(null);
    setDraftKey("");
    setTestResult(null);
    setTestError(null);
    setFaqReply(null);
    setMemoryLines([]);
    try {
      sessionStorage.removeItem(KEY_STORAGE_KEY);
    } catch {
      // ignore
    }
    toast.success("Key cleared from this browser tab.");
  }, []);

  const onSaveKey = useCallback(() => {
    const next = draftKey.trim();
    if (!looksLikeOpenRouterKey(next)) {
      setKeyError(
        "Use an OpenRouter key that starts with sk-or-. Get one at openrouter.ai/keys — never commit it.",
      );
      return;
    }
    setKeyError(null);
    setStoredKey(next);
    persistKey(next);
    setDraftKey("");
    toast.success("Key saved in this tab only.");
  }, [draftKey, persistKey]);

  const onTest = useCallback(async () => {
    if (!storedKey) {
      return;
    }
    setTestLoading(true);
    setTestError(null);
    try {
      const json = await proxyOpenRouter(storedKey, { action: "test" });
      setTestResult({
        modelCount: typeof json.modelCount === "number" ? json.modelCount : 0,
        hasLabModel: json.hasLabModel === true,
        snippet: typeof json.snippet === "string" ? json.snippet : "",
      });
      toast.success("OpenRouter connectivity looks good.");
    } catch (error) {
      setTestResult(null);
      setTestError(error instanceof Error ? error.message : "Connectivity test failed.");
    } finally {
      setTestLoading(false);
    }
  }, [storedKey]);

  const onFaq = useCallback(async () => {
    if (!storedKey) {
      return;
    }
    const prompt = faqPrompt.trim();
    if (!prompt) {
      setFaqError("Enter a member question first.");
      return;
    }
    setFaqLoading(true);
    setFaqError(null);
    try {
      const json = await proxyOpenRouter(storedKey, {
        action: "chat",
        messages: [
          { role: "system", content: MEMBER_BENEFITS_SYSTEM },
          { role: "user", content: prompt },
        ],
      });
      setFaqReply(typeof json.reply === "string" ? json.reply : "");
    } catch (error) {
      setFaqReply(null);
      setFaqError(error instanceof Error ? error.message : "FAQ chat failed.");
    } finally {
      setFaqLoading(false);
    }
  }, [faqPrompt, storedKey]);

  const onMemory = useCallback(async () => {
    if (!storedKey) {
      return;
    }
    setMemoryLoading(true);
    setMemoryError(null);
    setMemoryLines([]);
    try {
      const first = await proxyOpenRouter(storedKey, {
        action: "chat",
        messages: [
          { role: "system", content: MEMBER_BENEFITS_SYSTEM },
          { role: "user", content: MEMORY_FIRST_TURN },
        ],
      });
      const firstReply = typeof first.reply === "string" ? first.reply : "";
      const second = await proxyOpenRouter(storedKey, {
        action: "chat",
        messages: [
          { role: "system", content: MEMBER_BENEFITS_SYSTEM },
          { role: "user", content: MEMORY_FIRST_TURN },
          { role: "assistant", content: firstReply },
          { role: "user", content: MEMORY_SECOND_TURN },
        ],
      });
      const secondReply = typeof second.reply === "string" ? second.reply : "";
      setMemoryLines([
        { role: "user", content: MEMORY_FIRST_TURN },
        { role: "assistant", content: firstReply },
        { role: "user", content: MEMORY_SECOND_TURN },
        { role: "assistant", content: secondReply },
      ]);
    } catch (error) {
      setMemoryError(
        error instanceof Error ? error.message : "Memory walkthrough failed.",
      );
    } finally {
      setMemoryLoading(false);
    }
  }, [storedKey]);

  const masked = useMemo(
    () => (storedKey ? maskApiKey(storedKey) : null),
    [storedKey],
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 lg:max-w-5xl">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Companion walkthrough</Badge>
          <Badge variant="secondary">Not Dify itself</Badge>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dify training lab, without Docker
          </h1>
          <p className="max-w-2xl text-muted-foreground text-pretty">
            This public site is a companion to the self-hosted Dify lab
            (ports 3847 / 3848). Dify cannot run on Vercel. Paste an OpenRouter
            key, prove the model path, and walk the Member Benefits FAQ story
            the course uses in Studio — then run the real canvas locally.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            render={
              <a
                href="https://cursor.com/codebase/manutej/dify-labs"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            variant="outline"
          >
            <BookOpenIcon data-icon="inline-start" />
            Origin repo
          </Button>
          <Button
            nativeButton={false}
            render={
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            variant="outline"
          >
            <KeyRoundIcon data-icon="inline-start" />
            Get an API key
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WorkflowIcon />
              n8n replacement
            </CardTitle>
            <CardDescription>
              Course labs move from unapproved n8n to Dify Chatflow / Workflow /
              Agent canvases. Learning outcomes stay; the builder changes.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareIcon />
              Chatflow sample
            </CardTitle>
            <CardDescription>
              Local Studio ships a Member Benefits FAQ graph (Start → LLM →
              Answer) on {OPENROUTER_MODEL}. This page is that LLM step in the
              browser.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldIcon />
              Portal BFF tenancy
            </CardTitle>
            <CardDescription>
              Students never log into Studio. The portal IdP talks to a BFF,
              which calls Dify&apos;s Service API with{" "}
              <code className="font-mono text-xs">user=student:&lt;id&gt;</code>.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

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
                  onChange={(event) => {
                    setDraftKey(event.target.value);
                    setKeyError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onSaveKey();
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
          <Button onClick={onSaveKey}>Save</Button>
          <Button variant="outline" onClick={clearKey} disabled={!storedKey}>
            <Trash2Icon data-icon="inline-start" />
            Clear
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Connectivity test</CardTitle>
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
          {testLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : null}
          {testError ? (
            <Alert variant="destructive">
              <AlertTitle>OpenRouter did not accept the test</AlertTitle>
              <AlertDescription>{testError}</AlertDescription>
            </Alert>
          ) : null}
          {testResult ? (
            <Alert>
              <PlugZapIcon />
              <AlertTitle>Connected</AlertTitle>
              <AlertDescription>
                Catalog returned {testResult.modelCount} models
                {testResult.hasLabModel
                  ? `; ${OPENROUTER_MODEL} is available.`
                  : `; ${OPENROUTER_MODEL} was not listed, but the ping still ran.`}{" "}
                Ping reply: {testResult.snippet || "(empty)"}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button onClick={onTest} disabled={!storedKey || testLoading}>
            {testLoading ? <Spinner data-icon="inline-start" /> : <PlugZapIcon data-icon="inline-start" />}
            Test OpenRouter
          </Button>
        </CardFooter>
      </Card>

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
                value={faqPrompt}
                onChange={(event) => setFaqPrompt(event.target.value)}
                rows={4}
              />
            </Field>
            {!faqReply && !faqLoading && !faqError ? (
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
            {faqLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : null}
            {faqError ? (
              <Alert variant="destructive">
                <AlertTitle>FAQ request failed</AlertTitle>
                <AlertDescription>{faqError}</AlertDescription>
              </Alert>
            ) : null}
            {faqReply ? (
              <div className="rounded-lg border bg-muted/40 p-4 text-sm whitespace-pre-wrap">
                {faqReply}
              </div>
            ) : null}
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button onClick={onFaq} disabled={!storedKey || faqLoading}>
            {faqLoading ? <Spinner data-icon="inline-start" /> : null}
            Send FAQ prompt
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Optional: remember plan type</CardTitle>
          <CardDescription>
            Module 2 maps n8n memory nodes to Chatflow conversation variables.
            This two-turn call shows the idea: the member states HDHP, then
            asks about the deductible. Dify persists that in Postgres; this
            demo only sends prior turns in the request.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {memoryLines.length === 0 && !memoryLoading && !memoryError ? (
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
          {memoryLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : null}
          {memoryError ? (
            <Alert variant="destructive">
              <AlertTitle>Memory walkthrough failed</AlertTitle>
              <AlertDescription>{memoryError}</AlertDescription>
            </Alert>
          ) : null}
          {memoryLines.map((line, index) => (
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
            onClick={onMemory}
            disabled={!storedKey || memoryLoading}
          >
            {memoryLoading ? <Spinner data-icon="inline-start" /> : null}
            Run two-turn memory demo
          </Button>
        </CardFooter>
      </Card>

      <Separator />

      <section className="flex flex-col gap-3 text-sm text-muted-foreground">
        <h2 className="text-foreground text-lg font-medium">
          What this page is not
        </h2>
        <p>
          The Dify canvas, Weaviate knowledge, plugin daemon, and portal BFF
          live in Docker on localhost:3847. See{" "}
          <code className="font-mono text-xs">docs/HANDOFF.md</code> in the
          repo for operator steps, tenancy, and what not to commit. Origin:{" "}
          <a
            className="underline underline-offset-4"
            href="https://cursor.com/codebase/manutej/dify-labs"
          >
            manutej/dify-labs
          </a>
          .
        </p>
      </section>
    </div>
  );
}
