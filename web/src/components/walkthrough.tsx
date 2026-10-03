"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
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
import { WalkthroughCanvasCard } from "@/components/walkthrough-canvas";
import { WalkthroughFaqCard } from "@/components/walkthrough-faq";
import { WalkthroughFooter } from "@/components/walkthrough-footer";
import { WalkthroughIntegrateCard } from "@/components/walkthrough-integrate";
import { WalkthroughKeyCard } from "@/components/walkthrough-key";
import { WalkthroughMemoryCard } from "@/components/walkthrough-memory";
import { WalkthroughTestCard } from "@/components/walkthrough-test";
import {
  DEFAULT_FAQ_PROMPT,
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
import {
  clearStoredKey,
  useStoredOpenRouterKey,
  writeStoredKey,
} from "@/lib/openrouter-session";

export function Walkthrough() {
  const router = useRouter();
  const storedKey = useStoredOpenRouterKey();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [draftKey, setDraftKey] = useState("");
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

  const persistKey = useCallback((value: string) => {
    const ok = writeStoredKey(value);
    if (!ok) {
      toast.message("Saved in this tab only — sessionStorage is blocked.");
    }
  }, []);

  const clearKey = useCallback(() => {
    setDraftKey("");
    setTestResult(null);
    setTestError(null);
    setFaqReply(null);
    setMemoryLines([]);
    clearStoredKey();
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

  const onLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Cookie clear is best-effort; send the visitor to login anyway.
    }
    router.replace("/login");
    router.refresh();
  }, [router]);

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
          <Badge variant="secondary">Demo shared login</Badge>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dify training lab walkthrough
          </h1>
          <p className="max-w-2xl text-muted-foreground text-pretty">
            One shared password gets you in. Paste your own OpenRouter key to
            test calls. Open the live Member Benefits FAQ canvas without a
            second login. Dify is not on Vercel — Studio is tunneled from this
            lab. Chat on this page uses your key (sessionStorage +
            x-openrouter-key); nothing is hardcoded.
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
          <Button variant="ghost" onClick={onLogout}>
            Sign out
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
      <WalkthroughCanvasCard />
      <WalkthroughIntegrateCard />
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
      <WalkthroughFooter />
    </div>
  );
}
