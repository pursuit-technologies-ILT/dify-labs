"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpenIcon,
  KeyRoundIcon,
  MessageSquareIcon,
  ShieldIcon,
  WorkflowIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WalkthroughFaqCard } from "@/components/walkthrough-faq";
import { WalkthroughKeyCard } from "@/components/walkthrough-key";
import { WalkthroughMemoryCard } from "@/components/walkthrough-memory";
import { WalkthroughTestCard } from "@/components/walkthrough-test";
import {
  DEFAULT_FAQ_PROMPT,
  KEY_STORAGE_KEY,
  looksLikeOpenRouterKey,
  maskApiKey,
  MEMBER_BENEFITS_SYSTEM,
  MEMORY_FIRST_TURN,
  MEMORY_SECOND_TURN,
  OPENROUTER_MODEL,
} from "@/lib/openrouter";
import {
  proxyOpenRouter,
  type TestResult,
  type TranscriptLine,
} from "@/lib/walkthrough-client";

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

      <WalkthroughKeyCard
        hydrated={hydrated}
        draftKey={draftKey}
        masked={masked}
        keyError={keyError}
        storedKey={storedKey}
        onDraftChange={(value) => {
          setDraftKey(value);
          setKeyError(null);
        }}
        onSave={onSaveKey}
        onClear={clearKey}
      />
      <WalkthroughTestCard
        storedKey={storedKey}
        loading={testLoading}
        error={testError}
        result={testResult}
        onTest={onTest}
      />
      <WalkthroughFaqCard
        storedKey={storedKey}
        prompt={faqPrompt}
        loading={faqLoading}
        error={faqError}
        reply={faqReply}
        onPromptChange={setFaqPrompt}
        onSend={onFaq}
      />
      <WalkthroughMemoryCard
        storedKey={storedKey}
        loading={memoryLoading}
        error={memoryError}
        lines={memoryLines}
        onRun={onMemory}
      />

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
